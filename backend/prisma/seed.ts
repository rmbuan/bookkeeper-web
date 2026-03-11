import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
  const hash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: adminUsername },
    create: { username: adminUsername, passwordHash: hash, isAdmin: true },
    update: { passwordHash: hash, isAdmin: true },
  });
  console.log("Seeded admin user:", adminUsername);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
