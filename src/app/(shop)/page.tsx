import { getActiveCategories, getHeroBanners, getPromoBanners } from "@/lib/data/categories";
import { getFeaturedProducts, getNewArrivals, getSaleProducts } from "@/lib/data/products";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { PromoBanner } from "@/components/home/PromoBanner";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export default async function HomePage() {
  const [categories, heroBanners, promoBanners, featured, newArrivals, sale] = await Promise.all([
    getActiveCategories(),
    getHeroBanners(),
    getPromoBanners(),
    getFeaturedProducts(),
    getNewArrivals(),
    getSaleProducts(),
  ]);

  const hero = heroBanners[0];

  return (
    <>
      <Hero banner={hero} />

      <CategoryCards categories={categories} />

      <FeaturedTabs
        tabs={[
          { key: "trending", label: "Trending", products: featured, viewAllHref: "/shop?sort=popular" },
          { key: "new", label: "New Arrivals", products: newArrivals, viewAllHref: "/new-arrivals" },
          { key: "sale", label: "Sale", products: sale, viewAllHref: "/sale" },
        ]}
      />

      {promoBanners[0] && <PromoBanner banner={promoBanners[0]} />}

      <WhyShopWithUs />

      <ReviewsSection />

      <InstagramGallery />

      <section className="mx-auto max-w-7xl px-4 py-16 text-center md:px-8">
        <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Join the Anchal circle</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/70">
          Be first to know about new collections and seasonal offers.
        </p>
        <NewsletterForm className="mx-auto mt-5 max-w-sm justify-center" />
      </section>
    </>
  );
}
