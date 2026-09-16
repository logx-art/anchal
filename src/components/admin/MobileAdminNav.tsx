"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

// Responsive drawer for the admin nav on small screens, per §22.
export function MobileAdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-beige bg-cream p-3 md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="p-1">
        <Menu size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-cream">
            <div className="flex justify-end p-2">
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <AdminSidebar />
          </div>
          <div className="flex-1 bg-charcoal/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
