"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/lib/data/products";

type Tab = { key: string; label: string; products: ProductCardData[]; viewAllHref: string };

export function FeaturedTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={clsx(
                "font-serif text-2xl transition-colors md:text-3xl",
                tab.key === activeTab.key ? "text-charcoal" : "text-charcoal/35 hover:text-charcoal/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Link href={activeTab.viewAllHref} className="text-sm text-maroon underline underline-offset-2">
          View all
        </Link>
      </div>

      <div className="mt-6">
        <ProductGrid products={activeTab.products} />
      </div>
    </section>
  );
}
