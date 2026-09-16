import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartBar } from "@/components/product/AddToCartBar";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const discountPercent =
    product.originalPrice > product.sellingPrice
      ? Math.round((1 - product.sellingPrice / product.originalPrice) * 100)
      : 0;

  // JSON-LD structured data for SEO (§37) — search engines can show price
  // and availability directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.sellingPrice,
      availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.avgRating, reviewCount: product.reviewCount }
        : undefined,
  };

  const attrs = (product.attributes as Record<string, string> | null) ?? {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-5 flex items-center gap-1 text-xs text-charcoal/50">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/${product.category.slug}`} className="hover:text-maroon">{product.category.name}</Link>
        <ChevronRight size={12} />
        <span className="text-charcoal/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="font-serif text-2xl text-charcoal md:text-3xl">{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/70">
              <div className="flex gap-0.5 text-terracotta">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(product.avgRating) ? "currentColor" : "none"} strokeWidth={1.5} />
                ))}
              </div>
              {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-medium text-charcoal">
              ₹{product.sellingPrice.toLocaleString("en-IN")}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-base text-charcoal/45 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-terracotta">{discountPercent}% off</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{product.shortDescription}</p>

          <div className="mt-6">
            <AddToCartBar
              productId={product.id}
              variants={product.variants}
              inStock={product.stockQuantity > 0}
            />
          </div>

          <ProductTabs
            tabs={[
              { key: "description", label: "Description", content: <p>{product.fullDescription}</p> },
              {
                key: "specifications",
                label: "Specifications",
                content: (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                    {product.fabric && (
                      <>
                        <dt className="text-charcoal/50">Fabric</dt>
                        <dd>{product.fabric}</dd>
                      </>
                    )}
                    {product.colors.length > 0 && (
                      <>
                        <dt className="text-charcoal/50">Color</dt>
                        <dd>{product.colors.join(", ")}</dd>
                      </>
                    )}
                    {Object.entries(attrs).map(([key, value]) => (
                      <>
                        <dt key={`${key}-label`} className="capitalize text-charcoal/50">
                          {key.replace(/([A-Z])/g, " $1")}
                        </dt>
                        <dd key={`${key}-value`}>{value}</dd>
                      </>
                    ))}
                  </dl>
                ),
              },
              {
                key: "shipping",
                label: "Shipping & Returns",
                content: (
                  <p>
                    Dispatched within 24–48 hours. Delivered in 4–7 business days depending on your
                    location. Enjoy a 7-day return window from the date of delivery — see our{" "}
                    <Link href="/policies/returns" className="text-maroon underline">
                      Return & Refund Policy
                    </Link>{" "}
                    for details.
                  </p>
                ),
              },
              {
                key: "care",
                label: "Care Instructions",
                content: <p>{product.careInstructions ?? "Follow the care label inside the garment."}</p>,
              },
            ]}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl text-charcoal">You may also like</h2>
          <div className="mt-5">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <RecentlyViewed
        currentProduct={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sellingPrice: product.sellingPrice,
          originalPrice: product.originalPrice,
          discountPercent,
          newArrival: product.newArrival,
          onSale: product.onSale,
          inStock: product.stockQuantity > 0,
          avgRating: product.avgRating,
          reviewCount: product.reviewCount,
          image: product.images[0]?.url ?? null,
          hoverImage: product.images[1]?.url ?? null,
          category: { name: product.category.name, slug: product.category.slug },
        }}
      />
    </div>
  );
}
