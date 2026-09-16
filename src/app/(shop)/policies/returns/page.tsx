import type { Metadata } from "next";

export const metadata: Metadata = { title: "Return & Refund Policy" };

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">Return & Refund Policy</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-charcoal/80">
        <p>We accept returns within 7 days of delivery, provided the item is unused, unwashed, and has its original tags attached.</p>
        <p>To start a return, go to My Orders, select the order, and choose Request Return. We'll arrange a pickup where available.</p>
        <p>Refunds are processed to your original payment method within 5–7 business days of us receiving the returned item. Cash on Delivery orders are refunded via bank transfer.</p>
        <p>Sale items marked "Final Sale" and made-to-order pieces are not eligible for return unless defective.</p>
        <p>If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos, and we'll arrange a replacement or full refund at no extra cost.</p>
      </div>
    </div>
  );
}
