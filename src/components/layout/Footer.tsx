import Link from "next/link";
import { NewsletterForm } from "@/components/home/NewsletterForm";

const FOOTER_LINKS = {
  Shop: [
    { label: "Sarees", href: "/sarees" },
    { label: "Kurtis", href: "/kurtis" },
    { label: "Nightwear", href: "/nightwear" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Sale", href: "/sale" },
  ],
  Help: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/policies/shipping" },
    { label: "Return & Refund Policy", href: "/policies/returns" },
    { label: "Track My Order", href: "/account/orders" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms & Conditions", href: "/policies/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-beige bg-beige/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <p className="font-serif text-2xl text-maroon">Anchal</p>
            <p className="mt-3 max-w-xs text-sm text-charcoal/70">
              Everyday fashion, beautifully yours — sarees, kurtis, and nightwear made for the
              modern Indian woman.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="font-medium text-charcoal">{heading}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-charcoal/70 hover:text-maroon">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-beige pt-8">
          <p className="font-medium text-charcoal">Stay in the loop</p>
          <p className="mt-1 text-sm text-charcoal/70">
            New arrivals and seasonal offers, once or twice a month.
          </p>
          <NewsletterForm className="mt-3 max-w-sm" />
        </div>

        <p className="mt-10 text-xs text-charcoal/50">
          © {new Date().getFullYear()} Anchal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
