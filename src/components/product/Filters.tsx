"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";

export type FilterOptions = {
  fabrics: string[];
  colors: string[];
  sizes: string[];
  maxPrice: number;
};

// Reads/writes filter state via URL search params, so a filtered listing
// page is shareable/bookmarkable and survives a refresh — no client-side
// filter state that a reload would silently discard.
export function Filters({ options }: { options: FilterOptions }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggleValue(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    if (next.length > 0) params.set(key, next.join(","));
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function isChecked(key: string, value: string) {
    return (searchParams.get(key)?.split(",") ?? []).includes(value);
  }

  function clearAll() {
    router.push(window.location.pathname, { scroll: false });
  }

  const activeCount = ["fabric", "color", "size"].reduce(
    (sum, key) => sum + (searchParams.get(key)?.split(",").filter(Boolean).length ?? 0),
    0
  );

  const body = (
    <div className="flex flex-col gap-6">
      {options.sizes.length > 0 && (
        <FilterGroup label="Size">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleValue("size", size)}
                className={clsx(
                  "rounded-card border px-3 py-1.5 text-sm",
                  isChecked("size", size)
                    ? "border-maroon bg-maroon text-cream"
                    : "border-beige text-charcoal hover:border-charcoal/40"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.colors.length > 0 && (
        <FilterGroup label="Color">
          <div className="flex flex-col gap-2">
            {options.colors.map((color) => (
              <label key={color} className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={isChecked("color", color)}
                  onChange={() => toggleValue("color", color)}
                  className="h-4 w-4 rounded border-beige text-maroon focus:ring-maroon"
                />
                {color}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.fabrics.length > 0 && (
        <FilterGroup label="Fabric">
          <div className="flex flex-col gap-2">
            {options.fabrics.map((fabric) => (
              <label key={fabric} className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={isChecked("fabric", fabric)}
                  onChange={() => toggleValue("fabric", fabric)}
                  className="h-4 w-4 rounded border-beige text-maroon focus:ring-maroon"
                />
                {fabric}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      {activeCount > 0 && (
        <button onClick={clearAll} className="self-start text-sm text-maroon underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <p className="mb-4 font-serif text-lg text-charcoal">Filters</p>
        {body}
      </aside>

      {/* Mobile trigger + bottom sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 rounded-card border border-beige px-3 py-2 text-sm text-charcoal"
        >
          <SlidersHorizontal size={16} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-charcoal/40" onClick={() => setMobileOpen(false)} />
            <div className="relative max-h-[80vh] overflow-y-auto rounded-t-2xl bg-cream p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-serif text-lg text-charcoal">Filters</p>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              {body}
              <Button className="mt-6 w-full" onClick={() => setMobileOpen(false)}>
                Show results
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-charcoal">{label}</p>
      {children}
    </div>
  );
}
