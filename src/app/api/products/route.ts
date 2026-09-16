import { getProducts, type ProductFilters } from "@/lib/data/products";
import { apiSuccess } from "@/lib/api-response";

// Public product listing endpoint — used by any client-side code that
// needs products outside of a Server Component (e.g. future mobile app,
// or client-side "load more" pagination).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: ProductFilters = {
    categorySlug: searchParams.get("category") ?? undefined,
    sizes: searchParams.get("size")?.split(","),
    colors: searchParams.get("color")?.split(","),
    fabrics: searchParams.get("fabric")?.split(","),
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    newArrivalOnly: searchParams.get("newArrival") === "true",
    onSaleOnly: searchParams.get("onSale") === "true",
    sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? "newest",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  };

  const result = await getProducts(filters);
  return apiSuccess(result);
}
