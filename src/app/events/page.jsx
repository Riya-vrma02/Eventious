"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl italic text-ink">Your events</h1>
          <Link
            href="/events/new"
            className="focus-ring rounded-full bg-marigold px-4 py-2 text-sm font-medium text-ink hover:bg-marigold-deep"
          >
            + New event
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {loading && <p className="text-sm text-ink-soft">Loading…</p>}

          {!loading && events.length === 0 && (
            <div className="rounded-card border border-dashed border-sand-dark p-10 text-center">
              <p className="font-display text-xl italic text-ink">No events yet</p>
              <p className="mt-2 text-sm text-ink-soft">
                Start one to begin adding vendors — caterers, photographers, decorators and more.
              </p>
            </div>
          )}

          {events.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              onClick={() => window.localStorage.setItem("activeEventId", e.id)}
              className="focus-ring block rounded-card border border-sand-dark bg-white p-4 hover:border-marigold"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg text-ink">{e.eventType}</p>
                  <p className="text-xs text-ink-soft">
                    {new Date(e.eventDate).toDateString()}
                    {e.guestCount ? ` · ${e.guestCount} guests` : ""} · {e.bookings?.length ?? 0} vendor
                    {e.bookings?.length === 1 ? "" : "s"} added
                  </p>
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs text-ink-soft">{e.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
