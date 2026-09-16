import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/admin-actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Add Product</h1>
      <ProductForm categories={categories} onSubmit={createProduct} />
    </div>
  );
}
