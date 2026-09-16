"use client";

import { useState } from "react";
import { clsx } from "clsx";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Something went wrong.");
      setStatus("success");
      setMessage("You're subscribed. Watch your inbox for new arrivals.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't subscribe. Please try again.");
    }
  }

  if (status === "success") {
    return <p className={clsx("text-sm text-maroon", className)}>{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={clsx("flex flex-col gap-2 sm:flex-row", className)}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-maroon"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-card bg-maroon px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-maroon-dark disabled:opacity-50"
      >
        {status === "loading" ? "Joining…" : "Subscribe"}
      </button>
      {status === "error" && <p className="text-xs text-terracotta sm:basis-full">{message}</p>}
    </form>
  );
}
