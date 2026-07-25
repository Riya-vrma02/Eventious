"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res)).catch(() => setStats(null));
    api.get("/admin/vendors/pending").then((res) => setPending(res.vendors ?? [])).catch(() => {});
    api.get("/vendors?limit=100").then((res) => setActive(res.vendors ?? [])).catch(() => {});
    api.get("/admin/disputes").then((res) => setDisputes(res.disputes ?? [])).catch(() => {});
  }, []);

  async function decide(vendorId, approve) {
    try {
      await api.post(`/vendors/${vendorId}/verify`, { approve });
      setPending((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeVendor(vendorId) {
    if (!confirm("Remove this vendor from search? Their listing will be hidden but their data is kept.")) return;
    try {
      await api.patch(`/vendors/${vendorId}`, { verified: false });
      setActive((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl italic text-ink">Admin</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Total bookings</p>
            <p className="mt-1 font-display text-2xl text-ink">{stats?.totalBookings ?? "—"}</p>
          </div>
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Revenue collected</p>
            <p className="mt-1 font-display text-2xl text-ink">
              {stats ? `₹${Number(stats.revenue).toLocaleString("en-IN")}` : "—"}
            </p>
          </div>
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Active vendors</p>
            <p className="mt-1 font-display text-2xl text-ink">{stats?.activeVendors ?? "—"}</p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Vendor approval queue</h2>
          <div className="mt-3 space-y-3">
            {pending.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-card border border-sand-dark bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-sand" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink">{v.businessName}</p>
                    <p className="text-xs text-ink-soft">
                      {v.category?.name}
                      {v.city ? ` · ${v.city}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(v.id, false)}
                    className="focus-ring rounded-full border border-sand-dark px-3 py-1.5 text-xs text-ink-soft hover:border-rani"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => decide(v.id, true)}
                    className="focus-ring rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink-soft"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-ink-soft">No vendors waiting on approval.</p>}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Active vendors</h2>
          <div className="mt-3 space-y-3">
            {active.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-card border border-sand-dark bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-sand" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink">{v.businessName}</p>
                    <p className="text-xs text-ink-soft">
                      {v.category?.name}
                      {v.city ? ` · ${v.city}` : ""} · ★ {v.ratingAvg?.toFixed?.(1) ?? "New"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeVendor(v.id)}
                  className="focus-ring rounded-full border border-sand-dark px-3 py-1.5 text-xs text-ink-soft hover:border-rani"
                >
                  Remove
                </button>
              </div>
            ))}
            {active.length === 0 && <p className="text-sm text-ink-soft">No active vendors yet.</p>}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Open disputes</h2>
          <div className="mt-3 space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-card border border-rani/40 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{d.reason}</p>
                  <p className="text-xs text-ink-soft">
                    Raised by {d.raisedBy?.name} · Booking {d.bookingId.slice(0, 8)}
                  </p>
                </div>
                <span className="rounded-full bg-rani/10 px-3 py-1 text-xs text-rani">Open</span>
              </div>
            ))}
            {disputes.length === 0 && <p className="text-sm text-ink-soft">No open disputes.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}