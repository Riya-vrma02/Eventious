"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      window.localStorage.setItem("token", res.token);
      window.localStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "vendor") {
        router.push("/vendor-onboarding");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-sm px-6 py-16">
        <h1 className="font-display text-3xl italic text-ink">Create an account</h1>
        <p className="mt-1 text-sm text-ink-soft">Join as a customer to plan events, or as a vendor to list your services.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
            <p className="mt-1 text-xs text-ink-soft/70">At least 8 characters.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft">I'm signing up as</label>
            <div className="mt-1 flex gap-2">
              {["customer", "vendor"].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`focus-ring flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                    form.role === role
                      ? "border-ink bg-ink text-paper"
                      : "border-sand-dark text-ink-soft hover:border-marigold"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rani">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-full bg-marigold py-2.5 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <a href="/login" className="text-marigold-deep underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
