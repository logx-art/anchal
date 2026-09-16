import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const GUEST_CART_COOKIE = "anchal_cart_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/**
 * Resolves the current cart: a logged-in user's cart if userId is given,
 * otherwise a guest cart tied to an httpOnly cookie (created on first use).
 * Called from every cart-related API route so cart identity logic lives
 * in exactly one place.
 */
export async function getOrCreateCart(userId?: string) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
    include: { items: { include: { product: true, variant: true } } },
  });
}

/**
 * Called right after a successful login/registration. Folds any items
 * sitting in the guest cart into the user's persistent cart, then deletes
 * the guest cart. Quantities are summed when the same product/variant
 * exists in both (capped at available stock by the caller at checkout,
 * not here, since stock can change between merge and checkout anyway).
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await prisma.cart.delete({ where: { id: guestCart.id } });
    cookieStore.delete(GUEST_CART_COOKIE);
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await prisma.$transaction(async (tx) => {
    for (const item of guestCart.items) {
      // Postgres treats NULL as distinct in unique constraints, so a
      // compound-key lookup can't safely pass variantId: null and expect
      // the DB constraint to catch duplicates. We check explicitly instead.
      const existing = await tx.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
          },
        });
      }
    }
    await tx.cart.delete({ where: { id: guestCart.id } });
  });

  cookieStore.delete(GUEST_CART_COOKIE);
}

/**
 * Read-only item count for the header badge. Deliberately does NOT create
 * a cart as a side effect — getOrCreateCart() is for actual cart mutations;
 * rendering a page should never have the side effect of writing a row.
 */
export async function getCartItemCount(userId?: string) {
  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { select: { quantity: true } } },
    });
    return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!sessionId) return 0;

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}

/**
 * Adds an item to a cart, re-checking current stock before insert. The
 * priceAtAdd stored here is a *display* snapshot only — calculateOrderTotals()
 * in lib/pricing.ts re-fetches the live price at checkout regardless.
 */
export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  variantId?: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: variantId ? { where: { id: variantId } } : false },
  });
  if (!product || product.status !== "ACTIVE") {
    throw new Error("This product is no longer available.");
  }

  const variant = variantId ? product.variants?.[0] : undefined;
  const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
  if (availableStock < quantity) {
    throw new Error(`Only ${availableStock} left in stock.`);
  }

  const unitPrice = variant?.priceOverride ?? product.sellingPrice;

  // See the note in mergeGuestCartIntoUser: NULL is distinct in Postgres
  // unique constraints, so we resolve "does this line already exist?"
  // explicitly rather than via a compound-key upsert.
  const existing = await prisma.cartItem.findFirst({
    where: { cartId, productId, variantId: variantId ?? null },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { cartId, productId, variantId, quantity, priceAtAdd: unitPrice },
  });
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }
  return prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
}

export async function removeCartItem(cartItemId: string) {
  return prisma.cartItem.delete({ where: { id: cartItemId } });
}
