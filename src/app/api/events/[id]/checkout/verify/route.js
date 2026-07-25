import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// POST /api/events/:id/checkout/verify — called from the browser after
// Razorpay's checkout popup succeeds. Verifies the signature ourselves
// instead of trusting the client, then marks each booking's payment as paid.
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = schema.parse(await request.json());

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { bookings: true },
  });
  if (!event || event.customerId !== auth.userId) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const bookings = event.bookings.filter((b) => b.status !== "cancelled");

  for (const booking of bookings) {
    const advance = Number(booking.amount) * 0.25;
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { amount: advance, status: "paid", transactionId: razorpay_payment_id },
      create: { bookingId: booking.id, amount: advance, status: "paid", transactionId: razorpay_payment_id },
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { advancePaid: advance } });
  }

  return Response.json({ verified: true, bookingsPaid: bookings.length });
}