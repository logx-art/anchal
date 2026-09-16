import { z } from "zod";
import { auth } from "@/lib/auth";
import { getOrCreateCart, addCartItem } from "@/lib/cart";
import { apiSuccess, apiError, apiErrorFromZod } from "@/lib/api-response";

const addItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

// POST /api/cart/items — used by Quick Add on product cards and the Add
// to Cart button on the product detail page.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  try {
    const item = await addCartItem(cart.id, parsed.data.productId, parsed.data.quantity, parsed.data.variantId ?? undefined);
    return apiSuccess(item, 201);
  } catch (err) {
    return apiError("CART_ERROR", err instanceof Error ? err.message : "Couldn't add item to cart.", 409);
  }
}
