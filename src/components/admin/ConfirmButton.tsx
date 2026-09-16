"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { clsx } from "clsx";

// A compact icon+text destructive action that always confirms first, per
// the admin UX principles (§46: "provide confirmation before destructive
// actions"). Uses the browser's native confirm() — simple and accessible
// by default; swap for a styled Modal component if richer confirmation
// copy (e.g. showing what will be deleted) is needed later.
export function ConfirmButton({
  action,
  confirmMessage,
  label = "Delete",
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={clsx("flex items-center gap-1.5 text-sm text-terracotta hover:text-maroon disabled:opacity-50", className)}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(action);
        }
      }}
    >
      <Trash2 size={14} />
      {pending ? "Removing…" : label}
    </button>
  );
}
