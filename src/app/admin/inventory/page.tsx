import { Boxes } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

function stockTone(qty: number) {
  if (qty === 0) return "bg-charcoal/10 text-charcoal/50";
  if (qty <= 5) return "bg-rose-light text-maroon-dark";
  return "bg-maroon/10 text-maroon";
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;

  const variants = await prisma.productVariant.findMany({
    where: {
      ...(filter === "low" ? { stockQuantity: { lte: 5, gt: 0 } } : {}),
      ...(filter === "out" ? { stockQuantity: 0 } : {}),
      ...(q
        ? { product: { name: { contains: q, mode: "insensitive" } } }
        : {}),
    },
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { stockQuantity: "asc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Inventory</h1>

      <form className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by product name…"
          className="w-full max-w-sm rounded-card border border-beige bg-cream px-3 py-2 text-sm"
        />
        <select name="filter" defaultValue={filter ?? ""} className="rounded-card border border-beige bg-cream px-3 py-2 text-sm">
          <option value="">All stock levels</option>
          <option value="low">Low stock (≤5)</option>
          <option value="out">Out of stock</option>
        </select>
        <button type="submit" className="rounded-card bg-beige px-4 py-2 text-sm text-charcoal">Filter</button>
      </form>

      {variants.length === 0 ? (
        <EmptyState icon={Boxes} title="Nothing to show" description="No variants match this filter." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-beige">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/40 text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variant</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-t border-beige">
                  <td className="px-4 py-3 text-charcoal">{v.product.name}</td>
                  <td className="px-4 py-3 text-charcoal/70">{[v.size, v.color].filter(Boolean).join(" / ") || "—"}</td>
                  <td className="px-4 py-3 text-charcoal/50">{v.sku}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-card px-2 py-0.5 text-xs ${stockTone(v.stockQuantity)}`}>
                      {v.stockQuantity === 0 ? "Out of stock" : `${v.stockQuantity} left`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-charcoal/50">
        Stock updates automatically as orders are placed and paid for. To correct a count manually, edit the
        product and adjust its size/stock table.
      </p>
    </div>
  );
}
