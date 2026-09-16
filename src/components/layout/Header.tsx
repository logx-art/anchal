"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Heart, User, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Sarees", href: "/sarees" },
  { label: "Kurtis", href: "/kurtis" },
  { label: "Nightwear", href: "/nightwear" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Sale", href: "/sale" },
];

// cartCount/wishlistCount are passed in from a server-component parent that
// reads the cart cookie/session — kept as props so this component stays a
// simple, testable client component rather than fetching itself.
export function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Mobile: hamburger */}
        <button
          className="p-1 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-serif text-2xl tracking-tight text-maroon">
          Anchal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-charcoal transition-colors hover:text-maroon"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: search, wishlist, account, cart */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden p-2 text-charcoal transition-colors hover:text-maroon md:inline-flex"
          >
            <Search size={20} strokeWidth={1.75} />
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="hidden p-2 text-charcoal transition-colors hover:text-maroon md:inline-flex"
          >
            <Heart size={20} strokeWidth={1.75} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden p-2 text-charcoal transition-colors hover:text-maroon md:inline-flex"
          >
            <User size={20} strokeWidth={1.75} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative p-2 text-charcoal transition-colors hover:text-maroon">
            <ShoppingBag size={20} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-maroon text-[10px] font-medium text-cream">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={clsx(
          "overflow-hidden border-t border-beige bg-cream transition-[max-height] duration-200 ease-out md:hidden",
          menuOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm text-charcoal"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-4 border-t border-beige pt-3">
            <Link href="/search" className="flex items-center gap-1.5 text-sm">
              <Search size={16} /> Search
            </Link>
            <Link href="/account/wishlist" className="flex items-center gap-1.5 text-sm">
              <Heart size={16} /> Wishlist
            </Link>
            <Link href="/account" className="flex items-center gap-1.5 text-sm">
              <User size={16} /> Account
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
