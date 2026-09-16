import Link from "next/link";
import { IndianRupee, ShoppingCart, Users, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export default async function AdminDashboardPage() {
  const [totalSalesAgg, totalOrders, totalCustomers, pendingOrders, recentOrders, lowStockVariants] =
    await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "ORDER_PLACED" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
      prisma.productVariant.findMany({
        where: { stockQuantity: { lte: 5, gt: 0 } },
        include: { product: { select: { name: true } } },
        take: 8,
        orderBy: { stockQuantity: "asc" },
      }),
    ]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total Sales" value={`₹${Number(totalSalesAgg._sum.total ?? 0).toLocaleString("en-IN")}`} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(totalOrders)} />
        <StatCard icon={Users} label="Total Customers" value={String(totalCustomers)} />
        <StatCard icon={Clock} label="Pending Orders" value={String(pendingOrders)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-beige p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-charcoal">Recent Orders</p>
            <Link href="/admin/orders" className="text-sm text-maroon">View all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between rounded-card px-2 py-2 text-sm hover:bg-beige/50"
              >
                <span className="text-charcoal">{order.orderNumber}</span>
                <span className="text-charcoal/60">₹{Number(order.total).toLocaleString("en-IN")}</span>
                <OrderStatusBadge status={order.status} />
              </Link>
            ))}
            {recentOrders.length === 0 && <p className="py-4 text-center text-sm text-charcoal/50">No orders yet.</p>}
          </div>
        </div>

        <div className="rounded-card border border-beige p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-terracotta" />
            <p className="font-medium text-charcoal">Low Stock Products</p>
          </div>
          <div className="flex flex-col gap-2">
            {lowStockVariants.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-2 py-2 text-sm">
                <span className="text-charcoal">{v.product.name} {v.size && `— ${v.size}`}</span>
                <span className="rounded-card bg-rose-light px-2 py-0.5 text-xs text-maroon-dark">{v.stockQuantity} left</span>
              </div>
            ))}
            {lowStockVariants.length === 0 && <p className="py-4 text-center text-sm text-charcoal/50">Nothing low on stock.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
