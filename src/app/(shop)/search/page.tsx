import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { searchProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/product/SearchBar";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q ? await searchProducts(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="mb-2 font-serif text-3xl text-charcoal">Search</h1>
      <SearchBar initialQuery={q} className="mb-8 max-w-md" />

      {!q && (
        <EmptyState
          icon={SearchIcon}
          title="Search Anchal"
          description="Find sarees, kurtis, and nightwear by name, fabric, or color."
        />
      )}

      {q && (
        <>
          <p className="mb-5 text-sm text-charcoal/60">
            {products.length} results for "{q}"
          </p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
