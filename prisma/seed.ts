import { PrismaClient, ProductStatus, CouponType, BannerType } from "@prisma/client";
import { hash as argon2Hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

// Placeholder imagery for local/dev seeding only — swap for real Cloudinary
// product photography before going live. picsum.photos gives stable,
// reproducible images per seed string so the same product always shows
// the same picture across reseeds.
function placeholderImage(seed: string, w = 900, h = 1200) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const SIZES = ["S", "M", "L", "XL"];

type SeedProduct = {
  name: string;
  fabric: string;
  colors: string[];
  sellingPrice: number;
  originalPrice: number;
  attributes: Record<string, string>;
  tags: string[];
};

const sarees: SeedProduct[] = [
  { name: "Banarasi Silk Saree — Maroon Zari", fabric: "Banarasi Silk", colors: ["Maroon", "Gold"], sellingPrice: 3499, originalPrice: 4999, attributes: { length: "6.3m", blousePiece: "Included, unstitched", care: "Dry clean only" }, tags: ["wedding", "silk", "festive"] },
  { name: "Chanderi Cotton Saree — Dusty Rose", fabric: "Chanderi Cotton", colors: ["Dusty Rose"], sellingPrice: 1899, originalPrice: 2499, attributes: { length: "6.2m", blousePiece: "Included, unstitched", care: "Hand wash cold" }, tags: ["daily wear", "cotton"] },
  { name: "Linen Handloom Saree — Terracotta Stripe", fabric: "Linen", colors: ["Terracotta"], sellingPrice: 2299, originalPrice: 2999, attributes: { length: "6.3m", blousePiece: "Included", care: "Dry clean recommended" }, tags: ["office wear", "linen"] },
  { name: "Kanjeevaram Silk Saree — Deep Maroon", fabric: "Kanjeevaram Silk", colors: ["Maroon", "Green"], sellingPrice: 5999, originalPrice: 7999, attributes: { length: "6.3m", blousePiece: "Included, unstitched", care: "Dry clean only" }, tags: ["wedding", "silk", "premium"] },
  { name: "Georgette Printed Saree — Floral Cream", fabric: "Georgette", colors: ["Cream", "Rose"], sellingPrice: 1699, originalPrice: 2199, attributes: { length: "6.2m", blousePiece: "Included", care: "Hand wash" }, tags: ["party wear"] },
  { name: "Cotton Handblock Saree — Indigo", fabric: "Pure Cotton", colors: ["Indigo Blue"], sellingPrice: 1499, originalPrice: 1899, attributes: { length: "6.2m", blousePiece: "Included", care: "Machine wash gentle" }, tags: ["daily wear", "block print"] },
  { name: "Tussar Silk Saree — Beige Border", fabric: "Tussar Silk", colors: ["Beige", "Maroon"], sellingPrice: 3199, originalPrice: 3999, attributes: { length: "6.3m", blousePiece: "Included, unstitched", care: "Dry clean only" }, tags: ["festive", "silk"] },
  { name: "Organza Saree — Dusty Rose Sequin", fabric: "Organza", colors: ["Dusty Rose"], sellingPrice: 2799, originalPrice: 3699, attributes: { length: "6.3m", blousePiece: "Included", care: "Dry clean only" }, tags: ["party wear", "festive"] },
  { name: "Mysore Silk Saree — Charcoal & Gold", fabric: "Mysore Silk", colors: ["Charcoal", "Gold"], sellingPrice: 4299, originalPrice: 5499, attributes: { length: "6.3m", blousePiece: "Included, unstitched", care: "Dry clean only" }, tags: ["wedding", "silk"] },
  { name: "Chiffon Saree — Cream Floral", fabric: "Chiffon", colors: ["Cream"], sellingPrice: 1399, originalPrice: 1799, attributes: { length: "6.2m", blousePiece: "Included", care: "Hand wash cold" }, tags: ["daily wear", "lightweight"] },
];

const kurtis: SeedProduct[] = [
  { name: "Cotton Straight Kurti — Terracotta", fabric: "Pure Cotton", colors: ["Terracotta"], sellingPrice: 899, originalPrice: 1199, attributes: { fit: "Straight", length: "Calf length" }, tags: ["daily wear", "cotton"] },
  { name: "A-Line Kurti — Dusty Rose Embroidered", fabric: "Rayon", colors: ["Dusty Rose"], sellingPrice: 1099, originalPrice: 1499, attributes: { fit: "A-line", length: "Knee length" }, tags: ["office wear"] },
  { name: "Printed Anarkali Kurti — Maroon Floral", fabric: "Cotton Blend", colors: ["Maroon"], sellingPrice: 1299, originalPrice: 1699, attributes: { fit: "Anarkali", length: "Calf length" }, tags: ["festive"] },
  { name: "Chikankari Kurti — Off White", fabric: "Cotton Lawn", colors: ["Off White"], sellingPrice: 1599, originalPrice: 2099, attributes: { fit: "Straight", length: "Knee length" }, tags: ["ethnic", "hand embroidered"] },
  { name: "Linen Kurti — Beige Minimal", fabric: "Linen", colors: ["Beige"], sellingPrice: 1199, originalPrice: 1599, attributes: { fit: "Straight", length: "Knee length" }, tags: ["office wear", "linen"] },
  { name: "Printed Kurti — Charcoal Geometric", fabric: "Rayon", colors: ["Charcoal"], sellingPrice: 999, originalPrice: 1399, attributes: { fit: "A-line", length: "Knee length" }, tags: ["casual"] },
  { name: "Cotton Kurti with Potli Buttons — Cream", fabric: "Pure Cotton", colors: ["Cream"], sellingPrice: 949, originalPrice: 1249, attributes: { fit: "Straight", length: "Calf length" }, tags: ["daily wear"] },
  { name: "Embroidered Yoke Kurti — Dusty Rose", fabric: "Rayon", colors: ["Dusty Rose"], sellingPrice: 1349, originalPrice: 1799, attributes: { fit: "Straight", length: "Knee length" }, tags: ["festive", "embroidered"] },
  { name: "Handblock Print Kurti — Indigo", fabric: "Pure Cotton", colors: ["Indigo Blue"], sellingPrice: 1049, originalPrice: 1399, attributes: { fit: "A-line", length: "Knee length" }, tags: ["block print", "daily wear"] },
  { name: "Layered Kurti — Terracotta & Cream", fabric: "Cotton Blend", colors: ["Terracotta", "Cream"], sellingPrice: 1449, originalPrice: 1899, attributes: { fit: "Layered A-line", length: "Calf length" }, tags: ["party wear"] },
];

const nightwear: SeedProduct[] = [
  { name: "Cotton Night Suit — Dusty Rose Print", fabric: "Pure Cotton", colors: ["Dusty Rose"], sellingPrice: 799, originalPrice: 1099, attributes: { comfortFit: "Relaxed fit", set: "Top + Pajama" }, tags: ["nightwear", "cotton"] },
  { name: "Satin Nightdress — Maroon", fabric: "Satin", colors: ["Maroon"], sellingPrice: 999, originalPrice: 1399, attributes: { comfortFit: "Semi-fitted", set: "Single piece" }, tags: ["nightwear", "satin"] },
  { name: "Cotton Rich Pajama Set — Beige Stripe", fabric: "Cotton Rich", colors: ["Beige"], sellingPrice: 849, originalPrice: 1149, attributes: { comfortFit: "Relaxed fit", set: "Top + Pajama" }, tags: ["nightwear", "loungewear"] },
  { name: "Printed Nighty — Terracotta Floral", fabric: "Hosiery Cotton", colors: ["Terracotta"], sellingPrice: 699, originalPrice: 949, attributes: { comfortFit: "Loose fit", set: "Single piece" }, tags: ["nightwear", "everyday"] },
  { name: "Soft Modal Night Suit — Charcoal", fabric: "Modal", colors: ["Charcoal"], sellingPrice: 1099, originalPrice: 1499, attributes: { comfortFit: "Relaxed fit", set: "Top + Pajama" }, tags: ["nightwear", "premium comfort"] },
  { name: "Cotton Shorts Set — Cream & Rose", fabric: "Pure Cotton", colors: ["Cream", "Rose"], sellingPrice: 749, originalPrice: 999, attributes: { comfortFit: "Relaxed fit", set: "Top + Shorts" }, tags: ["nightwear", "summer"] },
  { name: "Rayon Nighty — Dusty Rose Lace Trim", fabric: "Rayon", colors: ["Dusty Rose"], sellingPrice: 899, originalPrice: 1199, attributes: { comfortFit: "Semi-fitted", set: "Single piece" }, tags: ["nightwear"] },
  { name: "Cotton Night Suit — Indigo Print", fabric: "Pure Cotton", colors: ["Indigo Blue"], sellingPrice: 799, originalPrice: 1099, attributes: { comfortFit: "Relaxed fit", set: "Top + Pajama" }, tags: ["nightwear", "cotton"] },
  { name: "Satin Robe & Nightdress Set — Maroon", fabric: "Satin", colors: ["Maroon"], sellingPrice: 1499, originalPrice: 1999, attributes: { comfortFit: "Semi-fitted", set: "Robe + Nightdress" }, tags: ["nightwear", "gifting"] },
  { name: "Cotton Capri Set — Beige Floral", fabric: "Pure Cotton", colors: ["Beige"], sellingPrice: 799, originalPrice: 1099, attributes: { comfortFit: "Relaxed fit", set: "Top + Capri" }, tags: ["nightwear", "cotton"] },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCategoryProducts(
  categoryId: string,
  categorySlug: string,
  products: SeedProduct[],
  sizeSet: string[]
) {
  for (const [index, p] of products.entries()) {
    const slug = slugify(p.name);
    const sku = `${categorySlug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        categoryId,
        shortDescription: `${p.fabric} ${categorySlug.slice(0, -1)} in a versatile everyday shade.`,
        fullDescription: `A ${p.fabric.toLowerCase()} piece designed for comfort and everyday elegance. Part of Anchal's curated ${categorySlug} collection — thoughtfully made, easy to style.`,
        sellingPrice: p.sellingPrice,
        originalPrice: p.originalPrice,
        sku,
        stockQuantity: sizeSet.length * 8,
        fabric: p.fabric,
        colors: p.colors,
        sizes: sizeSet,
        tags: p.tags,
        attributes: p.attributes,
        featured: index % 4 === 0,
        newArrival: index % 3 === 0,
        onSale: p.sellingPrice < p.originalPrice * 0.85,
        status: ProductStatus.ACTIVE,
        careInstructions: p.attributes.care ?? "Follow the care label inside the garment.",
        images: {
          create: [
            { url: placeholderImage(`${slug}-1`), altText: p.name, isPrimary: true, sortOrder: 0 },
            { url: placeholderImage(`${slug}-2`), altText: `${p.name} — alternate view`, isPrimary: false, sortOrder: 1 },
          ],
        },
        variants: {
          create: sizeSet.map((size) => ({
            size,
            color: p.colors[0],
            sku: `${sku}-${size}`,
            stockQuantity: size === "M" ? 4 : 8, // Medium intentionally low — demonstrates the low-stock admin indicator
          })),
        },
      },
    });

    // One approved review per product so the storefront's rating UI has
    // real data to render against in dev.
    void product;
  }
}

async function main() {
  console.log("Seeding Anchal database...");

  // --- Admin user -----------------------------------------------------
  const adminPasswordHash = await argon2Hash("ChangeMe123!"); // dev-only default — rotate before production
  const admin = await prisma.user.upsert({
    where: { email: "admin@anchal.in" },
    update: {},
    create: {
      name: "Anchal Admin",
      email: "admin@anchal.in",
      phone: "9800000000",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // --- A sample customer, for testing orders/reviews -------------------
  const customerPasswordHash = await argon2Hash("Customer123!");
  const customer = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "9811111111",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      addresses: {
        create: [
          {
            fullName: "Priya Sharma",
            phone: "9811111111",
            line1: "14 Lake Gardens",
            city: "Kolkata",
            state: "West Bengal",
            pincode: "700045",
            isDefault: true,
          },
        ],
      },
    },
  });

  // --- Categories -------------------------------------------------------
  const sareeCategory = await prisma.category.upsert({
    where: { slug: "sarees" },
    update: {},
    create: { name: "Sarees", slug: "sarees", description: "Handpicked sarees for every occasion.", sortOrder: 1 },
  });
  const kurtiCategory = await prisma.category.upsert({
    where: { slug: "kurtis" },
    update: {},
    create: { name: "Kurtis", slug: "kurtis", description: "Everyday and festive kurtis.", sortOrder: 2 },
  });
  const nightwearCategory = await prisma.category.upsert({
    where: { slug: "nightwear" },
    update: {},
    create: { name: "Nightwear", slug: "nightwear", description: "Soft, comfortable nightwear.", sortOrder: 3 },
  });

  // --- Products -----------------------------------------------------
  // Sarees are one-size (blouse piece included, unstitched) — no size grid.
  await seedCategoryProducts(sareeCategory.id, "sarees", sarees, ["Free Size"]);
  await seedCategoryProducts(kurtiCategory.id, "kurtis", kurtis, SIZES);
  await seedCategoryProducts(nightwearCategory.id, "nightwear", nightwear, SIZES);

  // --- A review on one product, to seed the ratings UI ------------------
  const sampleProduct = await prisma.product.findFirst({ where: { categoryId: kurtiCategory.id } });
  if (sampleProduct) {
    await prisma.review.upsert({
      where: { productId_userId: { productId: sampleProduct.id, userId: customer.id } },
      update: {},
      create: {
        productId: sampleProduct.id,
        userId: customer.id,
        rating: 5,
        comment: "Lovely fabric and true to size. Anchal has become my go-to for everyday kurtis.",
        isApproved: true,
      },
    });
    await prisma.product.update({
      where: { id: sampleProduct.id },
      data: { avgRating: 5.0, reviewCount: 1 },
    });
  }

  // --- Coupons ------------------------------------------------------
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minOrderAmount: 999,
      usageLimit: 500,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      type: CouponType.FIXED,
      value: 200,
      minOrderAmount: 1999,
      usageLimit: 200,
      isActive: true,
    },
  });

  // --- Homepage banners -----------------------------------------------
  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      {
        type: BannerType.HERO,
        imageUrl: placeholderImage("anchal-hero-1", 1600, 800),
        title: "Everyday Fashion, Beautifully Yours",
        subtitle: "Handpicked sarees, kurtis & nightwear for the modern Indian woman.",
        ctaText: "Shop Sarees",
        ctaLink: "/sarees",
        sortOrder: 0,
        isActive: true,
      },
      {
        type: BannerType.PROMOTIONAL,
        imageUrl: placeholderImage("anchal-promo-1", 1200, 600),
        title: "New Season, New Styles",
        subtitle: "Fresh arrivals every week.",
        ctaText: "Explore New Arrivals",
        ctaLink: "/new-arrivals",
        sortOrder: 0,
        isActive: true,
      },
    ],
  });

  // --- Newsletter sample -------------------------------------------
  await prisma.newsletterSubscriber.upsert({
    where: { email: "subscriber@example.com" },
    update: {},
    create: { email: "subscriber@example.com" },
  });

  console.log("Seed complete.");
  console.log(`Admin login: admin@anchal.in / ChangeMe123!  (id: ${admin.id})`);
  console.log(`Customer login: priya@example.com / Customer123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
