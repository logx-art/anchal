import Link from "next/link";

// A deliberately quieter layout than the storefront's — no full nav, no
// footer — so sign-in/registration stays focused with one way back home.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-beige/30 px-4 py-12">
      <Link href="/" className="mb-8 font-serif text-2xl text-maroon">
        Anchal
      </Link>
      <div className="w-full max-w-sm rounded-card bg-cream p-6 shadow-sm">{children}</div>
    </div>
  );
}
