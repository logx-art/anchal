import { Plus, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { createCoupon, toggleCouponActive, deleteCoupon } from "@/lib/admin-actions";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Coupons</h1>

      <div className="mb-8 rounded-card border border-beige p-4">
        <p className="mb-3 font-medium text-charcoal">Create a coupon</p>
        <form
          action={async (formData: FormData) => {
            "use server";
            await createCoupon({
              code: String(formData.get("code")),
              type: formData.get("type"),
              value: formData.get("value"),
              minOrderAmount: formData.get("minOrderAmount") || 0,
              usageLimit: formData.get("usageLimit") || undefined,
              expiryDate: formData.get("expiryDate") || undefined,
              isActive: true,
            });
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-5"
        >
          <input name="code" placeholder="CODE (e.g. WELCOME10)" required className="rounded-card border border-beige bg-cream px-3 py-2 text-sm uppercase" />
          <select name="type" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm">
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
          <input name="value" type="number" placeholder="Value (10 or 200)" required className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <input name="minOrderAmount" type="number" placeholder="Min order ₹ (optional)" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <input name="usageLimit" type="number" placeholder="Usage limit (optional)" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <input name="expiryDate" type="date" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <button type="submit" className="flex items-center justify-center gap-1.5 rounded-card bg-maroon px-4 py-2 text-sm text-cream">
            <Plus size={16} /> Create Coupon
          </button>
        </form>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons yet" description="Create a coupon to offer discounts at checkout." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-beige">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/40 text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-beige">
                  <td className="px-4 py-3 font-medium text-charcoal">{c.code}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {c.type === "PERCENTAGE" ? `${c.value}% off` : `₹${c.value} off`}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">₹{Number(c.minOrderAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {c.expiryDate ? c.expiryDate.toLocaleDateString("en-IN") : "No expiry"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={async () => { "use server"; await toggleCouponActive(c.id, !c.isActive); }}>
                      <button
                        type="submit"
                        className={`rounded-card px-2 py-0.5 text-xs ${c.isActive ? "bg-maroon/15 text-maroon" : "bg-beige text-charcoal/60"}`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <ConfirmButton
                      action={async () => { "use server"; await deleteCoupon(c.id); }}
                      confirmMessage={`Delete coupon "${c.code}"?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
