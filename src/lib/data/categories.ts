import { prisma } from "@/lib/prisma";
import { BannerType } from "@prisma/client";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, image: true, description: true },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug, isActive: true } });
}

const now = () => new Date();

export async function getHeroBanners() {
  return prisma.banner.findMany({
    where: {
      type: BannerType.HERO,
      isActive: true,
      OR: [{ startDate: null }, { startDate: { lte: now() } }],
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPromoBanners() {
  return prisma.banner.findMany({
    where: { type: BannerType.PROMOTIONAL, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
