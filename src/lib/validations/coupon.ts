import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code is required")
      .max(20)
      .transform((v) => v.toUpperCase()),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.coerce.number().positive("Value must be greater than 0"),
    minOrderAmount: z.coerce.number().min(0).default(0),
    expiryDate: z.coerce.date().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    message: "Percentage discount can't exceed 100%",
    path: ["value"],
  });

export type CouponInput = z.infer<typeof couponSchema>;
