import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// GET /api/vendors/me — the vendor profile belonging to the logged-in user.
// Used by the frontend to recover vendorProfileId after a plain login
// (not just right after onboarding), so the dashboard works regardless of
// how the vendor got signed in.
export async function GET(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: auth.userId },
    include: { category: true, services: true },
  });

  if (!vendor) return Response.json({ error: "No vendor profile for this account" }, { status: 404 });
  return Response.json({ vendor });
}
