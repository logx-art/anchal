"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { clsx } from "clsx";

// Lightweight debounced autocomplete: as the person types, we fetch a
// short list of matching product names from /api/search and show them as
// a dropdown, without navigating until they submit or pick a suggestion.
export function SearchBar({ initialQuery = "", className }: { initialQuery?: string; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const json = await res.json();
      if (json.success) setSuggestions(json.data.map((p: { name: string; slug: string }) => p));
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className={clsx("relative", className)}>
      <div className="flex items-center gap-2 rounded-card border border-beige bg-cream px-3 py-2">
        <Search size={16} className="text-charcoal/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search sarees, kurtis, nightwear…"
          className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-card border border-beige bg-cream shadow-sm">
          {suggestions.map((s) => (
            <li key={s.slug}>
              <a href={`/product/${s.slug}`} className="block px-3 py-2 text-sm text-charcoal hover:bg-beige">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
