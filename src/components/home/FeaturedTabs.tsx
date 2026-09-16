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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex max-w-full gap-4 overflow-x-auto pb-1 sm:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={clsx(
                "shrink-0 whitespace-nowrap font-serif text-xl transition-colors sm:text-2xl md:text-3xl",
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
