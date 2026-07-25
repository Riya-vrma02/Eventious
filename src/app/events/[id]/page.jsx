"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function EventBuilderPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("activeEventId", id);
    loadEvent();
  }, [id]);

  function loadEvent() {
    api
      .get("/events")
      .then((res) => setEvent((res.events ?? []).find((e) => e.id === id) ?? null))
      .catch(() => setEvent(null));
  }

  const bookings = (event?.bookings ?? []).filter((b) => b.status !== "cancelled");
  const subtotal = bookings.reduce((sum, b) => sum + Number(b.amount), 0);
  const advance = subtotal * 0.25;

  async function removeBooking(booking) {
    setBusyId(booking.id);
    try {
      if (booking.status === "pending") {
        await api.delete(`/bookings/${booking.id}`);
      } else {
        await api.patch(`/bookings/${booking.id}/status`, { status: "cancelled" });
      }
      setEvent((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((b) => b.id !== booking.id),
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function checkout() {
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Could not load the payment gateway. Check your internet connection and try again.");
        setPaying(false);
        return;
      }

      const order = await api.post(`/events/${id}/checkout`, {});

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Gather",
        description: event.eventType,
        theme: { color: "#E8A73B" },
        handler: async (response) => {
          try {
            await api.post(`/events/${id}/checkout/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaid(true);
            loadEvent();
          } catch (err) {
            alert(`Payment succeeded but verification failed: ${err.message}`);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      alert(err.message);
      setPaying(false);
    }
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-paper">
        <Header />
        <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-ink-soft">
          Loading event, or it doesn't exist yet — create one from your dashboard.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">{event.eventType}</p>
        <h1 className="mt-2 font-display text-3xl italic text-ink">Your event</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {new Date(event.eventDate).toDateString()}
          {event.guestCount ? ` · ${event.guestCount} guests` : ""}
        </p>

        {paid && (
          <div className="mt-6 rounded-card border border-emerald/40 bg-emerald/10 p-4 text-sm text-emerald">
            Advance payment received — your vendors will be notified.
          </div>
        )}

        <div className="mt-8 space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-card border border-sand-dark bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-ink">{b.service?.title}</p>
                  <p className="text-xs text-ink-soft">
                    {b.vendor?.businessName} · {b.status}
                    {Number(b.advancePaid) > 0 && " · advance paid"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-ink">₹{Number(b.amount).toLocaleString("en-IN")}</span>
                <button
                  onClick={() => removeBooking(b)}
                  disabled={busyId === b.id}
                  className="focus-ring text-xs text-ink-soft underline hover:text-rani disabled:opacity-40"
                >
                  {busyId === b.id ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          ))}

          <Link
            href="/"
            className="focus-ring flex items-center justify-center gap-2 rounded-card border border-dashed border-sand-dark p-4 text-sm text-ink-soft hover:border-marigold"
          >
            + Add decor, venue, or more
          </Link>
        </div>

        <div className="mt-8 space-y-1 border-t border-sand-dark pt-4">
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Advance due now (25%)</span>
            <span className="font-mono">₹{advance.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between pt-2 font-display text-lg text-ink">
            <span>Total</span>
            <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          onClick={checkout}
          disabled={bookings.length === 0 || paying}
          className="focus-ring mt-6 w-full rounded-full bg-marigold py-3 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-40"
        >
          {paying ? "Opening payment…" : `Pay advance — ₹${advance.toLocaleString("en-IN")}`}
        </button>
      </div>
    </main>
  );
}