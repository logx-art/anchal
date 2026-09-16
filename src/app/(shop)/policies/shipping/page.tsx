import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">Shipping Policy</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-charcoal/80">
        <p>Orders are processed and dispatched within 24–48 hours of confirmation, excluding Sundays and public holidays.</p>
        <p>Standard delivery takes 4–7 business days depending on your location. Metro cities typically see delivery in 3–5 days; remote areas may take up to 9 days.</p>
        <p>Shipping is free on orders above ₹999. A flat rate of ₹79 applies below that threshold.</p>
        <p>You'll receive a tracking link by email and SMS once your order is dispatched. You can also track any order from your Anchal account under My Orders.</p>
        <p>We currently ship across India. International shipping isn't available yet.</p>
      </div>
    </div>
  );
}
