import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">Contact Us</h1>
      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm text-charcoal/70">
            Questions about an order, a product, or anything else — we usually reply within one
            business day.
          </p>
          <div className="mt-6 flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-maroon" />
              <span className="text-charcoal/80">support@anchal.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-maroon" />
              <span className="text-charcoal/80">+91 98000 00000</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-maroon" />
              <span className="text-charcoal/80">Kolkata, West Bengal, India</span>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
