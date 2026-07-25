"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      window.localStorage.setItem("token", res.token);
      window.localStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "admin") router.push("/admin");
      else if (res.user.role === "vendor") router.push("/vendor-dashboard");
      else router.push("/");
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
        <h1 className="font-display text-3xl italic text-ink">Log in</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
          </div>

          {error && <p className="text-sm text-rani">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-full bg-marigold py-2.5 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Don't have an account?{" "}
          <a href="/register" className="text-marigold-deep underline">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
