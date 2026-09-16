import Image from "next/image";
import Link from "next/link";

type PromoBanner = {
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
};

export function PromoBanner({ banner }: { banner: PromoBanner }) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <Link
        href={banner.ctaLink ?? "/shop"}
        className="group relative block overflow-hidden rounded-card bg-beige"
      >
        <div className="relative aspect-[16/9] w-full sm:aspect-[16/7]">
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 via-transparent to-transparent" />
        </div>
        <div className="absolute inset-y-0 left-0 flex max-w-[78%] flex-col justify-center gap-1 px-4 sm:gap-2 sm:px-6 md:px-10">
          {banner.title && (
            <p className="font-serif text-xl leading-tight text-cream sm:text-2xl md:text-3xl">{banner.title}</p>
          )}
          {banner.subtitle && <p className="hidden max-w-xs text-sm text-cream/90 sm:block">{banner.subtitle}</p>}
          {banner.ctaText && (
            <span className="mt-1 inline-block w-fit rounded-card bg-cream px-3 py-1.5 text-xs font-medium text-charcoal sm:px-4 sm:py-2 sm:text-sm">
              {banner.ctaText}
            </span>
          )}
        </div>
      </Link>
    </section>
  );
}
