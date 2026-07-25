import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const categories = await prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
  return Response.json({ categories });
}

const schema = z.object({ name: z.string().min(1) });

export async function POST(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = schema.parse(await request.json());
  const category = await prisma.serviceCategory.create({ data: { name } });
  return Response.json({ category }, { status: 201 });
}
