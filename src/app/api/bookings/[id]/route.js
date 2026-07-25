import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// DELETE /api/bookings/:id — remove a booking from an event, only while
// it's still pending (once a vendor confirms it, cancel via status instead
// so there's a record of what happened).
export async function DELETE(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { event: true },
  });
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
  if (booking.event.customerId !== auth.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (booking.status !== "pending") {
    return Response.json(
      { error: "This booking is already confirmed — cancel it instead of removing it." },
      { status: 400 }
    );
  }

  await prisma.booking.delete({ where: { id: params.id } });
  return Response.json({ deleted: true });
}