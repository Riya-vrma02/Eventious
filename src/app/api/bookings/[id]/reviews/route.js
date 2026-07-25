import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// POST /api/bookings/:id/reviews — only allowed once a booking is completed
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { event: true } });
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
  if (booking.event.customerId !== auth.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (booking.status !== "completed") {
    return Response.json({ error: "Booking is not completed yet" }, { status: 400 });
  }

  const body = schema.parse(await request.json());

  const review = await prisma.review.create({
    data: { bookingId: params.id, userId: auth.userId, ...body },
  });

  // Recompute the vendor's average rating.
  const agg = await prisma.review.aggregate({
    where: { booking: { vendorId: booking.vendorId } },
    _avg: { rating: true },
  });
  await prisma.vendorProfile.update({
    where: { id: booking.vendorId },
    data: { ratingAvg: agg._avg.rating ?? 0 },
  });

  return Response.json({ review }, { status: 201 });
}
