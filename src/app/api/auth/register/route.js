import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "vendor"]).default("customer"),
});

export async function POST(request) {
  const body = schema.parse(await request.json());

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash: await hashPassword(body.password),
      role: body.role,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return Response.json({ token, user: { id: user.id, name: user.name, role: user.role } }, { status: 201 });
}
