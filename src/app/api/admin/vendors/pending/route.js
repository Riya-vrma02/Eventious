import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";

export async function GET(request) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const vendors = await prisma.vendorProfile.findMany({
    where: { verified: false },
    include: { category: true, user: { select: { name: true, email: true } } },
  });

  return Response.json({ vendors });
}
