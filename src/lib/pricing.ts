import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// -----------------------------------------------------------------------
// Every number in here is computed from the database, never trusted from
// the client. checkout/route.ts calls calculateOrderTotals() with only
// {productId, variantId, quantity} tuples — see validations/checkout.ts.
// -----------------------------------------------------------------------

const FLAT_SHIPPING_RATE = new Prisma.Decimal(79);
const FREE_SHIPPING_THRESHOLD = new Prisma.Decimal(999);

export type PricedLineItem = {
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  size: string | null;
  color: string | null;
  unitPrice: Prisma.Decimal;
  quantity: number;
  lineTotal: Prisma.Decimal;
};

export type OrderTotals = {
  items: PricedLineItem[];
  subtotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  shipping: Prisma.Decimal;
  total: Prisma.Decimal;
  couponId: string | null;
};

export class PricingError extends Error {
  constructor(
    message: string,
    public code: "OUT_OF_STOCK" | "PRODUCT_UNAVAILABLE" | "INVALID_COUPON"
  ) {
    super(message);
  }
}

type RequestedItem = { productId: string; variantId?: string; quantity: number };

type DbClient = typeof prisma | Prisma.TransactionClient;

/**
 * Re-fetches every item's current price and stock from the database and
 * builds an authoritative order total. Throws PricingError (never returns
 * a "best guess") if anything is out of stock, inactive, or missing.
 *
 * Accepts an optional transaction client so checkout can run this inside
 * the same $transaction as order creation and stock decrement — keeping
 * "is this still in stock" and "reserve it" atomic instead of two
 * separate round trips a concurrent order could race between.
 */
export async function calculateOrderTotals(
  requestedItems: RequestedItem[],
  couponCode?: string,
  db: DbClient = prisma
): Promise<OrderTotals> {
  const items: PricedLineItem[] = [];

  for (const req of requestedItems) {
    const product = await db.product.findUnique({
      where: { id: req.productId },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: req.variantId ? { where: { id: req.variantId } } : false,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new PricingError(`One of the items in your cart is no longer available.`, "PRODUCT_UNAVAILABLE");
    }

    const variant = req.variantId ? product.variants?.[0] : undefined;
    if (req.variantId && !variant) {
      throw new PricingError(`Selected size/color is no longer available.`, "PRODUCT_UNAVAILABLE");
    }

    const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
    if (availableStock < req.quantity) {
      throw new PricingError(`Only ${availableStock} left of "${product.name}".`, "OUT_OF_STOCK");
    }

    const unitPrice = variant?.priceOverride ?? product.sellingPrice;
    const lineTotal = unitPrice.mul(req.quantity);

    items.push({
      productId: product.id,
      variantId: variant?.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0]?.url ?? null,
      size: variant?.size ?? null,
      color: variant?.color ?? null,
      unitPrice,
      quantity: req.quantity,
      lineTotal,
    });
  }

  const subtotal = items.reduce((sum, item) => sum.add(item.lineTotal), new Prisma.Decimal(0));

  let discount = new Prisma.Decimal(0);
  let couponId: string | null = null;

  if (couponCode) {
    const { discount: couponDiscount, couponId: id } = await validateAndApplyCoupon(couponCode, subtotal, db);
    discount = couponDiscount;
    couponId = id;
  }

  const discountedSubtotal = subtotal.sub(discount);
  const shipping = discountedSubtotal.gte(FREE_SHIPPING_THRESHOLD)
    ? new Prisma.Decimal(0)
    : FLAT_SHIPPING_RATE;

  const total = discountedSubtotal.add(shipping);

  return { items, subtotal, discount, shipping, total, couponId };
}

/**
 * Validates a coupon against current DB state (active, not expired, under
 * its usage limit, order meets the minimum) and returns the discount
 * amount. Does NOT increment usedCount — that happens inside the same
 * transaction as order creation, so two concurrent checkouts can't both
 * claim the last use of a limited coupon.
 */
export async function validateAndApplyCoupon(code: string, subtotal: Prisma.Decimal, db: DbClient = prisma) {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    throw new PricingError("This coupon code is invalid.", "INVALID_COUPON");
  }
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    throw new PricingError("This coupon has expired.", "INVALID_COUPON");
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new PricingError("This coupon has reached its usage limit.", "INVALID_COUPON");
  }
  if (subtotal.lt(coupon.minOrderAmount)) {
    throw new PricingError(
      `Add ₹${coupon.minOrderAmount.sub(subtotal).toFixed(0)} more to use this coupon.`,
      "INVALID_COUPON"
    );
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? subtotal.mul(coupon.value).div(100)
      : Prisma.Decimal.min(coupon.value, subtotal); // never discount below zero

  return { discount, couponId: coupon.id };
}

/** Human-facing order number, e.g. ANC-2026-004821. Collision risk is
 * negligible (random 4-digit suffix + counter), and orderNumber has a
 * unique DB constraint as a hard backstop. */
export function generateOrderNumber(sequence: number) {
  const year = new Date().getFullYear();
  return `ANC-${year}-${String(sequence).padStart(6, "0")}`;
}
