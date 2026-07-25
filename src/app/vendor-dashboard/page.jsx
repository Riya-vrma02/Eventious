"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function VendorDashboardPage() {
  const [vendorId, setVendorId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);

  const [newService, setNewService] = useState({ title: "", price: "", priceType: "fixed", description: "", imageUrl: "" });
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const cached = window.localStorage.getItem("vendorProfileId");
    if (cached) {
      setVendorId(cached);
      loadDashboard(cached);
      return;
    }

    api
      .get("/vendors/me")
      .then((res) => {
        if (!res.vendor) return;
        window.localStorage.setItem("vendorProfileId", res.vendor.id);
        setVendorId(res.vendor.id);
        setServices(res.vendor.services ?? []);
        setCategoryId(res.vendor.categoryId ?? null);
        api.get(`/vendors/${res.vendor.id}/bookings`).then((r) => setBookings(r.bookings ?? [])).catch(() => {});
      })
      .catch(() => {});
  }, []);

  function loadDashboard(id) {
    api.get(`/vendors/${id}/bookings`).then((res) => setBookings(res.bookings ?? [])).catch(() => {});
    api.get(`/vendors/${id}`).then((res) => {
      setServices(res.vendor?.services ?? []);
      setCategoryId(res.vendor?.categoryId ?? null);
    }).catch(() => {});
  }

  async function respond(bookingId, status) {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    } catch (err) {
      alert(err.message);
    }
  }

  async function addService(e) {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      const res = await api.post(`/vendors/${vendorId}/services`, {
        ...newService,
        price: Number(newService.price),
        categoryId,
      });
      setServices((prev) => [...prev, res.service]);
      setNewService({ title: "", price: "", priceType: "fixed", description: "", imageUrl: "" });
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function removeService(serviceId) {
    if (!confirm("Remove this package? This can't be undone.")) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      alert(err.message);
    }
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const earnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl italic text-ink">Vendor dashboard</h1>

        {!vendorId && (
          <p className="mt-4 text-sm text-ink-soft">
            No vendor profile found for this account. If you registered as a customer, log in with a
            vendor account instead — or create one from the sign-up page.
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Completed earnings</p>
            <p className="mt-1 font-display text-2xl text-ink">₹{earnings.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Pending requests</p>
            <p className="mt-1 font-display text-2xl text-ink">{pending.length}</p>
          </div>
          <div className="rounded-card border border-sand-dark bg-white p-4">
            <p className="text-xs text-ink-soft">Total bookings</p>
            <p className="mt-1 font-display text-2xl text-ink">{bookings.length}</p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Booking requests</h2>
          <div className="mt-3 space-y-3">
            {pending.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-card border border-sand-dark bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{b.service?.title}</p>
                  <p className="text-xs text-ink-soft">
                    {new Date(b.event?.eventDate).toDateString()} · {b.event?.eventType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(b.id, "declined")}
                    className="focus-ring rounded-full border border-sand-dark px-3 py-1.5 text-xs text-ink-soft hover:border-rani"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respond(b.id, "confirmed")}
                    className="focus-ring rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink-soft"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-ink-soft">No pending requests right now.</p>}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Your packages</h2>

          <div className="mt-3 space-y-3">
            {services.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-card border border-sand-dark bg-white">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt="" className="h-24 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{s.title}</p>
                    <span className="font-mono text-sm text-ink">
                      ₹{Number(s.price).toLocaleString("en-IN")}
                      {s.priceType === "per_guest" && " / guest"}
                      {s.priceType === "per_hour" && " / hour"}
                    </span>
                  </div>
                  {s.description && <p className="mt-1 text-xs text-ink-soft">{s.description}</p>}
                  <button
                    onClick={() => removeService(s.id)}
                    className="focus-ring mt-2 text-xs text-ink-soft underline hover:text-rani"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && <p className="text-sm text-ink-soft">No packages yet — add your first one below.</p>}
          </div>

          <form onSubmit={addService} className="mt-6 space-y-3 rounded-card border border-dashed border-sand-dark p-4">
            <p className="text-xs font-medium text-ink-soft">Add a new package</p>

            <input
              type="text"
              required
              placeholder="Package title, e.g. Silver photography package"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              className="focus-ring w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                required
                min="1"
                placeholder="Price (₹)"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="focus-ring w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
              <select
                value={newService.priceType}
                onChange={(e) => setNewService({ ...newService, priceType: e.target.value })}
                className="focus-ring w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              >
                <option value="fixed">Fixed</option>
                <option value="per_guest">Per guest</option>
                <option value="per_hour">Per hour</option>
              </select>
            </div>

            <textarea
              placeholder="Description (optional)"
              rows={2}
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="focus-ring w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />

            <input
              type="url"
              placeholder="Photo URL (optional) — https://..."
              value={newService.imageUrl}
              onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
              className="focus-ring w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
            />

            {addError && <p className="text-sm text-rani">{addError}</p>}

            <button
              type="submit"
              disabled={adding || !vendorId}
              className="focus-ring rounded-full bg-marigold px-4 py-2 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add package"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}