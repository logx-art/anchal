import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrors, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({ productId: z.string().cuid() });

// Wishlist is logged-in-only per §15 of the spec — guests are prompted to
// sign in when they tap the heart icon (handled in the UI layer).

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { items: { select: { productId: true } } },
  });
  return apiSuccess({ productIds: wishlist?.items.map((i) => i.productId) ?? [] });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId: parsed.data.productId } },
    update: {},
    create: { wishlistId: wishlist.id, productId: parsed.data.productId },
  });

  return apiSuccess({ added: true }, 201);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const wishlist = await prisma.wishlist.findUnique({ where: { userId: session.user.id } });
  if (wishlist) {
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId: parsed.data.productId } });
  }

  return apiSuccess({ removed: true });
}
