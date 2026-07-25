import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// GET /api/vendors/:id/bookings — incoming booking requests for this vendor,
// backing the vendor dashboard's request queue.
export async function GET(request, { params }) {
  const auth = getAuth(request);
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: params.id } });
  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });
  if (!auth || (auth.userId !== vendor.userId && auth.role !== "admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { vendorId: params.id },
    include: { service: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ bookings });
}
