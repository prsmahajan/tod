/**
 * Check active subscribers who have disabled autopay
 * These users will churn at the end of their billing period
 * 
 * Usage:
 *   npm run check-autopay
 */

import { prisma } from '../lib/db';
import Razorpay from 'razorpay';

async function checkAutopayDisabled() {
  try {
    console.log('🔍 Checking active subscriptions for disabled autopay...\n');

    // Verify required environment variables
    const keyId = process.env.RAZORPAY_LIVE_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_LIVE_KEY || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('❌ Error: Razorpay credentials not found in .env.local');
      console.log('\nRequired environment variables:');
      console.log('  - RAZORPAY_LIVE_ID and RAZORPAY_LIVE_KEY');
      console.log('  OR');
      console.log('  - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
      process.exit(1);
    }

    console.log('✅ Razorpay credentials loaded');
    console.log(`   Key ID: ${keyId.substring(0, 15)}...\n`);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Get all active subscribers from database
    const activeUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'ACTIVE',
        razorpaySubscriptionId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        nextBillingDate: true,
        animalsFed: true,
      },
    });

    if (activeUsers.length === 0) {
      console.log('✅ No active subscriptions found!\n');
      return;
    }

    console.log(`Found ${activeUsers.length} active subscription(s)\n`);
    console.log('Checking Razorpay for autopay status...\n');
    console.log('='.repeat(80));

    let autopayDisabledCount = 0;
    const autopayDisabledUsers: any[] = [];

    for (const user of activeUsers) {
      try {
        // Fetch subscription details from Razorpay
        const subscription = await razorpay.subscriptions.fetch(user.razorpaySubscriptionId!);
        
        // Only flag if truly cancelled or paused
        // - status is 'cancelled' or 'completed'
        // - pause_initiated is true
        // - has_scheduled_changes with "cancel" action
        const isCancelled = subscription.status === 'cancelled' || 
                           subscription.status === 'completed';
        const isPauseInitiated = subscription.pause_initiated === true;
        const hasScheduledCancel = subscription.has_scheduled_changes && 
                                  subscription.scheduled_changes?.some((change: any) => 
                                    change.action === 'cancel'
                                  );
        
        const hasAutopayDisabled = isCancelled || isPauseInitiated || hasScheduledCancel;
        
        if (hasAutopayDisabled) {
          autopayDisabledCount++;
          autopayDisabledUsers.push({
            ...user,
            razorpayStatus: subscription.status,
            endAt: subscription.end_at ? new Date(subscription.end_at * 1000) : null,
            pauseInitiated: subscription.pause_initiated,
          });

          console.log(`\n⚠️  ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Razorpay ID: ${user.razorpaySubscriptionId}`);
          console.log(`   Status: ${subscription.status}`);
          console.log(`   Cancelled: ${isCancelled ? 'YES' : 'NO'}`);
          console.log(`   Pause Initiated: ${isPauseInitiated ? 'YES' : 'NO'}`);
          console.log(`   Scheduled Cancel: ${hasScheduledCancel ? 'YES' : 'NO'}`);
          console.log(`   End Date: ${subscription.end_at ? new Date(subscription.end_at * 1000).toLocaleDateString() : 'N/A'}`);
          console.log(`   Animals Fed: ${user.animalsFed}`);
          console.log(`   Next Billing: ${user.nextBillingDate ? new Date(user.nextBillingDate).toLocaleDateString() : 'N/A'}`);
        }

      } catch (error: any) {
        console.error(`❌ Error fetching subscription for ${user.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    
    if (autopayDisabledCount === 0) {
      console.log('\n✅ All active subscribers have autopay enabled!');
      console.log('   No impact to MRR expected from cancellations.\n');
    } else {
      console.log(`\n⚠️  ${autopayDisabledCount} subscriber(s) have DISABLED autopay`);
      console.log(`   These users will churn at the end of their billing period`);
      console.log(`   Estimated MRR impact: Check individual subscription amounts\n`);
      
      // Calculate potential MRR loss
      console.log('📊 Users at risk:');
      autopayDisabledUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 Summary:`);
    console.log(`   Total Active: ${activeUsers.length}`);
    console.log(`   Autopay Disabled: ${autopayDisabledCount}`);
    console.log(`   Retention Rate: ${((activeUsers.length - autopayDisabledCount) / activeUsers.length * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAutopayDisabled();
