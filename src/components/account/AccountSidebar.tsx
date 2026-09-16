"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, Heart, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto md:w-48 md:flex-col md:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex shrink-0 items-center gap-2 rounded-card px-3 py-2 text-sm",
              active ? "bg-maroon text-cream" : "text-charcoal hover:bg-beige"
            )}
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex shrink-0 items-center gap-2 rounded-card px-3 py-2 text-sm text-charcoal hover:bg-beige"
      >
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  );
}
