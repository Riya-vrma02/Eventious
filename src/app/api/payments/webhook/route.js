import { prisma } from "@/lib/prisma";

// POST /api/payments/webhook — gateway callback (Razorpay/Stripe).
// No JWT here: verify the gateway's own signature header instead before
// trusting the payload. This route stays unauthenticated by design.
export async function POST(request) {
  const body = await request.json();

  // TODO: verify signature using the gateway SDK, e.g.:
  // const isValid = verifyRazorpaySignature(request.headers, rawBody);
  // if (!isValid) return Response.json({ error: "Invalid signature" }, { status: 400 });

  const { transactionId, bookingId, status } = body;

  await prisma.payment.update({
    where: { bookingId },
    data: { status, transactionId },
  });

  if (status === "paid") {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "confirmed" } });
  }

  return Response.json({ received: true });
}
