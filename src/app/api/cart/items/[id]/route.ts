import { z } from "zod";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart";
import { apiSuccess, apiErrorFromZod } from "@/lib/api-response";

const updateSchema = z.object({ quantity: z.coerce.number().int().min(0).max(20) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const item = await updateCartItemQuantity(id, parsed.data.quantity);
  return apiSuccess(item);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await removeCartItem(id);
  return apiSuccess({ removed: true });
}
