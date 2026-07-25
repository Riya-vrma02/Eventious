import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  serviceId: z.string().uuid(),
});

// POST /api/events/:id/bookings — add a vendor's service to this event
// This is the "add to event" action from the vendor profile / cart screens.
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.customerId !== auth.userId) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const { serviceId } = schema.parse(await request.json());

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: "Service not found" }, { status: 404 });

  const booking = await prisma.booking.create({
    data: {
      eventId: event.id,
      vendorId: service.vendorId,
      serviceId: service.id,
      amount: service.price,
      status: "pending",
    },
  });

  return Response.json({ booking }, { status: 201 });
}
