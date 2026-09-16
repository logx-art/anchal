import Razorpay from "razorpay";
import crypto from "crypto";

// This file must NEVER be imported from a client component — it holds the
// Razorpay secret. It's only ever called from app/api/** route handlers,
// which run exclusively on the server.

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // Fails loudly at boot in any environment missing the keys, rather than
  // failing silently the first time a customer tries to pay.
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Payment routes will fail until they are configured in .env."
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

/** Creates a Razorpay order. Amount must be passed in the smallest currency
 * unit (paise), matching Razorpay's API contract. */
export async function createRazorpayOrder(amountInRupees: number, receiptId: string) {
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt: receiptId,
    payment_capture: true,
  });
}

/**
 * Recomputes the HMAC-SHA256 signature from the order/payment IDs using
 * our secret and compares it to what Razorpay sent back. This is the only
 * trustworthy way to know a payment actually succeeded — a "success"
 * message from the frontend alone means nothing (§20 of the spec).
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // Constant-time comparison — prevents a timing attack from leaking the
  // correct signature byte-by-byte.
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(razorpaySignature, "utf-8")
  );
}

/**
 * Verifies the signature Razorpay attaches to webhook payloads
 * (X-Razorpay-Signature header) using the separate webhook secret
 * configured in the Razorpay dashboard. This is the backstop confirmation
 * path described in the architecture doc §5 — it fires independently of
 * whether the customer's browser stayed open through the redirect.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signatureHeader, "utf-8")
  );
}
