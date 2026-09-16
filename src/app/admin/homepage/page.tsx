import Image from "next/image";
import { Plus, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { createBanner, toggleBannerActive, deleteBanner, toggleProductFlag } from "@/lib/admin-actions";

export default async function AdminHomepagePage() {
  const [banners, featuredCandidates] = await Promise.all([
    prisma.banner.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, featured: true, newArrival: true, onSale: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-1 font-serif text-2xl text-charcoal">Homepage</h1>
        <p className="text-sm text-charcoal/60">
          Control the hero, promotional banners, and which products appear in the Trending / New Arrivals /
          Sale tabs — no code changes needed.
        </p>
      </div>

      <section>
        <p className="mb-3 font-medium text-charcoal">Banners</p>
        <div className="mb-4 rounded-card border border-beige p-4">
          <form
            action={async (formData: FormData) => {
              "use server";
              await createBanner({
                type: formData.get("type") as "HERO" | "PROMOTIONAL",
                imageUrl: String(formData.get("imageUrl")),
                title: String(formData.get("title") || "") || undefined,
                subtitle: String(formData.get("subtitle") || "") || undefined,
                ctaText: String(formData.get("ctaText") || "") || undefined,
                ctaLink: String(formData.get("ctaLink") || "") || undefined,
              });
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <select name="type" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm">
              <option value="HERO">Hero banner</option>
              <option value="PROMOTIONAL">Promotional banner</option>
            </select>
            <input name="imageUrl" placeholder="Image URL" required className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
            <input name="title" placeholder="Title" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
            <input name="subtitle" placeholder="Subtitle" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
            <input name="ctaText" placeholder="Button text (e.g. Shop Sarees)" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
            <input name="ctaLink" placeholder="Button link (e.g. /sarees)" className="rounded-card border border-beige bg-cream px-3 py-2 text-sm" />
            <button type="submit" className="flex w-fit items-center gap-1.5 rounded-card bg-maroon px-4 py-2 text-sm text-cream sm:col-span-2">
              <Plus size={16} /> Add Banner
            </button>
          </form>
        </div>

        {banners.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No banners yet" description="Add a hero or promotional banner above." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-card border border-beige">
                <div className="relative aspect-[16/8] bg-beige">
                  <Image src={b.imageUrl} alt="" fill sizes="360px" className="object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs uppercase tracking-wide text-charcoal/40">{b.type}</p>
                  <p className="text-sm text-charcoal">{b.title ?? "Untitled banner"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <form action={async () => { "use server"; await toggleBannerActive(b.id, !b.isActive); }}>
                      <button type="submit" className={`rounded-card px-2 py-0.5 text-xs ${b.isActive ? "bg-maroon/15 text-maroon" : "bg-beige text-charcoal/60"}`}>
                        {b.isActive ? "Active" : "Inactive"}
                      </button>
                    </form>
                    <ConfirmButton
                      action={async () => { "use server"; await deleteBanner(b.id); }}
                      confirmMessage="Remove this banner?"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 font-medium text-charcoal">Featured / New Arrival / Sale tags</p>
        <p className="mb-3 text-sm text-charcoal/60">
          Toggle which products show up in each homepage tab.
        </p>
        <div className="overflow-x-auto rounded-card border border-beige">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/40 text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">New Arrival</th>
                <th className="px-4 py-3 font-medium">Sale</th>
              </tr>
            </thead>
            <tbody>
              {featuredCandidates.map((p) => (
                <tr key={p.id} className="border-t border-beige">
                  <td className="px-4 py-3 text-charcoal">{p.name}</td>
                  {(["featured", "newArrival", "onSale"] as const).map((flag) => (
                    <td key={flag} className="px-4 py-3">
                      <form action={async () => { "use server"; await toggleProductFlag(p.id, flag, !p[flag]); }}>
                        <button
                          type="submit"
                          className={`rounded-card px-2 py-0.5 text-xs ${p[flag] ? "bg-maroon/15 text-maroon" : "bg-beige text-charcoal/60"}`}
                        >
                          {p[flag] ? "On" : "Off"}
                        </button>
                      </form>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
