import { prisma } from "@/lib/prisma";
import { getAuth, requireRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ approve: z.boolean() });

// POST /api/vendors/:id/verify — approve or reject a pending vendor
// Rejection deletes the profile rather than flagging it, so vendors can
// re-apply cleanly; swap to a "rejected" status field if you want history.
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!requireRole(auth, "admin")) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { approve } = schema.parse(await request.json());

  if (!approve) {
    await prisma.vendorProfile.delete({ where: { id: params.id } });
    return Response.json({ rejected: true });
  }

  const vendor = await prisma.vendorProfile.update({
    where: { id: params.id },
    data: { verified: true },
  });

  return Response.json({ vendor });
}
