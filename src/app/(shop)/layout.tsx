import { auth } from "@/lib/auth";
import { getCartItemCount } from "@/lib/cart";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cartCount = await getCartItemCount(session?.user?.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
