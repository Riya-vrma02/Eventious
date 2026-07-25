import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ amount: z.number().positive() });

// POST /api/bookings/:id/payments — initiate advance or balance payment.
// Replace the body with a real gateway order-creation call (Razorpay/Stripe)
// and return the client-side order/session id instead of a bare record.
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });

  const { amount } = schema.parse(await request.json());

  const payment = await prisma.payment.upsert({
    where: { bookingId: params.id },
    update: { amount, status: "pending" },
    create: { bookingId: params.id, amount, status: "pending" },
  });

  // TODO: call payment gateway here, return payment.id + gateway order id
  return Response.json({ payment }, { status: 201 });
}
