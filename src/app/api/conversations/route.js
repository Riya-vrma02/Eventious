import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

// GET /api/conversations — list conversations for the logged-in user
// (as customer, or as vendor via their vendor profile)
export async function GET(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: auth.userId } });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { customerId: auth.userId },
        ...(vendorProfile ? [{ vendorId: vendorProfile.id }] : []),
      ],
    },
    include: {
      customer: { select: { id: true, name: true } },
      vendor: { select: { id: true, businessName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ conversations });
}

const schema = z.object({ vendorId: z.string().uuid() });

// POST /api/conversations — customer starts (or reopens) a thread with a vendor
export async function POST(request) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { vendorId } = schema.parse(await request.json());

  const conversation = await prisma.conversation.upsert({
    where: { customerId_vendorId: { customerId: auth.userId, vendorId } },
    update: {},
    create: { customerId: auth.userId, vendorId },
  });

  return Response.json({ conversation }, { status: 201 });
}
