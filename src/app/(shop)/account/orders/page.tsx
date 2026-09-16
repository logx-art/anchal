import Link from "next/link";
import { Package } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user!.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center justify-between rounded-card border border-beige p-4 text-sm hover:border-charcoal/30"
            >
              <div>
                <p className="font-medium text-charcoal">{order.orderNumber}</p>
                <p className="mt-0.5 text-charcoal/60">
                  {order.items.length} item(s) · ₹{Number(order.total).toLocaleString("en-IN")} ·{" "}
                  {order.createdAt.toLocaleDateString("en-IN")}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
