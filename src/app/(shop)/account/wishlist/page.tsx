import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductCardData } from "@/lib/data/products";

export default async function WishlistPage() {
  const user = await requireUser();

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user!.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { sortOrder: "asc" }, take: 2 }, category: { select: { name: true, slug: true } } },
          },
        },
      },
    },
  });

  const products: ProductCardData[] = (wishlist?.items ?? []).map(({ product }) => {
    const sellingPrice = Number(product.sellingPrice);
    const originalPrice = Number(product.originalPrice);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sellingPrice,
      originalPrice,
      discountPercent: originalPrice > sellingPrice ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0,
      newArrival: product.newArrival,
      onSale: product.onSale,
      inStock: product.stockQuantity > 0,
      avgRating: Number(product.avgRating),
      reviewCount: product.reviewCount,
      image: product.images[0]?.url ?? null,
      hoverImage: product.images[1]?.url ?? null,
      category: product.category,
    };
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save pieces you love here so you can find them again easily."
          actionLabel="Browse Products"
          actionHref="/shop"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
