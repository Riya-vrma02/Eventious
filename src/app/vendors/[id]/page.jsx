"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function VendorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    api.get(`/vendors/${id}`).then((res) => setVendor(res.vendor)).catch(() => setVendor(null));
    api.get(`/vendors/${id}/reviews`).then((res) => setReviews(res.reviews ?? [])).catch(() => {});
  }, [id]);

  async function startConversation() {
    setMessaging(true);
    try {
      const res = await api.post("/conversations", { vendorId: id });
      router.push(`/messages/${res.conversation.id}`);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setMessaging(false);
    }
  }

  async function addToEvent(serviceId) {
    const eventId = window.localStorage.getItem("activeEventId");
    if (!eventId) {
      setStatus("Start an event first, then come back to add this service.");
      return;
    }
    try {
      await api.post(`/events/${eventId}/bookings`, { serviceId });
      setStatus("Added to your event.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  if (!vendor) {
    return (
      <main className="min-h-screen bg-paper">
        <Header />
        <p className="mx-auto max-w-4xl px-6 py-16 text-sm text-ink-soft">Loading vendor…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-56 w-full overflow-hidden rounded-card bg-sand">
          {vendor.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.photoUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="mt-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl italic text-ink">{vendor.businessName}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {vendor.category?.name}
              {vendor.city ? ` · ${vendor.city}` : ""} · <span className="text-emerald">★ {vendor.ratingAvg?.toFixed?.(1) ?? "New"}</span>{" "}
              ({reviews.length} review{reviews.length === 1 ? "" : "s"})
            </p>
          </div>
          <button
            onClick={startConversation}
            disabled={messaging}
            className="focus-ring rounded-full border border-sand-dark px-4 py-2 text-sm text-ink hover:border-marigold disabled:opacity-50"
          >
            {messaging ? "Opening…" : "Message"}
          </button>
        </div>

        {vendor.description && <p className="mt-4 max-w-2xl text-ink-soft">{vendor.description}</p>}

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Packages</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(vendor.services ?? []).map((service) => (
              <div key={service.id} className="overflow-hidden rounded-card border border-sand-dark bg-white">
                {service.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={service.imageUrl} alt="" className="h-32 w-full object-cover" />
                )}
                <div className="p-4">
                <p className="font-display text-lg text-ink">{service.title}</p>
                {service.description && <p className="mt-1 text-sm text-ink-soft">{service.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-sm text-ink">
                    ₹{Number(service.price).toLocaleString("en-IN")}
                    {service.priceType === "per_guest" && " / guest"}
                    {service.priceType === "per_hour" && " / hour"}
                  </span>
                  <button
                    onClick={() => addToEvent(service.id)}
                    className="focus-ring rounded-full bg-ink px-4 py-1.5 text-xs text-paper hover:bg-ink-soft"
                  >
                    Add to event
                  </button>
                </div>
                </div>
              </div>
            ))}
            {(vendor.services ?? []).length === 0 && (
              <p className="text-sm text-ink-soft">No packages listed yet.</p>
            )}
          </div>
          {status && <p className="mt-3 text-sm text-emerald">{status}</p>}
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Availability</h2>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {(vendor.availability ?? []).slice(0, 14).map((a) => (
              <div
                key={a.id}
                className={`h-8 rounded ${a.isBlocked ? "bg-rani/70" : "bg-emerald/70"}`}
                title={new Date(a.date).toDateString()}
              />
            ))}
            {(vendor.availability ?? []).length === 0 && (
              <p className="col-span-7 text-sm text-ink-soft">No availability set yet — assume open.</p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Reviews</h2>
          <div className="mt-3 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-card border border-sand-dark bg-white p-4">
                <p className="text-sm font-medium text-ink">
                  {r.user?.name} · <span className="text-emerald">★ {r.rating}</span>
                </p>
                {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-ink-soft">No reviews yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}