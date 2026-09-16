import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { updateOrderStatus } from "@/lib/admin-actions";

const STATUS_OPTIONS: OrderStatus[] = [
  "ORDER_PLACED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, address: true },
  });
  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">{order.orderNumber}</h1>
          <p className="text-sm text-charcoal/60">Placed {order.createdAt.toLocaleString("en-IN")}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-beige p-4">
            <p className="mb-3 font-medium text-charcoal">Items</p>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-card bg-beige">
                    {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-charcoal">{item.productName}</p>
                    <p className="text-charcoal/60">
                      {[item.size, item.color].filter(Boolean).join(" · ")} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-charcoal">₹{Number(item.price).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-card border border-beige p-4">
            <p className="mb-3 font-medium text-charcoal">Payment</p>
            <dl className="grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-charcoal/60">Status</dt>
              <dd className="text-charcoal">{order.paymentStatus}</dd>
              <dt className="text-charcoal/60">Method</dt>
              <dd className="text-charcoal">{order.payment?.method ?? "—"}</dd>
              <dt className="text-charcoal/60">Razorpay Order ID</dt>
              <dd className="text-charcoal">{order.payment?.razorpayOrderId ?? "—"}</dd>
              <dt className="text-charcoal/60">Razorpay Payment ID</dt>
              <dd className="text-charcoal">{order.payment?.razorpayPaymentId ?? "—"}</dd>
            </dl>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-beige p-4">
            <p className="mb-3 font-medium text-charcoal">Update Status</p>
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateOrderStatus(order.id, formData.get("status") as OrderStatus);
              }}
              className="flex flex-col gap-3"
            >
              <select name="status" defaultValue={order.status} className="rounded-card border border-beige bg-cream px-3 py-2 text-sm">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
              <button type="submit" className="rounded-card bg-maroon px-4 py-2 text-sm text-cream">
                Save Status
              </button>
            </form>
          </section>

          <section className="rounded-card border border-beige p-4">
            <p className="mb-3 font-medium text-charcoal">Customer & Shipping</p>
            <p className="text-sm text-charcoal">{order.customerName}</p>
            <p className="text-sm text-charcoal/60">{order.customerEmail}</p>
            <p className="text-sm text-charcoal/60">{order.customerPhone}</p>
            <p className="mt-3 text-sm text-charcoal/70">
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingPincode}
            </p>
          </section>

          <section className="rounded-card border border-beige p-4">
            <p className="mb-3 font-medium text-charcoal">Order Summary</p>
            <dl className="flex flex-col gap-1 text-sm">
              <Row label="Subtotal" value={order.subtotal} />
              <Row label="Discount" value={order.discount.negated()} />
              <Row label="Shipping" value={order.shipping} />
              <div className="mt-1 flex justify-between border-t border-beige pt-1 font-medium text-charcoal">
                <span>Total</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: { toString(): string } }) {
  const num = Number(value.toString());
  return (
    <div className="flex justify-between text-charcoal/70">
      <span>{label}</span>
      <span>{num < 0 ? "−" : ""}₹{Math.abs(num).toLocaleString("en-IN")}</span>
    </div>
  );
}
