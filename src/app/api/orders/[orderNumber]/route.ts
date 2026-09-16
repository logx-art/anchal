import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrors } from "@/lib/api-response";

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: session.user.id },
    include: { items: true, payment: true },
  });
  if (!order) return apiErrors.notFound("Order");

  return apiSuccess(order);
}
