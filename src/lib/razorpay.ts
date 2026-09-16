import Razorpay from "razorpay";
import crypto from "crypto";

// This file must NEVER be imported from a client component — it holds the
// Razorpay secret. It's only ever called from app/api/** route handlers,
// which run exclusively on the server.

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Creates a Razorpay order. Amount must be passed in the smallest currency
 * unit (paise), matching Razorpay's API contract. */
export async function createRazorpayOrder(amountInRupees: number, receiptId: string) {
  return getRazorpayClient().orders.create({
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

  const expected = Buffer.from(expectedSignature, "utf-8");
  const received = Buffer.from(razorpaySignature, "utf-8");
  if (expected.length !== received.length) return false;

  // Constant-time comparison — prevents a timing attack from leaking the
  // correct signature byte-by-byte.
  return crypto.timingSafeEqual(
    expected,
    received
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

  const expected = Buffer.from(expectedSignature, "utf-8");
  const received = Buffer.from(signatureHeader, "utf-8");
  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(expected, received);
}
