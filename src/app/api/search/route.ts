import { searchProducts } from "@/lib/data/products";
import { apiSuccess } from "@/lib/api-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

  const results = await searchProducts(q, limit);
  return apiSuccess(results);
}
