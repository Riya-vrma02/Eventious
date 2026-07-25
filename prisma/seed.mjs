import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = ["Catering", "Photography", "Decor", "Venues", "Event managers", "DJ & music", "Makeup & styling"];

  for (const name of categories) {
    await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${categories.length} categories`);

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
    console.log(`Seeded admin account — log in at /login with:`);
    console.log(`  email:    ${adminEmail}`);
    console.log(`  password: ${adminPassword}`);
  } else {
    console.log("Admin account already exists, skipped.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
