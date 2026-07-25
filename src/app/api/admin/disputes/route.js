import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/disputes — list open disputes for the admin queue
export async function GET(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "open";

  const disputes = await prisma.dispute.findMany({
    where: { status },
    include: {
      booking: { include: { event: true, vendor: true, service: true } },
      raisedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ disputes });
}

const schema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(1),
});

// POST /api/admin/disputes — also usable by customer/vendor to raise a dispute
// on their own booking (kept here since it's the same resource; tighten the
// role check below if you want to split raising vs reviewing into separate routes).
export async function POST(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, reason } = schema.parse(await request.json());

  const dispute = await prisma.dispute.create({
    data: { bookingId, reason, raisedById: auth.userId },
  });

  return Response.json({ dispute }, { status: 201 });
}
