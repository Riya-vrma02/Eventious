import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(_request, { params }) {
  const availability = await prisma.availability.findMany({ where: { vendorId: params.id } });
  return Response.json({ availability });
}

const schema = z.object({ date: z.string().datetime(), isBlocked: z.boolean() });

// POST /api/vendors/:id/availability — block or unblock a single date
export async function POST(request, { params }) {
  const auth = getAuth(request);
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: params.id } });
  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });
  if (!auth || auth.userId !== vendor.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, isBlocked } = schema.parse(await request.json());

  const entry = await prisma.availability.upsert({
    where: { vendorId_date: { vendorId: params.id, date: new Date(date) } },
    update: { isBlocked },
    create: { vendorId: params.id, date: new Date(date), isBlocked },
  });

  return Response.json({ availability: entry });
}
