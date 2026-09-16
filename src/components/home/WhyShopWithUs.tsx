import { RotateCcw, ShieldCheck, BadgeCheck, Truck } from "lucide-react";

const TRUST_SIGNALS = [
  { icon: RotateCcw, label: "Easy Returns", description: "7-day return window on all orders" },
  { icon: ShieldCheck, label: "Secure Payments", description: "UPI, cards & net banking via Razorpay" },
  { icon: BadgeCheck, label: "Quality Checked", description: "Every piece inspected before dispatch" },
  { icon: Truck, label: "Fast Delivery", description: "Dispatched within 24–48 hours" },
];

export function WhyShopWithUs() {
  return (
    <section className="border-y border-beige bg-beige/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
        {TRUST_SIGNALS.map(({ icon: Icon, label, description }) => (
          <div key={label} className="flex flex-col items-start gap-2">
            <Icon size={22} strokeWidth={1.5} className="text-maroon" />
            <p className="text-sm font-medium text-charcoal">{label}</p>
            <p className="text-xs text-charcoal/60">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
