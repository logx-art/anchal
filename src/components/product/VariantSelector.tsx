"use client";

import { clsx } from "clsx";

export type Variant = { id: string; size: string | null; color: string | null; stockQuantity: number };

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const hasRealSizes = variants.some((v) => v.size && v.size !== "Free Size");

  if (!hasRealSizes) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-charcoal">Size</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const outOfStock = v.stockQuantity === 0;
          return (
            <button
              key={v.id}
              disabled={outOfStock}
              onClick={() => onSelect(v.id)}
              className={clsx(
                "rounded-card border px-4 py-2 text-sm transition-colors",
                outOfStock
                  ? "border-beige text-charcoal/30 line-through"
                  : v.id === selectedId
                    ? "border-maroon bg-maroon text-cream"
                    : "border-beige text-charcoal hover:border-charcoal/40"
              )}
            >
              {v.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
