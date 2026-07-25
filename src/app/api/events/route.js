import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  eventType: z.string().min(1),
  eventDate: z.string().datetime(),
  guestCount: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
});

// GET /api/events — list the logged-in customer's events
export async function GET(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { customerId: auth.userId },
    include: { bookings: { include: { service: true, vendor: true } } },
    orderBy: { eventDate: "asc" },
  });

  return Response.json({ events });
}

// POST /api/events — start a new event
export async function POST(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await request.json());

    const event = await prisma.event.create({
      data: { customerId: auth.userId, ...body, eventDate: new Date(body.eventDate) },
    });

    return Response.json({ event }, { status: 201 });
  } catch (err) {
    console.error("POST /api/events failed:", err);
    return Response.json({ error: err.message, name: err.name }, { status: 500 });
  }
}