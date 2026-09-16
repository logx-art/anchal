import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      orders: { where: { paymentStatus: "PAID" }, select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Customers</h1>

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or phone…"
          className="w-full max-w-sm rounded-card border border-beige bg-cream px-3 py-2 text-sm"
        />
      </form>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Registered customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-beige">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/40 text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
                return (
                  <tr key={c.id} className="border-t border-beige">
                    <td className="px-4 py-3 text-charcoal">{c.name}</td>
                    <td className="px-4 py-3 text-charcoal/70">{c.email}</td>
                    <td className="px-4 py-3 text-charcoal/70">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-charcoal/70">{c.orders.length}</td>
                    <td className="px-4 py-3 text-charcoal/70">₹{totalSpent.toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
