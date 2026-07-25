import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request) {
  const body = schema.parse(await request.json());

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return Response.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}
