import Razorpay from 'razorpay';
import { config } from 'dotenv';

config({ path: '.env.local' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_ID || '',
  key_secret: process.env.RAZORPAY_LIVE_KEY || '',
});

async function checkSubscription(subscriptionId: string) {
  try {
    console.log(`\nChecking Razorpay subscription: ${subscriptionId}\n`);
    
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    
    console.log('Razorpay Status:', subscription.status);
    console.log('Plan ID:', subscription.plan_id);
    console.log('Customer Email:', subscription.notes?.userEmail || 'N/A');
    console.log('Created At:', new Date((subscription.created_at as number) * 1000).toLocaleString());
    console.log('Current Start:', subscription.current_start ? new Date((subscription.current_start as number) * 1000).toLocaleString() : 'N/A');
    console.log('Current End:', subscription.current_end ? new Date((subscription.current_end as number) * 1000).toLocaleString() : 'N/A');
    console.log('Ended At:', subscription.ended_at ? new Date((subscription.ended_at as number) * 1000).toLocaleString() : 'N/A');
    console.log('Cancelled At:', subscription.cancelled_at ? new Date((subscription.cancelled_at as number) * 1000).toLocaleString() : 'N/A');
    console.log('\nFull response:', JSON.stringify(subscription, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check the subscription in question
const subId = process.argv[2] || 'sub_SCOS0MPj6AQrOZ';
checkSubscription(subId);
