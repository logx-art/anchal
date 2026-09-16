import { clsx } from "clsx";

type BadgeTone = "new" | "sale" | "lowStock" | "outOfStock";

const tones: Record<BadgeTone, string> = {
  new: "bg-charcoal text-cream",
  sale: "bg-terracotta text-cream",
  lowStock: "bg-rose-light text-maroon-dark",
  outOfStock: "bg-beige text-charcoal/60",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-card px-2 py-0.5 text-xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
