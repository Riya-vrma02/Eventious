import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/dev-seed?secret=... — one-time production seed, run from the
// browser so it executes on Vercel's network instead of the local machine's
// (which can't reach Neon directly on port 5432). Guarded by SEED_SECRET so
// it can't be triggered by anyone else. DELETE THIS ROUTE once you've used it.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = ["Catering", "Photography", "Decor", "Venues", "Event managers", "DJ & music", "Makeup & styling"];
  for (const name of categories) {
    await prisma.serviceCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  const adminEmail = "admin@gather.test";
  const adminPassword = "admin12345";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "admin",
      },
    });
  }

  return Response.json({
    seeded: true,
    categories: categories.length,
    adminCreated: !existingAdmin,
  });
}