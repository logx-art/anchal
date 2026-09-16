"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, OrderStatus, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { couponSchema } from "@/lib/validations/coupon";

// -----------------------------------------------------------------------
// Server Actions for admin mutations (per the architecture doc §7: simple
// form-submit-and-redirect interactions use Server Actions; anything
// needing optimistic/inline updates uses a Route Handler instead — see
// app/api/admin/**). Every action re-checks requireAdmin() itself; the
// middleware gate is not trusted as the only protection.
// -----------------------------------------------------------------------

async function assertAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Forbidden: admin access required.");
  return admin;
}

// ---- Products ----------------------------------------------------------

export async function createProduct(input: unknown) {
  await assertAdmin();
  const data = productSchema.parse(input);

  await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      sellingPrice: data.sellingPrice,
      originalPrice: data.originalPrice,
      sku: data.sku,
      fabric: data.fabric,
      colors: data.colors,
      sizes: data.sizes,
      tags: data.tags,
      attributes: data.attributes as Prisma.InputJsonValue,
      featured: data.featured,
      newArrival: data.newArrival,
      onSale: data.onSale,
      status: data.status as ProductStatus,
      careInstructions: data.careInstructions,
      stockQuantity: data.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      images: { create: data.images },
      variants: { create: data.variants },
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, input: unknown) {
  await assertAdmin();
  const data = productSchema.parse(input);

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productVariant.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        sellingPrice: data.sellingPrice,
        originalPrice: data.originalPrice,
        sku: data.sku,
        fabric: data.fabric,
        colors: data.colors,
        sizes: data.sizes,
        tags: data.tags,
        attributes: data.attributes as Prisma.InputJsonValue,
        featured: data.featured,
        newArrival: data.newArrival,
        onSale: data.onSale,
        status: data.status as ProductStatus,
        careInstructions: data.careInstructions,
        stockQuantity: data.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
        images: { create: data.images },
        variants: { create: data.variants },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await assertAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
}

export async function duplicateProduct(productId: string) {
  await assertAdmin();
  const original = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true, variants: true },
  });
  if (!original) throw new Error("Product not found.");

  const copySuffix = `-copy-${Date.now().toString(36)}`;
  await prisma.product.create({
    data: {
      name: `${original.name} (Copy)`,
      slug: `${original.slug}${copySuffix}`,
      categoryId: original.categoryId,
      shortDescription: original.shortDescription,
      fullDescription: original.fullDescription,
      sellingPrice: original.sellingPrice,
      originalPrice: original.originalPrice,
      sku: `${original.sku}${copySuffix}`,
      stockQuantity: 0,
      fabric: original.fabric,
      colors: original.colors,
      sizes: original.sizes,
      tags: original.tags,
      attributes: original.attributes as Prisma.InputJsonValue,
      careInstructions: original.careInstructions,
      status: ProductStatus.DRAFT, // duplicates land as drafts, never silently go live
      images: { create: original.images.map(({ url, altText, isPrimary, sortOrder }) => ({ url, altText, isPrimary, sortOrder })) },
      variants: {
        create: original.variants.map(({ size, color, sku }, i) => ({
          size,
          color,
          sku: `${sku}${copySuffix}${i}`,
          stockQuantity: 0,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  await assertAdmin();
  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/products");
}

// ---- Categories ---------------------------------------------------------

export async function createCategory(input: { name: string; slug: string; description?: string }) {
  await assertAdmin();
  await prisma.category.create({ data: input });
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, input: { name: string; slug: string; description?: string; isActive: boolean }) {
  await assertAdmin();
  await prisma.category.update({ where: { id }, data: input });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

// ---- Orders --------------------------------------------------------------

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await assertAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

// ---- Coupons ---------------------------------------------------------

export async function createCoupon(input: unknown) {
  await assertAdmin();
  const data = couponSchema.parse(input);
  await prisma.coupon.create({ data });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await assertAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

// ---- Homepage banners -----------------------------------------------------

export async function createBanner(input: {
  type: "HERO" | "PROMOTIONAL";
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  await assertAdmin();
  await prisma.banner.create({ data: input });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await assertAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

// ---- Product feature flags (featured/new/sale toggles for homepage mgmt) --

export async function toggleProductFlag(
  productId: string,
  flag: "featured" | "newArrival" | "onSale",
  value: boolean
) {
  await assertAdmin();
  await prisma.product.update({ where: { id: productId }, data: { [flag]: value } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}
