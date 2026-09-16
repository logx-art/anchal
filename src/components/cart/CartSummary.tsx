export function CartSummary({
  subtotal,
  discount,
  shipping,
  total,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}) {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <dl className="flex flex-col gap-2 text-sm">
      <Row label="Subtotal" value={inr(subtotal)} />
      {discount > 0 && <Row label="Discount" value={`-${inr(discount)}`} accent />}
      <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
      <div className="my-1 border-t border-beige" />
      <div className="flex items-center justify-between text-base font-medium text-charcoal">
        <dt>Total</dt>
        <dd>{inr(total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-charcoal/70">
      <dt>{label}</dt>
      <dd className={accent ? "text-maroon" : undefined}>{value}</dd>
    </div>
  );
}
