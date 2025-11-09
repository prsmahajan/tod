/**
 * Script to make a user an admin
 * Run with: npx tsx scripts/make-admin.ts your-email@example.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully made ${email} an admin!`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address");
  console.log("Usage: npx tsx scripts/make-admin.ts your-email@example.com");
  process.exit(1);
}

makeAdmin(email);
