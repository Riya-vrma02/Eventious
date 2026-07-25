import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["confirmed", "declined", "cancelled", "in_progress", "completed"]),
});

// PATCH /api/bookings/:id/status
// Vendors accept/decline pending requests; customers can cancel; either can
// mark in_progress/completed once confirmed. Add stricter transition rules
// here as the state machine grows (e.g. block completed -> pending).
export async function PATCH(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { event: true, vendor: true },
  });
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });

  const isVendor = booking.vendor.userId === auth.userId;
  const isCustomer = booking.event.customerId === auth.userId;
  if (!isVendor && !isCustomer && auth.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = schema.parse(await request.json());

  const updated = await prisma.booking.update({ where: { id: params.id }, data: { status } });
  return Response.json({ booking: updated });
}
