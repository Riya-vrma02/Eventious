import { prisma } from "@/lib/prisma";

// GET /api/vendors/:id/reviews — shown on the vendor profile page
export async function GET(_request, { params }) {
  const reviews = await prisma.review.findMany({
    where: { booking: { vendorId: params.id } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ reviews });
}
