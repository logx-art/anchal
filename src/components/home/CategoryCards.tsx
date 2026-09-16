import Image from "next/image";
import Link from "next/link";

type Category = { name: string; slug: string; image: string | null };

export function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-card bg-beige"
          >
            {category.image && (
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-serif text-xl text-cream">{category.name}</p>
              <span className="mt-1 inline-block text-sm text-cream/90 underline underline-offset-2">
                Explore Collection
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
