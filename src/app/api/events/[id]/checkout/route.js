import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// POST /api/events/:id/checkout — creates one Razorpay order covering the
// 25% advance across every non-cancelled booking on this event, so the
// customer pays once instead of once per vendor.
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { bookings: true },
  });
  if (!event || event.customerId !== auth.userId) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const bookings = event.bookings.filter((b) => b.status !== "cancelled");
  if (bookings.length === 0) {
    return Response.json({ error: "No bookings to pay for" }, { status: 400 });
  }

  const advanceTotal = bookings.reduce((sum, b) => sum + Number(b.amount) * 0.25, 0);
  const amountInPaise = Math.round(advanceTotal * 100);

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
  }

  const auth64 = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth64}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt: event.id,
      notes: { eventId: event.id },
    }),
  });

  if (!razorpayRes.ok) {
    const errBody = await razorpayRes.json().catch(() => ({}));
    return Response.json({ error: errBody.error?.description || "Could not create payment order" }, { status: 502 });
  }

  const order = await razorpayRes.json();

  return Response.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}