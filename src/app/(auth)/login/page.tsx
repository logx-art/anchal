"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("That email and password don't match. Please try again.");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/account");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-serif text-2xl text-charcoal">Welcome back</h1>
      <p className="mt-1 text-sm text-charcoal/60">Sign in to your Anchal account.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-charcoal">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-charcoal">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
          />
        </div>

        {error && <p className="text-sm text-terracotta">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-charcoal/70">
        New to Anchal?{" "}
        <Link href="/register" className="text-maroon underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
