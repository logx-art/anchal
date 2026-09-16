import { getActiveCategories } from "@/lib/data/categories";
import { apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getActiveCategories();
  return apiSuccess(categories);
}
