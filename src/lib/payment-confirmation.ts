import { prisma } from "@/lib/prisma";

/**
 * Idempotently marks an order and its payment as paid.
 */
export async function confirmPaidOrder(params: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order) return;

  if (order.paymentStatus === "PAID") return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: order.id },
      data: {
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        status: "PAID",
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "ORDER_PLACED" },
    }),
  ]);
}