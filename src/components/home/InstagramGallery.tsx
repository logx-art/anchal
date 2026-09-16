import Image from "next/image";
import { Instagram } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

// Dev placeholders — the real implementation would pull recent tagged
// posts via the Instagram Graph API, cached and refreshed periodically
// rather than fetched live on every homepage render.
const GALLERY_IMAGES = Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/anchal-styled-${i}/500/500`);

export function InstagramGallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Styled By You</h2>
        <LinkButton href="https://instagram.com" variant="ghost" size="sm">
          <Instagram size={16} /> @anchal.in
        </LinkButton>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 md:grid-cols-6">
        {GALLERY_IMAGES.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-card">
            <Image src={src} alt="" fill sizes="200px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
