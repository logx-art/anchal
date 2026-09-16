import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user!.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Saved Addresses</h1>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Addresses you use at checkout will be saved here for faster ordering next time."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-card border border-beige p-4 text-sm">
              <p className="font-medium text-charcoal">
                {address.fullName} {address.isDefault && <span className="ml-2 text-xs text-maroon">Default</span>}
              </p>
              <p className="mt-1 text-charcoal/70">{address.phone}</p>
              <p className="mt-1 text-charcoal/70">
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
