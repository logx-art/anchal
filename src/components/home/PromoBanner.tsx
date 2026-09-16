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
        <div className="relative aspect-[16/7] w-full">
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 via-transparent to-transparent" />
        </div>
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center gap-2 px-6 md:px-10">
          {banner.title && (
            <p className="font-serif text-2xl text-cream md:text-3xl">{banner.title}</p>
          )}
          {banner.subtitle && <p className="max-w-xs text-sm text-cream/90">{banner.subtitle}</p>}
          {banner.ctaText && (
            <span className="mt-1 inline-block w-fit rounded-card bg-cream px-4 py-2 text-sm font-medium text-charcoal">
              {banner.ctaText}
            </span>
          )}
        </div>
      </Link>
    </section>
  );
}
