"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProductInput } from "@/lib/validations/product";

type Category = { id: string; name: string };

type ImageField = { url: string; altText: string; isPrimary: boolean; sortOrder: number };
type VariantField = { size: string; color: string; sku: string; stockQuantity: number };

export function ProductForm({
  categories,
  initial,
  onSubmit,
}: {
  categories: Category[];
  initial?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice?.toString() ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [colors, setColors] = useState(initial?.colors?.join(", ") ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [careInstructions, setCareInstructions] = useState(initial?.careInstructions ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [newArrival, setNewArrival] = useState(initial?.newArrival ?? false);
  const [onSale, setOnSale] = useState(initial?.onSale ?? false);
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");

  const [images, setImages] = useState<ImageField[]>(
    (initial?.images as ImageField[] | undefined) ?? []
  );
  const [variants, setVariants] = useState<VariantField[]>(
    (initial?.variants as VariantField[] | undefined) ?? [{ size: "", color: "", sku: "", stockQuantity: 0 }]
  );

  async function uploadImage(file: File) {
    const signRes = await fetch("/api/uploads/sign", { method: "POST" });
    const { data: sig } = await signRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const uploaded = await uploadRes.json();

    setImages((prev) => [
      ...prev,
      { url: uploaded.secure_url, altText: name, isPrimary: prev.length === 0, sortOrder: prev.length },
    ]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ProductInput = {
      name,
      slug,
      categoryId,
      shortDescription,
      fullDescription,
      sellingPrice: Number(sellingPrice),
      originalPrice: Number(originalPrice),
      sku,
      fabric,
      colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: variants.map((v) => v.size).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured,
      newArrival,
      onSale,
      status: status as ProductInput["status"],
      careInstructions,
      images,
      variants: variants.map((v) => ({ ...v, stockQuantity: Number(v.stockQuantity) })),
    } as ProductInput;

    startTransition(async () => {
      try {
        await onSubmit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save this product. Check the fields and try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && <p className="rounded-card bg-rose-light p-3 text-sm text-maroon-dark">{error}</p>}

      {/* Basic info */}
      <FormSection title="Basic Information">
        <TextField label="Product Name" value={name} onChange={setName} required />
        <TextField label="Slug (URL)" value={slug} onChange={setSlug} required hint="lowercase-with-hyphens" />
        <div>
          <label className="mb-1 block text-sm text-charcoal">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <TextField label="SKU" value={sku} onChange={setSku} required />
      </FormSection>

      <FormSection title="Description">
        <TextArea label="Short Description" value={shortDescription} onChange={setShortDescription} rows={2} />
        <TextArea label="Full Description" value={fullDescription} onChange={setFullDescription} rows={4} />
        <TextArea label="Care Instructions" value={careInstructions} onChange={setCareInstructions} rows={2} />
      </FormSection>

      <FormSection title="Pricing">
        <TextField label="Selling Price (₹)" value={sellingPrice} onChange={setSellingPrice} type="number" required />
        <TextField label="Original Price (₹)" value={originalPrice} onChange={setOriginalPrice} type="number" required />
      </FormSection>

      <FormSection title="Attributes">
        <TextField label="Fabric" value={fabric} onChange={setFabric} />
        <TextField label="Colors (comma-separated)" value={colors} onChange={setColors} />
        <TextField label="Tags (comma-separated)" value={tags} onChange={setTags} />
      </FormSection>

      {/* Images */}
      <FormSection title="Images">
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-20 w-20 rounded-card object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-1 -top-1 rounded-full bg-charcoal p-1 text-cream"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-card border border-dashed border-beige text-charcoal/50">
            <Upload size={16} />
            <span className="text-xs">Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
            />
          </label>
        </div>
      </FormSection>

      {/* Variants */}
      <FormSection title="Size & Stock">
        <div className="flex flex-col gap-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2">
              <TextField label="Size" value={v.size} onChange={(val) => updateVariant(i, "size", val)} compact />
              <TextField label="Color" value={v.color} onChange={(val) => updateVariant(i, "color", val)} compact />
              <TextField label="SKU" value={v.sku} onChange={(val) => updateVariant(i, "sku", val)} compact />
              <TextField
                label="Stock"
                type="number"
                value={String(v.stockQuantity)}
                onChange={(val) => updateVariant(i, "stockQuantity", val)}
                compact
              />
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                className="mb-1 p-2 text-terracotta"
                aria-label="Remove variant"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { size: "", color: "", sku: "", stockQuantity: 0 }])}
            className="flex w-fit items-center gap-1.5 text-sm text-maroon"
          >
            <Plus size={14} /> Add size/variant
          </button>
        </div>
      </FormSection>

      {/* Flags */}
      <FormSection title="Visibility">
        <div className="flex flex-wrap gap-4">
          <Checkbox label="Featured Product" checked={featured} onChange={setFeatured} />
          <Checkbox label="New Arrival" checked={newArrival} onChange={setNewArrival} />
          <Checkbox label="Sale Product" checked={onSale} onChange={setOnSale} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-charcoal">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-card border border-beige bg-cream px-3 py-2 text-sm"
          >
            <option value="DRAFT">Draft (hidden from customers)</option>
            <option value="ACTIVE">Active (visible in store)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );

  function updateVariant(index: number, key: keyof VariantField, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: key === "stockQuantity" ? Number(value) : value } : v))
    );
  }
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-beige p-4">
      <h2 className="mb-4 font-medium text-charcoal">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  label, value, onChange, type = "text", required, hint, compact,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; hint?: string; compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "sm:col-span-1"}>
      <label className="mb-1 block text-sm text-charcoal">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
      />
      {hint && <p className="mt-0.5 text-xs text-charcoal/40">{hint}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-sm text-charcoal">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-charcoal">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-beige text-maroon" />
      {label}
    </label>
  );
}
