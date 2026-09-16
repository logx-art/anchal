"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="rounded-card p-2 text-charcoal disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, i) => (
        <span key={page} className="flex items-center">
          {i > 0 && pages[i - 1] !== page - 1 && <span className="px-1 text-charcoal/40">…</span>}
          <button
            onClick={() => goTo(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={clsx(
              "h-8 w-8 rounded-card text-sm",
              page === currentPage ? "bg-maroon text-cream" : "text-charcoal hover:bg-beige"
            )}
          >
            {page}
          </button>
        </span>
      ))}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="rounded-card p-2 text-charcoal disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
