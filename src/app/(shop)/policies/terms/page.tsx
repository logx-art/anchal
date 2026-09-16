import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">Terms & Conditions</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-charcoal/80">
        <p>By using the Anchal website, you agree to these terms. Please read them carefully.</p>
        <p>Product images are for illustration; actual colors may vary slightly due to photography and screen settings. Handloom and handblock-printed items may show natural variation between pieces — this is a feature of the craft, not a defect.</p>
        <p>Prices are listed in Indian Rupees (INR) and are subject to change without notice. The price at the time of order confirmation is the price you pay.</p>
        <p>We reserve the right to cancel any order in cases of pricing errors, stock unavailability, or suspected fraudulent activity, with a full refund issued for any payment already made.</p>
        <p>All content on this website — text, images, and design — is the property of Anchal and may not be reproduced without permission.</p>
      </div>
    </div>
  );
}
