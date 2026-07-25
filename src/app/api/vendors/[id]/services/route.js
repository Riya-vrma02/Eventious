import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(_request, { params }) {
  const services = await prisma.service.findMany({ where: { vendorId: params.id } });
  return Response.json({ services });
}

const schema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().positive(),
  priceType: z.enum(["fixed", "per_guest", "per_hour"]).default("fixed"),
});

export async function POST(request, { params }) {
  const auth = getAuth(request);
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: params.id } });
  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });
  if (!auth || auth.userId !== vendor.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.parse(await request.json());
  const service = await prisma.service.create({ data: { vendorId: params.id, ...body } });
  return Response.json({ service }, { status: 201 });
}