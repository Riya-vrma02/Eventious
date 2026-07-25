import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// DELETE /api/services/:id — a vendor removing their own package.
// Blocked once any booking references it, so we don't orphan a customer's
// event history — vendors should stop offering a package going forward
// rather than delete one that's already been booked.
export async function DELETE(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    include: { vendor: true, _count: { select: { bookings: true } } },
  });
  if (!service) return Response.json({ error: "Service not found" }, { status: 404 });
  if (service.vendor.userId !== auth.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (service._count.bookings > 0) {
    return Response.json(
      { error: "This package has existing bookings and can't be removed." },
      { status: 400 }
    );
  }

  await prisma.service.delete({ where: { id: params.id } });
  return Response.json({ deleted: true });
}