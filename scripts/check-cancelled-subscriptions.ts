/**
 * Check users who have cancelled their subscriptions
 * 
 * Usage:
 *   npm run check-cancelled
 */

import { prisma } from '../lib/db';

async function checkCancelledSubscriptions() {
  try {
    console.log('🔍 Finding users with cancelled subscriptions...\n');

    const cancelledUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'CANCELLED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        animalsFed: true,
        createdAt: true,
      },
      orderBy: {
        subscriptionEndsAt: 'desc',
      },
    });

    if (cancelledUsers.length === 0) {
      console.log('✅ No cancelled subscriptions found!\n');
      return;
    }

    console.log(`Found ${cancelledUsers.length} cancelled subscription(s)\n`);
    console.log('='.repeat(80));

    cancelledUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Razorpay ID: ${user.razorpaySubscriptionId || 'N/A'}`);
      console.log(`   Started: ${user.subscriptionStartedAt ? new Date(user.subscriptionStartedAt).toLocaleDateString() : 'N/A'}`);
      console.log(`   Ends: ${user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString() : 'N/A'}`);
      console.log(`   Animals Fed: ${user.animalsFed}`);
      console.log(`   Joined: ${new Date(user.createdAt).toLocaleDateString()}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Total Cancelled: ${cancelledUsers.length}`);
    console.log('='.repeat(80) + '\n');

    // Also check other subscription statuses for context
    const statusCounts = await prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: {
        subscriptionStatus: true,
      },
    });

    console.log('📈 Subscription Status Breakdown:');
    statusCounts.forEach((status) => {
      const statusLabel = status.subscriptionStatus || 'NO_SUBSCRIPTION';
      console.log(`   ${statusLabel}: ${status._count.subscriptionStatus}`);
    });
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCancelledSubscriptions();
