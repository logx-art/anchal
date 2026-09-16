import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { calculateOrderTotals, validateAndApplyCoupon, PricingError } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

// GET /api/cart — returns the current cart's line items plus authoritative
// totals (recomputed from the DB via lib/pricing, never from stale
// priceAtAdd snapshots), so the cart page always shows real numbers.
export async function GET() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  if (cart.items.length === 0) {
    return apiSuccess({ items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, couponCode: cart.couponCode });
  }

  try {
    const totals = await calculateOrderTotals(
      cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })),
      cart.couponCode ?? undefined
    );

    const items = cart.items.map((cartItem) => {
      const priced = totals.items.find(
        (t) => t.productId === cartItem.productId && (t.variantId ?? null) === (cartItem.variantId ?? null)
      );
      return {
        id: cartItem.id,
        productSlug: cartItem.product.slug,
        productName: cartItem.product.name,
        image: null as string | null, // hydrated below
        size: priced?.size ?? null,
        color: priced?.color ?? null,
        unitPrice: priced ? Number(priced.unitPrice) : Number(cartItem.priceAtAdd),
        quantity: cartItem.quantity,
        maxStock: cartItem.variant?.stockQuantity ?? cartItem.product.stockQuantity,
      };
    });

    // Attach primary images in one query rather than N+1.
    const images = await prisma.productImage.findMany({
      where: { productId: { in: cart.items.map((i) => i.productId) }, isPrimary: true },
    });
    for (const item of items) {
      const cartItem = cart.items.find((i) => i.id === item.id)!;
      item.image = images.find((img) => img.productId === cartItem.productId)?.url ?? null;
    }

    return apiSuccess({
      items,
      subtotal: Number(totals.subtotal),
      discount: Number(totals.discount),
      shipping: Number(totals.shipping),
      total: Number(totals.total),
      couponCode: cart.couponCode,
    });
  } catch (err) {
    if (err instanceof PricingError) return apiError(err.code, err.message, 409);
    throw err;
  }
}
