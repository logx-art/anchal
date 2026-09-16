"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ deliverable: boolean; etaDays?: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/pincode-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode }),
    });
    const json = await res.json();
    setResult(json.success ? json.data : { deliverable: false, message: json.error?.message ?? "Couldn't check this PIN code." });
    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={check} className="flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter PIN code"
          className="w-40 rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
        />
        <button
          type="submit"
          disabled={pincode.length !== 6 || loading}
          className="rounded-card border border-charcoal px-3 py-2 text-sm text-charcoal disabled:opacity-40"
        >
          {loading ? "Checking…" : "Check"}
        </button>
      </form>
      {result && (
        <p className={`mt-2 flex items-center gap-1.5 text-sm ${result.deliverable ? "text-charcoal" : "text-terracotta"}`}>
          {result.deliverable ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {result.message}
        </p>
      )}
    </div>
  );
}
