import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

// GET /api/vendors?category=&city=&maxBudget=&date=&page=&limit=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const maxBudget = searchParams.get("maxBudget") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  const vendors = await prisma.vendorProfile.findMany({
    where: {
      verified: true,
      ...(category && { category: { name: category } }),
      ...(city && { city }),
      ...(maxBudget && { services: { some: { price: { lte: Number(maxBudget) } } } }),
      ...(date && {
        NOT: { availability: { some: { date: new Date(date), isBlocked: true } } },
      }),
    },
    include: { category: true, services: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { ratingAvg: "desc" },
  });

  return Response.json({ vendors, page, limit });
}

const createSchema = z.object({
  businessName: z.string().min(1),
  categoryId: z.string().uuid(),
  city: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

// POST /api/vendors — create a vendor profile for the logged-in user
export async function POST(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "vendor")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.parse(await request.json());

  const profile = await prisma.vendorProfile.create({
    data: { userId: auth.userId, ...body },
  });

  return Response.json({ profile }, { status: 201 });
}