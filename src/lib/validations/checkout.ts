import { z } from "zod";

// IMPORTANT: this schema deliberately has no "price" or "total" fields.
// The client only ever tells the server *what* it wants to buy — every
// price, discount, and total is recomputed server-side in lib/pricing.ts.
// This is what prevents client-side price manipulation (§49 of the spec).

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Full name is required").max(100),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

  // Either an existing saved address, or a fresh one entered at checkout.
  addressId: z.string().cuid().optional(),
  newAddress: z
    .object({
      line1: z.string().trim().min(3, "Address is required"),
      line2: z.string().trim().optional(),
      city: z.string().trim().min(2, "City is required"),
      state: z.string().trim().min(2, "State is required"),
      pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
      saveAddress: z.boolean().default(false),
    })
    .optional(),

  couponCode: z.string().trim().optional(),

  // Deliberately no "items" field: the server reads the caller's own cart
  // (resolved from their session/cookie in the route handler) rather than
  // trusting a client-submitted item list. This closes off a class of bug
  // where a modified payload could claim a cart that isn't actually the
  // caller's, or claim quantities never actually added to cart.

  paymentMethod: z.enum(["RAZORPAY", "COD"]).default("RAZORPAY"),
}).refine((data) => data.addressId || data.newAddress, {
  message: "A shipping address is required",
  path: ["addressId"],
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const pincodeCheckSchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});
