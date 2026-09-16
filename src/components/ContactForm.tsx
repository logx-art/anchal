"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-sm text-maroon">Thanks — we've received your message and will reply soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
      />
      <input
        required
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
      />
      <textarea
        required
        rows={5}
        placeholder="How can we help?"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
