"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";

export type CartLine = {
  id: string;
  productSlug: string;
  productName: string;
  image: string | null;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartLine;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 border-b border-beige py-5">
      <Link href={`/product/${item.productSlug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-card bg-beige">
        {item.image && <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${item.productSlug}`} className="text-sm text-charcoal hover:text-maroon">
            {item.productName}
          </Link>
          {(item.size || item.color) && (
            <p className="mt-0.5 text-xs text-charcoal/50">
              {[item.size, item.color].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-charcoal">₹{item.unitPrice.toLocaleString("en-IN")}</p>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            max={item.maxStock}
            onChange={(q) => onQuantityChange(item.id, q)}
          />
          <button
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
            className="p-1.5 text-charcoal/50 hover:text-terracotta"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
