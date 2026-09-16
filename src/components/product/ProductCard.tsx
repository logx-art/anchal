"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import type { ProductCardData } from "@/lib/data/products";

export function ProductCard({ product }: { product: ProductCardData }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((v) => !v); // optimistic
    try {
      await fetch("/api/wishlist", {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch {
      setWishlisted((v) => !v); // revert on failure
    }
  }

  async function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col"
      onMouseEnter={() => product.hoverImage && setImageIndex(1)}
      onMouseLeave={() => setImageIndex(0)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-card bg-beige">
        {product.image ? (
          <Image
            src={imageIndex === 1 && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-opacity duration-150"
          />
        ) : null}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.newArrival && <Badge tone="new">New</Badge>}
          {product.discountPercent > 0 && <Badge tone="sale">{product.discountPercent}% off</Badge>}
          {!product.inStock && <Badge tone="outOfStock">Out of stock</Badge>}
        </div>

        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 rounded-full bg-cream/90 p-1.5 text-charcoal transition-colors hover:text-maroon"
        >
          <Heart size={16} strokeWidth={1.75} className={clsx(wishlisted && "fill-rose text-rose")} />
        </button>

        {product.inStock && (
          <button
            onClick={quickAdd}
            disabled={adding}
            className="absolute inset-x-2 bottom-2 flex translate-y-1 items-center justify-center gap-1.5 rounded-card bg-charcoal/90 py-2 text-xs font-medium text-cream opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-60 md:flex"
          >
            <ShoppingBag size={14} />
            {adding ? "Adding…" : "Quick Add"}
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-charcoal">{product.name}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm font-medium text-charcoal">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
        {product.originalPrice > product.sellingPrice && (
          <span className="text-xs text-charcoal/50 line-through">
            ₹{product.originalPrice.toLocaleString("en-IN")}
          </span>
        )}
      </div>
    </Link>
  );
}
