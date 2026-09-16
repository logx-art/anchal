"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  onChange,
  max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-card border border-beige">
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="p-2.5 text-charcoal disabled:opacity-30"
        disabled={value <= 1}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm text-charcoal">{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="p-2.5 text-charcoal disabled:opacity-30"
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
