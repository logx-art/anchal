import { z } from "zod";

// Used by the admin "Add/Edit Product" form and its corresponding API route.

export const productVariantSchema = z.object({
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  sku: z.string().trim().min(1, "SKU is required"),
  stockQuantity: z.coerce.number().int().min(0, "Stock can't be negative"),
  priceOverride: z.coerce.number().positive().optional().nullable(),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Product name is required").max(200),
    slug: z
      .string()
      .trim()
      .min(3)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
    categoryId: z.string().cuid("Select a category"),
    shortDescription: z.string().trim().min(10, "Add a short description").max(300),
    fullDescription: z.string().trim().min(20, "Add a full description"),

    sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
    originalPrice: z.coerce.number().positive("Original price must be greater than 0"),

    sku: z.string().trim().min(1, "SKU is required"),
    fabric: z.string().trim().optional(),
    colors: z.array(z.string().trim()).default([]),
    sizes: z.array(z.string().trim()).default([]),
    tags: z.array(z.string().trim()).default([]),

    // Category-specific fields — validated loosely here; the admin form
    // renders the right subset of fields per category (saree/kurti/nightwear)
    attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional(),

    featured: z.boolean().default(false),
    newArrival: z.boolean().default(false),
    onSale: z.boolean().default(false),
    status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK"]).default("DRAFT"),

    careInstructions: z.string().trim().optional(),

    images: z
      .array(
        z.object({
          url: z.string().url(),
          altText: z.string().optional(),
          isPrimary: z.boolean().default(false),
          sortOrder: z.number().int().default(0),
        })
      )
      .min(1, "Upload at least one product image"),

    variants: z.array(productVariantSchema).min(1, "Add at least one size/stock variant"),
  })
  .refine((data) => data.sellingPrice <= data.originalPrice, {
    message: "Selling price can't be higher than the original price",
    path: ["sellingPrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;
