import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calculateOrderTotals, generateOrderNumber, PricingError } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkoutSchema } from "@/lib/validations/checkout";
import { apiSuccess, apiError, apiErrors, apiErrorFromZod } from "@/lib/api-response";

// -----------------------------------------------------------------------
// The core transactional flow described in the architecture doc §4:
//   1. Resolve the caller's own cart (never a client-submitted item list).
//   2. Inside one $transaction: re-price every line from the DB, validate
//      the coupon, conditionally decrement stock (WHERE stock >= qty), and
//      create the Order + OrderItems. If any stock decrement affects 0
//      rows, the whole transaction rolls back — no partial oversold order.
//   3. Create the Razorpay order (or mark COD orders paid-on-delivery).
//   4. Clear the cart only after the order is durably created.
// -----------------------------------------------------------------------

export async function POST(request: Request) {
  const session = await auth();
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const data = parsed.data;
  const cart = await getOrCreateCart(session?.user?.id);

  if (cart.items.length === 0) {
    return apiError("EMPTY_CART", "Your cart is empty.", 400);
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-price from the DB inside the transaction (not from cart
      // snapshots) so stock/price checks and the reservation below see a
      // consistent view of the world.
      const totals = await calculateOrderTotals(
        cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })),
        data.couponCode,
        tx
      );

      // Conditionally decrement stock. If a concurrent checkout already
      // took the last unit, the affected-row count is 0 and we throw —
      // the transaction rolls back, nothing is oversold.
      for (const item of totals.items) {
        if (item.variantId) {
          const result = await tx.productVariant.updateMany({
            where: { id: item.variantId, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (result.count === 0) {
            throw new PricingError(`"${item.productName}" just sold out in your size.`, "OUT_OF_STOCK");
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        } else {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (result.count === 0) {
            throw new PricingError(`"${item.productName}" just sold out.`, "OUT_OF_STOCK");
          }
        }
      }

      // Resolve/save the shipping address.
      let addressId = data.addressId ?? null;
      let shippingSnapshot = data.newAddress!;
      if (addressId) {
        const existing = await tx.address.findUnique({ where: { id: addressId } });
        if (!existing) throw new PricingError("Selected address was not found.", "PRODUCT_UNAVAILABLE");
        shippingSnapshot = {
          line1: existing.line1,
          line2: existing.line2 ?? undefined,
          city: existing.city,
          state: existing.state,
          pincode: existing.pincode,
          saveAddress: false,
        };
      } else if (session?.user && data.newAddress?.saveAddress) {
        const created = await tx.address.create({
          data: {
            userId: session.user.id,
            fullName: data.customerName,
            phone: data.customerPhone,
            line1: data.newAddress.line1,
            line2: data.newAddress.line2,
            city: data.newAddress.city,
            state: data.newAddress.state,
            pincode: data.newAddress.pincode,
          },
        });
        addressId = created.id;
      }

      // Increment coupon usage atomically alongside order creation. Same
      // pattern as the stock reservation above: read the current limit,
      // then do a conditional update that only succeeds if we're still
      // under it — closes the same race window a plain increment would
      // leave open between two concurrent checkouts sharing a coupon.
      if (totals.couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: totals.couponId } });
        if (coupon) {
          const updated = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              OR: [{ usageLimit: null }, { usedCount: { lt: coupon.usageLimit ?? Number.MAX_SAFE_INTEGER } }],
            },
            data: { usedCount: { increment: 1 } },
          });
          if (updated.count === 0) {
            throw new PricingError("This coupon just reached its usage limit.", "INVALID_COUPON");
          }
        }
      }

      const orderNumber = generateOrderNumber((await tx.order.count()) + 1);

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          addressId,
          shippingLine1: shippingSnapshot.line1,
          shippingLine2: shippingSnapshot.line2,
          shippingCity: shippingSnapshot.city,
          shippingState: shippingSnapshot.state,
          shippingPincode: shippingSnapshot.pincode,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          total: totals.total,
          couponId: totals.couponId,
          paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
          status: "ORDER_PLACED",
          items: {
            create: totals.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productSlug: item.productSlug,
              size: item.size,
              color: item.color,
              imageUrl: item.imageUrl,
              price: item.unitPrice,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Clear the cart now that the order durably owns these items.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null } });

      return createdOrder;
    });

    if (data.paymentMethod === "COD") {
      return apiSuccess({ orderNumber: order.orderNumber, paymentMethod: "COD" }, 201);
    }

    // Create the Razorpay order for online payment. This happens outside
    // the DB transaction (it's a network call to a third party) but the
    // Order row already exists with paymentStatus PENDING — if this call
    // fails, the order simply sits unpaid until the person retries or the
    // stock-release job reclaims it (see architecture doc §4).
    const razorpayOrder = await createRazorpayOrder(Number(order.total), order.orderNumber);

    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        status: "PENDING",
      },
    });

    return apiSuccess(
      {
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: Number(order.total),
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      201
    );
  } catch (err) {
    if (err instanceof PricingError) return apiError(err.code, err.message, 409);
    console.error("[checkout] failed:", err);
    return apiErrors.server("We couldn't place your order. Please try again.");
  }
}
