import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/commissions — commission rate per category
export async function GET(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.serviceCategory.findMany({
    select: { id: true, name: true, commissionRate: true },
    orderBy: { name: "asc" },
  });

  return Response.json({ categories });
}

const schema = z.object({
  categoryId: z.string().uuid(),
  commissionRate: z.number().min(0).max(100),
});

// PATCH /api/admin/commissions — set the commission rate for one category
export async function PATCH(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { categoryId, commissionRate } = schema.parse(await request.json());

  const category = await prisma.serviceCategory.update({
    where: { id: categoryId },
    data: { commissionRate },
  });

  return Response.json({ category });
}
