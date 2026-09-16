import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Copy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteProduct, duplicateProduct } from "@/lib/admin-actions";
import { Package } from "lucide-react";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
      : undefined,
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-charcoal">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 rounded-card bg-maroon px-4 py-2 text-sm text-cream">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or SKU…"
          className="w-full max-w-sm rounded-card border border-beige bg-cream px-3 py-2 text-sm"
        />
      </form>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling." actionLabel="Add Product" actionHref="/admin/products/new" />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-card border border-beige md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-beige/40 text-charcoal/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-beige">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card bg-beige">
                        {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                      </div>
                      <span className="text-charcoal">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">{p.category.name}</td>
                    <td className="px-4 py-3 text-charcoal/70">₹{Number(p.sellingPrice).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-charcoal/70">{p.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-1 text-charcoal hover:text-maroon">
                          <Pencil size={14} /> Edit
                        </Link>
                        <form action={async () => { "use server"; await duplicateProduct(p.id); }}>
                          <button type="submit" className="flex items-center gap-1 text-charcoal hover:text-maroon">
                            <Copy size={14} /> Duplicate
                          </button>
                        </form>
                        <ConfirmButton
                          action={async () => { "use server"; await deleteProduct(p.id); }}
                          confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="rounded-card border border-beige p-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-card bg-beige">
                    {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal">{p.name}</p>
                    <p className="text-xs text-charcoal/60">₹{Number(p.sellingPrice).toLocaleString("en-IN")} · Stock {p.stockQuantity}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-maroon">Edit</Link>
                  <ConfirmButton action={async () => { "use server"; await deleteProduct(p.id); }} confirmMessage={`Delete "${p.name}"?`} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-maroon/15 text-maroon",
    DRAFT: "bg-beige text-charcoal/60",
    OUT_OF_STOCK: "bg-rose-light text-maroon-dark",
  };
  return <span className={`rounded-card px-2 py-0.5 text-xs ${styles[status]}`}>{status.replace("_", " ")}</span>;
}
