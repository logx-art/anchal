import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";

export const metadata: Metadata = {
  title: "Sale",
  description: "Limited-time offers on sarees, kurtis, and nightwear at Anchal.",
};

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProductListing
      title="Sale"
      description="Our current markdowns — while stocks last."
      searchParams={params}
      onSaleOnly
    />
  );
}
