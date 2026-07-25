import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

async function assertParticipant(userId, conversationId) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { vendor: true },
  });
  if (!convo) return null;
  const isParticipant = convo.customerId === userId || convo.vendor.userId === userId;
  return isParticipant ? convo : null;
}

// GET /api/conversations/:id/messages
export async function GET(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const convo = await assertParticipant(auth.userId, params.id);
  if (!convo) return Response.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ messages });
}

const schema = z.object({ body: z.string().min(1) });

// POST /api/conversations/:id/messages
export async function POST(request, { params }) {
  const auth = getAuth(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const convo = await assertParticipant(auth.userId, params.id);
  if (!convo) return Response.json({ error: "Not found" }, { status: 404 });

  const { body } = schema.parse(await request.json());

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: auth.userId, body },
  });

  return Response.json({ message }, { status: 201 });
}
