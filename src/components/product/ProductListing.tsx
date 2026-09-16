import { getProducts, getFilterOptions, type ProductFilters } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Filters } from "@/components/product/Filters";
import { SortDropdown } from "@/components/product/SortDropdown";
import { Pagination } from "@/components/product/Pagination";

function parseFilters(
  searchParams: Record<string, string | undefined>,
  categorySlug?: string,
  overrides?: Pick<ProductFilters, "newArrivalOnly" | "onSaleOnly">
): ProductFilters {
  return {
    categorySlug,
    newArrivalOnly: overrides?.newArrivalOnly,
    onSaleOnly: overrides?.onSaleOnly,
    sizes: searchParams.size?.split(",").filter(Boolean),
    colors: searchParams.color?.split(",").filter(Boolean),
    fabrics: searchParams.fabric?.split(",").filter(Boolean),
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sort: (searchParams.sort as ProductFilters["sort"]) ?? "newest",
    page: searchParams.page ? Number(searchParams.page) : 1,
  };
}

export async function ProductListing({
  title,
  description,
  categorySlug,
  searchParams,
  newArrivalOnly,
  onSaleOnly,
}: {
  title: string;
  description?: string;
  categorySlug?: string;
  searchParams: Record<string, string | undefined>;
  newArrivalOnly?: boolean;
  onSaleOnly?: boolean;
}) {
  const filters = parseFilters(searchParams, categorySlug, { newArrivalOnly, onSaleOnly });
  const [{ products, total, page, totalPages }, filterOptions] = await Promise.all([
    getProducts(filters),
    getFilterOptions(categorySlug),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-charcoal">{title}</h1>
        {description && <p className="mt-1 text-sm text-charcoal/70">{description}</p>}
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <Filters options={filterOptions} />

        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-charcoal/60">{total} products</p>
            <SortDropdown />
          </div>

          <ProductGrid products={products} />

          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
        </div>
      </div>
    </div>
  );
}
