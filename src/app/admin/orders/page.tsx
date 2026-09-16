import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_OPTIONS: OrderStatus[] = [
  "ORDER_PLACED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { customerName: { contains: q, mode: "insensitive" } },
              { customerEmail: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Orders</h1>

      <form className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search order #, name, or email…"
          className="w-full max-w-sm rounded-card border border-beige bg-cream px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-beige bg-cream px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <button type="submit" className="rounded-card bg-beige px-4 py-2 text-sm text-charcoal">Filter</button>
      </form>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders will appear here as customers check out." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-beige">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/40 text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-beige hover:bg-beige/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-maroon">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    {order.customerName}
                    <div className="text-xs text-charcoal/50">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">₹{Number(order.total).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-charcoal/70">{order.paymentStatus}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-charcoal/50">{order.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
