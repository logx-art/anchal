import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrors } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiErrors.unauthorized();

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(orders);
}
