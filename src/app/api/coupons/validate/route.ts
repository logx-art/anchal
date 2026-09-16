import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { validateAndApplyCoupon, PricingError } from "@/lib/pricing";
import { apiSuccess, apiError, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({ code: z.string().trim().min(1) });

// Applying a coupon at the cart stage is a convenience — it's stored on
// the Cart row for display, but checkout always re-validates it from
// scratch against the live DB (see lib/pricing.ts), so this endpoint
// can never be the sole gate that decides a discount is legitimate.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  const subtotal = cart.items.reduce(
    (sum, item) => sum.add(item.priceAtAdd.mul(item.quantity)),
    new Prisma.Decimal(0)
  );

  try {
    await validateAndApplyCoupon(parsed.data.code, subtotal);
  } catch (err) {
    if (err instanceof PricingError) return apiError(err.code, err.message, 400);
    throw err;
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: parsed.data.code.toUpperCase() } });
  return apiSuccess({ applied: true });
}

export async function DELETE() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
  return apiSuccess({ removed: true });
}
