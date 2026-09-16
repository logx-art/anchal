import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { createCategory, updateCategory, deleteCategory } from "@/lib/admin-actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Categories</h1>

      <div className="mb-8 rounded-card border border-beige p-4">
        <p className="mb-3 font-medium text-charcoal">Add a category</p>
        <form
          action={async (formData: FormData) => {
            "use server";
            const name = String(formData.get("name") ?? "").trim();
            const slug = String(formData.get("slug") ?? "").trim();
            const description = String(formData.get("description") ?? "").trim();
            if (!name || !slug) return;
            await createCategory({ name, slug, description: description || undefined });
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_2fr_auto]"
        >
          <input name="name" placeholder="Name (e.g. Dupattas)" required className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug (e.g. dupattas)" required className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <input name="description" placeholder="Short description (optional)" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
          <button type="submit" className="flex items-center justify-center gap-1.5 rounded-card bg-maroon px-4 py-2 text-sm text-cream">
            <Plus size={16} /> Add
          </button>
        </form>
        <p className="mt-2 text-xs text-charcoal/50">
          New categories appear across the site automatically — no code changes needed.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-beige">
        <table className="w-full text-left text-sm">
          <thead className="bg-beige/40 text-charcoal/60">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-beige">
                <td className="px-4 py-3 text-charcoal">{c.name}</td>
                <td className="px-4 py-3 text-charcoal/60">/{c.slug}</td>
                <td className="px-4 py-3 text-charcoal/60">{c._count.products}</td>
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server";
                      await updateCategory(c.id, {
                        name: c.name,
                        slug: c.slug,
                        description: c.description ?? undefined,
                        isActive: !c.isActive,
                      });
                    }}
                  >
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
                    action={async () => {
                      "use server";
                      await deleteCategory(c.id);
                    }}
                    confirmMessage={
                      c._count.products > 0
                        ? `"${c.name}" has ${c._count.products} product(s). Deleting it may leave them uncategorized. Continue?`
                        : `Delete "${c.name}"?`
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
