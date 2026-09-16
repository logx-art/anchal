"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartItemRow, type CartLine } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponField } from "@/components/cart/CouponField";

type CartResponse = {
  items: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const json = await res.json();
    if (json.success) setCart(json.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    loadCart();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    loadCart();
  }

  async function applyCoupon(code: string) {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cartTotal: cart?.subtotal }),
    });
    const json = await res.json();
    if (!json.success) return json.error?.message ?? "Invalid coupon.";
    await loadCart();
    return null;
  }

  async function removeCoupon() {
    await fetch("/api/coupons/validate", { method: "DELETE" });
    loadCart();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <Skeleton className="mb-6 h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Start exploring our collection."
        actionLabel="Continue Shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="mb-6 font-serif text-3xl text-charcoal">Shopping Cart</h1>

      <div className="flex flex-col gap-10 md:flex-row">
        <div className="flex-1">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} onQuantityChange={updateQuantity} onRemove={removeItem} />
          ))}
          <LinkButton href="/shop" variant="ghost" className="mt-4">
            Continue Shopping
          </LinkButton>
        </div>

        <div className="w-full shrink-0 rounded-card bg-beige/40 p-5 md:w-80">
          <h2 className="mb-4 font-serif text-lg text-charcoal">Order Summary</h2>
          <div className="mb-4">
            <CouponField appliedCode={cart.couponCode} onApply={applyCoupon} onRemove={removeCoupon} />
          </div>
          <CartSummary subtotal={cart.subtotal} discount={cart.discount} shipping={cart.shipping} total={cart.total} />
          <LinkButton href="/checkout" className="mt-5 w-full">
            Proceed to Checkout
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
