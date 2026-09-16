"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (!json.success) {
      setErrors(json.error?.fieldErrors ?? { _root: json.error?.message ?? "Something went wrong." });
      setLoading(false);
      return;
    }

    // Registration succeeded — sign the person in immediately rather than
    // sending them back to the login form to re-type their password.
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/account");
    router.refresh();
  }

  function field(key: keyof typeof form, label: string, type = "text") {
    return (
      <div>
        <label htmlFor={key} className="mb-1 block text-sm text-charcoal">{label}</label>
        <input
          id={key}
          type={type}
          required
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full rounded-card border border-beige bg-cream px-3 py-2 text-sm focus:border-maroon"
        />
        {errors[key] && <p className="mt-1 text-xs text-terracotta">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl text-charcoal">Create your account</h1>
      <p className="mt-1 text-sm text-charcoal/60">Join Anchal for faster checkout and order tracking.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {field("name", "Full Name")}
        {field("email", "Email", "email")}
        {field("phone", "Phone Number", "tel")}
        {field("password", "Password", "password")}

        {errors._root && <p className="text-sm text-terracotta">{errors._root}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-charcoal/70">
        Already have an account?{" "}
        <Link href="/login" className="text-maroon underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
