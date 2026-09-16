import { z } from "zod";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { confirmPaidOrder } from "@/lib/payment-confirmation";
import { apiSuccess, apiError, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({
  orderNumber: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Called from the client immediately after Razorpay Checkout's handler
// fires. This is the fast-path confirmation; the webhook route below is
// the backstop that fires independently, in case the browser closes
// before this request completes.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!valid) {
    return apiError("SIGNATURE_INVALID", "Payment verification failed.", 400);
  }

  await confirmPaidOrder({ orderNumber, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature });

  return apiSuccess({ verified: true });
}
