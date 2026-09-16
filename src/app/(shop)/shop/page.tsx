import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse Anchal's full collection of sarees, kurtis, and nightwear.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return <ProductListing title="Shop All" searchParams={params} />;
}
