import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrors } from "@/lib/api-response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, category: true },
  });
  if (!product) return apiErrors.notFound("Product");
  return apiSuccess(product);
}
