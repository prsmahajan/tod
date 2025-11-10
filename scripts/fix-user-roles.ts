import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user roles...\n');

  // Get all users sorted by creation date
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log('❌ No users found in database');
    return;
  }

  console.log(`Found ${users.length} user(s)\n`);

  // First user should be admin, rest should be subscribers
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const shouldBeAdmin = i === 0;
    const targetRole = shouldBeAdmin ? 'ADMIN' : 'SUBSCRIBER';

    if (user.role !== targetRole) {
      console.log(`📝 Updating ${user.email} from ${user.role} to ${targetRole}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { role: targetRole },
      });
    } else {
      console.log(`✅ ${user.email} already has correct role: ${user.role}`);
    }
  }

  console.log('\n✨ User roles fixed successfully!');
  console.log(`\nFinal state:`);

  const updatedUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  updatedUsers.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email} - ${u.name} [${u.role}]`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
