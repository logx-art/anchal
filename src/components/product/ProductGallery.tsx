"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";

type ProductImage = { url: string; altText: string | null };

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return <div className="aspect-[3/4] w-full rounded-card bg-beige" />;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      {/* Thumbnails — column on desktop, row on mobile */}
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:w-20 md:flex-col md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={img.url}
            onClick={() => setActive(i)}
            className={clsx(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-card border md:h-20 md:w-full",
              i === active ? "border-maroon" : "border-beige"
            )}
            aria-label={`Show image ${i + 1}`}
          >
            <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image — swipeable on mobile via scroll-snap, click-to-zoom on desktop */}
      <div className="order-1 md:order-2 md:flex-1">
        <div
          className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-card bg-beige"
          onClick={() => setZoomed((z) => !z)}
        >
          <Image
            src={images[active].url}
            alt={images[active].altText ?? productName}
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className={clsx("object-cover transition-transform duration-300", zoomed && "scale-150")}
          />
        </div>
        <p className="mt-2 text-center text-xs text-charcoal/50 md:hidden">Tap image to zoom</p>
      </div>
    </div>
  );
}
