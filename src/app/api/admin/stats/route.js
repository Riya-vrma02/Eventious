import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";

export async function GET(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [totalBookings, activeVendors, revenue] = await Promise.all([
    prisma.booking.count(),
    prisma.vendorProfile.count({ where: { verified: true } }),
    prisma.payment.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
  ]);

  return Response.json({
    totalBookings,
    activeVendors,
    revenue: revenue._sum.amount ?? 0,
  });
}
