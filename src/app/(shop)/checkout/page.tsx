"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { AddressForm, type AddressFormValues } from "@/components/checkout/AddressForm";
import { PincodeCheck } from "@/components/checkout/PincodeCheck";
import { CartSummary } from "@/components/cart/CartSummary";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const EMPTY_ADDRESS: AddressFormValues = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: unknown[]; subtotal: number; discount: number; shipping: number; total: number; couponCode: string | null } | null>(null);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<AddressFormValues>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((json) => json.success && setCart(json.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: address.fullName,
          customerEmail: email,
          customerPhone: address.phone,
          newAddress: {
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            saveAddress: true,
          },
          couponCode: cart?.couponCode ?? undefined,
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Couldn't place your order.");

      const { orderNumber, razorpayOrderId, amount, keyId } = json.data;

      if (paymentMethod === "COD") {
        router.push(`/checkout/success?order=${orderNumber}`);
        return;
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Anchal",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: { name: address.fullName, email, contact: address.phone },
        theme: { color: "#7A2A2E" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber, ...response }),
          });
          const verifyJson = await verifyRes.json();
          if (verifyJson.success) {
            router.push(`/checkout/success?order=${orderNumber}`);
          } else {
            setError("Payment verification failed. If money was deducted, it will be refunded within 5-7 days.");
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (!cart) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <h1 className="mb-6 font-serif text-3xl text-charcoal">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10 md:flex-row">
        <div className="flex-1">
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-lg text-charcoal">Contact</h2>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
            />
          </section>

          <section className="mb-8">
            <h2 className="mb-3 font-serif text-lg text-charcoal">Shipping Address</h2>
            <AddressForm values={address} onChange={setAddress} />
            <div className="mt-3">
              <PincodeCheck />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 font-serif text-lg text-charcoal">Payment Method</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 rounded-card border border-beige p-3 text-sm">
                <input
                  type="radio"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                />
                UPI / Card / Net Banking (Razorpay)
              </label>
              <label className="flex items-center gap-2 rounded-card border border-beige p-3 text-sm">
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                Cash on Delivery
              </label>
            </div>
          </section>

          {error && <p className="mb-4 text-sm text-terracotta">{error}</p>}
        </div>

        <div className="w-full shrink-0 rounded-card bg-beige/40 p-5 md:w-80">
          <h2 className="mb-4 font-serif text-lg text-charcoal">Order Summary</h2>
          <CartSummary subtotal={cart.subtotal} discount={cart.discount} shipping={cart.shipping} total={cart.total} />
          <Button type="submit" disabled={submitting} className="mt-5 w-full">
            {submitting ? "Placing order…" : paymentMethod === "COD" ? "Place Order" : "Pay Now"}
          </Button>
        </div>
      </form>
    </div>
  );
}
