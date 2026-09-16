import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { ProductListing } from "@/components/product/ProductListing";

// A single dynamic route serves every category — Sarees, Kurtis,
// Nightwear today, and any category an admin adds later, with zero
// routing changes (per §10/§27 of the requirements).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Anchal.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  return (
    <ProductListing
      title={category.name}
      description={category.description ?? undefined}
      categorySlug={category.slug}
      searchParams={resolvedSearchParams}
    />
  );
}
