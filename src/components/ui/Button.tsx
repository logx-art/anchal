import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-card disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-maroon text-cream hover:bg-maroon-dark",
  secondary: "bg-transparent text-maroon border border-maroon hover:bg-maroon hover:text-cream",
  ghost: "bg-transparent text-charcoal hover:bg-beige",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      type={props.type ?? "button"}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

// Same visual treatment as Button, but renders an <a> via next/link — used
// for CTAs that navigate rather than submit/mutate (e.g. "Shop Sarees").
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
