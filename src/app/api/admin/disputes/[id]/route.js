import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["resolved", "rejected"]),
  resolution: z.string().min(1),
  refund: z.boolean().default(false),
});

// PATCH /api/admin/disputes/:id — resolve a dispute, optionally triggering a refund
export async function PATCH(request, { params }) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { status, resolution, refund } = schema.parse(await request.json());

  const dispute = await prisma.dispute.update({
    where: { id: params.id },
    data: { status, resolution, resolvedAt: new Date() },
  });

  if (refund) {
    await prisma.payment.update({
      where: { bookingId: dispute.bookingId },
      data: { status: "refunded" },
      // TODO: also call the payment gateway's refund API here (Razorpay/Stripe),
      // this only updates our own record.
    });
  }

  return Response.json({ dispute });
}
