"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "./ProductGrid";
import type { ProductCardData } from "@/lib/data/products";

const STORAGE_KEY = "anchal_recently_viewed";
const MAX_ITEMS = 8;

// Client-side only (this is a real deployed app, not a sandboxed artifact,
// so localStorage is the right tool here) — tracks the last few products
// viewed in this browser and records the current product on mount.
export function RecentlyViewed({ currentProduct }: { currentProduct: ProductCardData }) {
  const [items, setItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: ProductCardData[] = raw ? JSON.parse(raw) : [];

    const withoutCurrent = stored.filter((p) => p.id !== currentProduct.id);
    const updated = [currentProduct, ...withoutCurrent].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Exclude the current product from what's *displayed* here.
    setItems(updated.filter((p) => p.id !== currentProduct.id));
  }, [currentProduct]);

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="font-serif text-2xl text-charcoal">Recently Viewed</h2>
      <div className="mt-5">
        <ProductGrid products={items} />
      </div>
    </section>
  );
}
