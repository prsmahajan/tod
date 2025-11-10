import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking subscribers in database...\n');

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });

  if (subscribers.length === 0) {
    console.log('✅ No subscribers found in database (clean state)\n');
    return;
  }

  console.log(`Found ${subscribers.length} subscriber(s):\n`);

  subscribers.forEach((sub, i) => {
    console.log(`${i + 1}. ${sub.email}`);
    console.log(`   Name: ${sub.name || 'N/A'}`);
    console.log(`   Status: ${sub.isActive ? 'Active' : 'Unsubscribed'}`);
    console.log(`   Subscribed: ${sub.subscribedAt.toLocaleDateString()}`);
    console.log('');
  });

  console.log(`\n📈 Summary:`);
  console.log(`   Total: ${subscribers.length}`);
  console.log(`   Active: ${subscribers.filter(s => s.isActive).length}`);
  console.log(`   Unsubscribed: ${subscribers.filter(s => !s.isActive).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
