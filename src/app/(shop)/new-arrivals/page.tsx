import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest sarees, kurtis, and nightwear to land at Anchal.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProductListing
      title="New Arrivals"
      description="Fresh styles, added every week."
      searchParams={params}
      newArrivalOnly
    />
  );
}
