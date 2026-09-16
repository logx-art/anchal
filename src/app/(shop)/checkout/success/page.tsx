import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center md:px-8">
      <CheckCircle2 size={40} className="mx-auto text-maroon" strokeWidth={1.5} />
      <h1 className="mt-4 font-serif text-3xl text-charcoal">Order placed!</h1>

      {order ? (
        <>
          <p className="mt-2 text-sm text-charcoal/70">
            Thank you, {order.customerName}. Your order <strong>{order.orderNumber}</strong> has
            been confirmed and is on its way to being prepared.
          </p>
          <div className="mt-8 rounded-card bg-beige/40 p-5 text-left text-sm">
            <p className="font-medium text-charcoal">{order.items.length} item(s) · ₹{Number(order.total).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-charcoal/60">
              Shipping to {order.shippingLine1}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-charcoal/70">Your order has been placed successfully.</p>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <LinkButton href="/account/orders" variant="secondary">
          View Order
        </LinkButton>
        <LinkButton href="/shop">Continue Shopping</LinkButton>
      </div>
    </div>
  );
}
