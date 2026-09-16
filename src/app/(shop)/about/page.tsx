import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12 md:px-8">
      <h1 className="font-serif text-3xl text-charcoal">About Anchal</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-charcoal/80">
        <p>
          Anchal began with a simple idea: everyday fashion shouldn't mean choosing between
          quality and affordability. We work directly with weavers and small manufacturing
          units across India to bring you sarees, kurtis, and nightwear that feel as good as
          they look — without the boutique markup.
        </p>
        <p>
          Every piece in our collection is chosen for how it wears in real life: fabric that
          breathes, colors that don't fade after the third wash, and fits that work for actual
          Indian body shapes, not just the sample size.
        </p>
        <p>
          We're a small team, and we read every message that comes through our contact page.
          If something about your order isn't right, tell us — we'll make it right.
        </p>
      </div>
    </div>
  );
}
