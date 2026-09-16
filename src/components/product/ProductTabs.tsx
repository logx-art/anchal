"use client";

import { useState } from "react";
import { clsx } from "clsx";

type Tab = { key: string; label: string; content: React.ReactNode };

export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className="mt-10">
      <div className="flex gap-6 border-b border-beige">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={clsx(
              "border-b-2 pb-3 text-sm transition-colors",
              active === tab.key
                ? "border-maroon text-charcoal"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-5 text-sm leading-relaxed text-charcoal/80">
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}
