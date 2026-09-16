import type { LucideIcon } from "lucide-react";
import { LinkButton } from "./Button";

// Per the frontend-design guidance: an empty screen is an invitation to
// act, not an apology. Every instance of this component pairs a plain
// statement of what's missing with one clear next step.
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Icon size={32} strokeWidth={1.5} className="text-charcoal/40" />
      <h2 className="font-serif text-xl text-charcoal">{title}</h2>
      <p className="max-w-sm text-sm text-charcoal/70">{description}</p>
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} className="mt-2">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}
