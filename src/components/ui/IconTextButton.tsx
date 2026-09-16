import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  // When true, the label is visually hidden but still read by screen
  // readers — for the compact, icon-only actions the spec calls for
  // (wishlist heart on a product card, remove-item trash in the cart row).
  iconOnly?: boolean;
  active?: boolean;
}

export function IconTextButton({
  icon: Icon,
  label,
  iconOnly = false,
  active = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 text-sm text-charcoal transition-colors hover:text-maroon",
        iconOnly && "p-1.5",
        active && "text-maroon",
        className
      )}
      aria-label={label}
      {...props}
    >
      <Icon size={18} strokeWidth={1.75} className={clsx(active && "fill-rose text-rose")} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
