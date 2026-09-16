import { Star } from "lucide-react";

type Review = { customerName: string; rating: number; comment: string };

// Placeholder testimonials for dev/design purposes — swap for real
// approved reviews (e.g. the highest-rated ones site-wide) once the
// reviews API is wired up.
const FALLBACK_REVIEWS: Review[] = [
  { customerName: "Priya S.", rating: 5, comment: "The Chanderi saree fits beautifully and the fabric feels premium. Fast delivery too." },
  { customerName: "Ananya R.", rating: 5, comment: "My go-to for everyday kurtis now. True to size and the colors are exactly as shown." },
  { customerName: "Meera K.", rating: 4, comment: "Lovely nightwear set, very soft cotton. Would love more prints in this range." },
];

export function ReviewsSection({ reviews = FALLBACK_REVIEWS }: { reviews?: Review[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <h2 className="font-serif text-2xl text-charcoal md:text-3xl">What customers are saying</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {reviews.map((review, i) => (
          <div key={i} className="rounded-card bg-beige/40 p-5">
            <div className="flex gap-0.5 text-terracotta">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            <p className="mt-3 text-sm text-charcoal/80">{review.comment}</p>
            <p className="mt-3 text-sm font-medium text-charcoal">{review.customerName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
