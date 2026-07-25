"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ eventType: "", eventDate: "", guestCount: "", budget: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/events", {
        eventType: form.eventType,
        eventDate: new Date(form.eventDate).toISOString(),
        ...(form.guestCount && { guestCount: Number(form.guestCount) }),
        ...(form.budget && { budget: Number(form.budget) }),
      });
      window.localStorage.setItem("activeEventId", res.event.id);
      router.push(`/events/${res.event.id}`);
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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">New event</p>
        <h1 className="mt-2 font-display text-3xl italic text-ink">Let's start planning</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Once this is created you can browse vendors and add them to this event.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-soft">Event type</label>
            <input
              type="text"
              required
              placeholder="e.g. Wedding, Birthday, Corporate offsite"
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft">Date</label>
            <input
              type="date"
              required
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-soft">Guest count</label>
              <input
                type="number"
                min="1"
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Budget (₹)</label>
              <input
                type="number"
                min="1"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-rani">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-full bg-marigold py-2.5 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create event"}
          </button>
        </form>
      </div>
    </main>
  );
}