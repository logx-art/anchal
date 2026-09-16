"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Layers, ShoppingCart, Users, Tag, Boxes, Image as ImageIcon, Settings, LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/homepage", label: "Homepage", icon: ImageIcon },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 border-r border-beige bg-cream p-3">
      <Link href="/admin" className="mb-4 px-2 font-serif text-xl text-maroon">
        Anchal Admin
      </Link>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-2.5 rounded-card px-3 py-2 text-sm",
              active ? "bg-maroon text-cream" : "text-charcoal hover:bg-beige"
            )}
          >
            <link.icon size={17} strokeWidth={1.75} />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-auto flex items-center gap-2.5 rounded-card px-3 py-2 text-sm text-charcoal hover:bg-beige"
      >
        <LogOut size={17} />
        Logout
      </button>
    </nav>
  );
}
