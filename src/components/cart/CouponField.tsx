"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CouponField({
  appliedCode,
  onApply,
  onRemove,
}: {
  appliedCode: string | null;
  onApply: (code: string) => Promise<string | null>; // returns an error message, or null on success
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await onApply(code);
    setError(result);
    setLoading(false);
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-card bg-beige/50 px-3 py-2 text-sm">
        <span className="text-charcoal">
          Coupon <strong>{appliedCode}</strong> applied
        </span>
        <button onClick={onRemove} className="text-maroon underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-charcoal/40 focus:border-maroon"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={!code || loading}>
          {loading ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-terracotta">{error}</p>}
    </form>
  );
}
