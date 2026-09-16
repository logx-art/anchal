import { notFound } from "next/navigation";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

const STEPS = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: user!.id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  const currentStepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">{order.orderNumber}</h1>
          <p className="text-sm text-charcoal/60">Placed on {order.createdAt.toLocaleDateString("en-IN")}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* This IS a genuine sequence (a shipment's lifecycle), so a numbered
          step tracker is the right structural device here. */}
      {order.status !== "CANCELLED" && (
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-1 items-center gap-2">
              <span
                className={`h-2 flex-1 rounded-full ${i <= currentStepIndex ? "bg-maroon" : "bg-beige"}`}
              />
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 border-b border-beige pb-4">
            {item.imageUrl && (
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-card bg-beige">
                <Image src={item.imageUrl} alt={item.productName} fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div className="flex-1 text-sm">
              <p className="text-charcoal">{item.productName}</p>
              {(item.size || item.color) && (
                <p className="mt-0.5 text-charcoal/50">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
              )}
              <p className="mt-1 text-charcoal/70">Qty {item.quantity} · ₹{Number(item.price).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-card bg-beige/30 p-4 text-sm">
          <p className="mb-2 font-medium text-charcoal">Shipping Address</p>
          <p className="text-charcoal/70">
            {order.customerName}<br />
            {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}<br />
            {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
          </p>
        </div>
        <div className="rounded-card bg-beige/30 p-4 text-sm">
          <p className="mb-2 font-medium text-charcoal">Payment Summary</p>
          <p className="text-charcoal/70">Subtotal: ₹{Number(order.subtotal).toLocaleString("en-IN")}</p>
          {Number(order.discount) > 0 && (
            <p className="text-charcoal/70">Discount: -₹{Number(order.discount).toLocaleString("en-IN")}</p>
          )}
          <p className="text-charcoal/70">Shipping: {Number(order.shipping) === 0 ? "Free" : `₹${Number(order.shipping)}`}</p>
          <p className="mt-1 font-medium text-charcoal">Total: ₹{Number(order.total).toLocaleString("en-IN")}</p>
          <p className="mt-2 text-xs text-charcoal/50">Payment status: {order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
