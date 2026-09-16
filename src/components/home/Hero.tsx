import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

type HeroBanner = {
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
};

// Default copy used only if the admin hasn't configured a hero banner yet
// — the homepage should never ship a broken/empty hero.
const FALLBACK: HeroBanner = {
  imageUrl: "https://picsum.photos/seed/anchal-hero-fallback/1600/800",
  title: "Everyday Fashion, Beautifully Yours",
  subtitle: "Handpicked sarees, kurtis & nightwear for the modern Indian woman.",
  ctaText: "Shop Sarees",
  ctaLink: "/sarees",
};

export function Hero({ banner }: { banner?: HeroBanner }) {
  const data = banner ?? FALLBACK;

  return (
    <section className="border-b border-beige bg-beige/30">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:px-8 md:py-16">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="mt-4 max-w-md text-base text-charcoal/70">{data.subtitle}</p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            {data.ctaText && data.ctaLink && (
              <LinkButton href={data.ctaLink}>{data.ctaText}</LinkButton>
            )}
            <LinkButton href="/kurtis" variant="secondary">
              Shop Kurtis
            </LinkButton>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card md:aspect-square">
          <Image
            src={data.imageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
