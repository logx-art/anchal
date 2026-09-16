import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";

// -----------------------------------------------------------------------
// Prisma's Decimal type isn't safe to pass straight from a Server
// Component into a Client Component prop (it isn't a plain serializable
// value), so every function here returns plain numbers. This is the one
// place that mapping happens, rather than repeating it in every page.
// -----------------------------------------------------------------------

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  sellingPrice: true,
  originalPrice: true,
  newArrival: true,
  onSale: true,
  stockQuantity: true,
  avgRating: true,
  reviewCount: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 2,
    select: { url: true, altText: true, isPrimary: true },
  },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  originalPrice: number;
  discountPercent: number;
  newArrival: boolean;
  onSale: boolean;
  inStock: boolean;
  avgRating: number;
  reviewCount: number;
  image: string | null;
  hoverImage: string | null;
  category: { name: string; slug: string };
};

function toCardData(p: Prisma.ProductGetPayload<{ select: typeof productCardSelect }>): ProductCardData {
  const sellingPrice = Number(p.sellingPrice);
  const originalPrice = Number(p.originalPrice);
  const discountPercent =
    originalPrice > sellingPrice ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sellingPrice,
    originalPrice,
    discountPercent,
    newArrival: p.newArrival,
    onSale: p.onSale,
    inStock: p.stockQuantity > 0,
    avgRating: Number(p.avgRating),
    reviewCount: p.reviewCount,
    image: p.images[0]?.url ?? null,
    hoverImage: p.images[1]?.url ?? null,
    category: p.category,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, featured: true },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toCardData);
}

export async function getNewArrivals(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, newArrival: true },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toCardData);
}

export async function getSaleProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, onSale: true },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toCardData);
}

export type ProductFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  fabrics?: string[];
  inStockOnly?: boolean;
  newArrivalOnly?: boolean;
  onSaleOnly?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
};

export async function getProducts(filters: ProductFilters) {
  const {
    categorySlug,
    minPrice,
    maxPrice,
    sizes,
    colors,
    fabrics,
    inStockOnly,
    newArrivalOnly,
    onSaleOnly,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(newArrivalOnly ? { newArrival: true } : {}),
    ...(onSaleOnly ? { onSale: true } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          sellingPrice: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(sizes?.length ? { sizes: { hasSome: sizes } } : {}),
    ...(colors?.length ? { colors: { hasSome: colors } } : {}),
    ...(fabrics?.length ? { fabric: { in: fabrics } } : {}),
    ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { sellingPrice: "asc" }
      : sort === "price-desc"
        ? { sellingPrice: "desc" }
        : sort === "popular"
          ? { reviewCount: "desc" }
          : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toCardData),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Distinct fabric/color/size values within a category, to populate the
 * filter panel without hardcoding options per category. */
export async function getFilterOptions(categorySlug?: string) {
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    select: { fabric: true, colors: true, sizes: true, sellingPrice: true },
  });

  const fabrics = new Set<string>();
  const colors = new Set<string>();
  const sizes = new Set<string>();
  let maxPrice = 0;

  for (const p of products) {
    if (p.fabric) fabrics.add(p.fabric);
    p.colors.forEach((c) => colors.add(c));
    p.sizes.forEach((s) => sizes.add(s));
    maxPrice = Math.max(maxPrice, Number(p.sellingPrice));
  }

  return {
    fabrics: [...fabrics].sort(),
    colors: [...colors].sort(),
    sizes: [...sizes].sort(),
    maxPrice: Math.ceil(maxPrice / 100) * 100,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!product) return null;

  return {
    ...product,
    sellingPrice: Number(product.sellingPrice),
    originalPrice: Number(product.originalPrice),
    avgRating: Number(product.avgRating),
    variants: product.variants.map((v) => ({
      ...v,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    })),
  };
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: { categoryId, status: ProductStatus.ACTIVE, id: { not: excludeProductId } },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toCardData);
}

export async function searchProducts(query: string, limit = 20) {
  if (!query.trim()) return [];
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { fabric: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query.toLowerCase()] } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    select: productCardSelect,
    take: limit,
  });
  return products.map(toCardData);
}
