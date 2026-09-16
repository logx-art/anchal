import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-beige p-4">
      <div className="flex items-center gap-2 text-charcoal/60">
        <Icon size={16} strokeWidth={1.75} />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-serif text-2xl text-charcoal">{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal/50">{hint}</p>}
    </div>
  );
}
