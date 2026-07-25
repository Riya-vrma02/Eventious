import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(_request, { params }) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: params.id },
    include: { category: true, services: true, availability: true },
  });

  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });
  return Response.json({ vendor });
}

export async function PATCH(request, { params }) {
  const auth = getAuth(request);
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: params.id } });

  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });
  if (!auth || (auth.userId !== vendor.userId && auth.role !== "admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await prisma.vendorProfile.update({ where: { id: params.id }, data: body });
  return Response.json({ vendor: updated });
}
