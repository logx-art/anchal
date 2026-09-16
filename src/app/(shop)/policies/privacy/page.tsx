import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">Privacy Policy</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-charcoal/80">
        <p>We collect the information you provide when creating an account, placing an order, or contacting us: your name, email, phone number, and shipping address.</p>
        <p>Payment details are handled entirely by Razorpay, our payment processor. Anchal never stores your card, UPI, or net banking credentials.</p>
        <p>We use your information to process orders, provide customer support, and — only if you've subscribed — send occasional updates about new arrivals and offers. You can unsubscribe at any time.</p>
        <p>We don't sell your personal information to third parties. We share order details only with logistics partners as needed to deliver your order.</p>
        <p>You can request a copy of your data or ask us to delete your account at any time by contacting support@anchal.in.</p>
      </div>
    </div>
  );
}
