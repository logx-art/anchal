"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector, type Variant } from "./VariantSelector";

export function AddToCartBar({
  productId,
  variants,
  inStock,
}: {
  productId: string;
  variants: Variant[];
  inStock: boolean;
}) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  const needsVariant = variants.some((v) => v.size && v.size !== "Free Size");
  const canAdd = inStock && (!needsVariant || selectedVariantId);

  async function addToCart() {
    setStatus("adding");
    setErrorMessage("");
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId: selectedVariantId, quantity }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Couldn't add to cart.");
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
      return true;
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      return false;
    }
  }

  async function buyNow() {
    if (await addToCart()) router.push("/checkout");
  }

  async function toggleWishlist() {
    setWishlisted((v) => !v);
    await fetch("/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => setWishlisted((v) => !v));
  }

  return (
    <div className="flex flex-col gap-5">
      <VariantSelector variants={variants} selectedId={selectedVariantId} onSelect={setSelectedVariantId} />

      <div>
        <p className="mb-2 text-sm font-medium text-charcoal">Quantity</p>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      {errorMessage && <p className="text-sm text-terracotta">{errorMessage}</p>}

      {/* Desktop controls */}
      <div className="hidden gap-3 md:flex">
        <Button variant="secondary" onClick={addToCart} disabled={!canAdd || status === "adding"} className="flex-1">
          <ShoppingBag size={16} />
          {status === "added" ? "Added to cart" : "Add to Cart"}
        </Button>
        <Button onClick={buyNow} disabled={!canAdd} className="flex-1">
          Buy Now
        </Button>
        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="rounded-card border border-beige p-3 text-charcoal hover:text-maroon"
        >
          <Heart size={18} className={clsx(wishlisted && "fill-rose text-rose")} />
        </button>
      </div>

      {!inStock && <p className="text-sm text-charcoal/60">This item is currently out of stock.</p>}

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-beige bg-cream p-3 md:hidden">
        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="rounded-card border border-beige p-3 text-charcoal"
        >
          <Heart size={18} className={clsx(wishlisted && "fill-rose text-rose")} />
        </button>
        <Button variant="secondary" onClick={addToCart} disabled={!canAdd || status === "adding"} className="flex-1">
          {status === "added" ? "Added" : "Add to Cart"}
        </Button>
        <Button onClick={buyNow} disabled={!canAdd} className="flex-1">
          Buy Now
        </Button>
      </div>
      {/* Spacer so the sticky bar doesn't cover content */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
