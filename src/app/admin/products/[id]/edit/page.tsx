import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/admin-actions";
import type { ProductInput } from "@/lib/validations/product";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [categories, product] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    }),
  ]);

  if (!product) notFound();

  const initial: Partial<ProductInput> = {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    sellingPrice: Number(product.sellingPrice),
    originalPrice: Number(product.originalPrice),
    sku: product.sku,
    fabric: product.fabric ?? "",
    colors: product.colors,
    tags: product.tags,
    careInstructions: product.careInstructions ?? "",
    featured: product.featured,
    newArrival: product.newArrival,
    onSale: product.onSale,
    status: product.status,
    images: product.images.map(({ url, altText, isPrimary, sortOrder }) => ({
      url,
      altText: altText ?? "",
      isPrimary,
      sortOrder,
    })),
    variants: product.variants.map(({ size, color, sku, stockQuantity }) => ({
      size: size ?? "",
      color: color ?? "",
      sku,
      stockQuantity,
    })),
  };

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Edit Product</h1>
      <ProductForm
        categories={categories}
        initial={initial}
        onSubmit={updateProduct.bind(null, product.id)}
      />
    </div>
  );
}
