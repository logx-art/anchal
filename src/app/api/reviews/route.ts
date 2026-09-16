import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrors, apiError, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({
  productId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  // Only customers who've actually received the product can review it —
  // prevents fake/incentivized reviews from non-purchasers.
  const hasDelivered = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: session.user.id, status: "DELIVERED" },
    },
  });
  if (!hasDelivered) {
    return apiError(
      "NOT_ELIGIBLE",
      "You can review a product after it's been delivered to you.",
      403
    );
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: session.user.id } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment, isApproved: false },
    create: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      isApproved: false, // admin moderates before it appears publicly
    },
  });

  return apiSuccess(review, 201);
}
