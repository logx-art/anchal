import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { confirmPaidOrder } from "@/lib/payment-confirmation";

// -----------------------------------------------------------------------
// Razorpay webhook — the durable backstop confirmation path described in
// the architecture doc §5. Configure this URL in the Razorpay dashboard
// for the `payment.captured` and `payment.failed` events, with the
// separate webhook secret set as RAZORPAY_WEBHOOK_SECRET.
//
// This must read the raw request body (not request.json()) because the
// signature is computed over the exact raw bytes Razorpay sent.
// -----------------------------------------------------------------------

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const dbPayment = await prisma.payment.findUnique({ where: { razorpayOrderId: payment.order_id } });
    if (dbPayment) {
      const order = await prisma.order.findUnique({ where: { id: dbPayment.orderId } });
      if (order) {
        await confirmPaidOrder({
          orderNumber: order.orderNumber,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
        });
      }
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    await prisma.payment.updateMany({
      where: { razorpayOrderId: payment.order_id },
      data: { status: "FAILED", rawWebhookPayload: event },
    });
    // Note: a scheduled job (not included in this scaffold) should
    // release any stock reserved for orders that stay unpaid past a
    // timeout — see architecture doc §4, point 7.
  }

  return new Response("ok", { status: 200 });
}
