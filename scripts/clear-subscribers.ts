import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all subscribers from database...\n');

  const count = await prisma.subscriber.count();

  if (count === 0) {
    console.log('✅ Database already clean - no subscribers to delete\n');
    return;
  }

  console.log(`Found ${count} subscriber(s) to delete\n`);

  const result = await prisma.subscriber.deleteMany({});

  console.log(`✨ Successfully deleted ${result.count} subscriber(s)\n`);
  console.log('🎉 Subscribers table is now clean and ready for real data!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
