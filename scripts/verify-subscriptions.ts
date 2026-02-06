/**
 * Verify all subscriptions against Razorpay
 * 
 * This script checks the real status of all "active" subscriptions
 * in Razorpay and updates our database if needed.
 * 
 * Why this is needed:
 * - Users can revoke UPI mandates directly in GPay/PhonePe
 * - Razorpay doesn't notify us immediately
 * - We only find out when the next charge fails
 * 
 * Run with: npx tsx scripts/verify-subscriptions.ts
 * Options:
 *   --dry-run    Show what would change without updating
 *   --all        Check all subscriptions (not just active)
 */

import { Client, Databases, Query } from 'node-appwrite';
import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'opendraft';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_ID || '',
  key_secret: process.env.RAZORPAY_LIVE_KEY || '',
});

// Command line args
const isDryRun = process.argv.includes('--dry-run');
const checkAll = process.argv.includes('--all');

// Map Razorpay status to our internal status
function mapRazorpayStatus(razorpayStatus: string): string {
  switch (razorpayStatus) {
    case 'active':
      return 'active';
    case 'authenticated':
      return 'authenticated';
    case 'pending':
      return 'payment_pending';
    case 'halted':
      return 'halted';
    case 'cancelled':
      return 'cancelled';
    case 'paused':
      return 'paused';
    case 'completed':
    case 'expired':
      return 'expired';
    default:
      return razorpayStatus;
  }
}

// Status emoji for display
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'active':
      return '✅';
    case 'authenticated':
      return '🔐';
    case 'payment_pending':
      return '⏳';
    case 'halted':
      return '🛑';
    case 'cancelled':
      return '❌';
    case 'paused':
      return '⏸️';
    case 'expired':
      return '💀';
    default:
      return '❓';
  }
}

async function verifySubscriptions() {
  console.log('🔍 Subscription Verification Script');
  console.log('===================================\n');
  
  if (isDryRun) {
    console.log('🔸 DRY RUN MODE - No changes will be made\n');
  }
  
  if (!process.env.RAZORPAY_LIVE_ID || !process.env.RAZORPAY_LIVE_KEY) {
    console.error('❌ RAZORPAY_LIVE_ID and RAZORPAY_LIVE_KEY must be set');
    process.exit(1);
  }

  try {
    // Fetch subscriptions from Appwrite
    const queries = [Query.limit(100)];
    if (!checkAll) {
      queries.push(Query.equal('status', 'active'));
    }

    const subs = await databases.listDocuments(DATABASE_ID, 'subscriptions', queries);
    
    console.log(`📋 Found ${subs.documents.length} subscription(s) to verify\n`);

    let verified = 0;
    let unchanged = 0;
    let changed = 0;
    let errors = 0;
    const issues: any[] = [];

    for (const sub of subs.documents) {
      const doc = sub as any;
      const razorpaySubId = doc.razorpaySubscriptionId;
      
      if (!razorpaySubId) {
        console.log(`⚠️  ${doc.userEmail} - No Razorpay subscription ID, skipping`);
        continue;
      }

      process.stdout.write(`   Checking ${doc.userEmail}... `);

      try {
        // Fetch from Razorpay
        const rzpSub = await razorpay.subscriptions.fetch(razorpaySubId);
        const rzpStatus = rzpSub.status;
        const mappedStatus = mapRazorpayStatus(rzpStatus);
        const currentStatus = doc.status;

        verified++;

        if (currentStatus !== mappedStatus) {
          console.log(`${getStatusEmoji(mappedStatus)} STATUS CHANGED`);
          console.log(`      Our DB: ${currentStatus} → Razorpay: ${rzpStatus} (${mappedStatus})`);
          
          issues.push({
            email: doc.userEmail,
            razorpayId: razorpaySubId,
            previousStatus: currentStatus,
            newStatus: mappedStatus,
            razorpayStatus: rzpStatus,
          });

          if (!isDryRun) {
            // Update in Appwrite
            await databases.updateDocument(
              DATABASE_ID,
              'subscriptions',
              doc.$id,
              {
                status: mappedStatus,
                ...(rzpSub.current_start && {
                  currentPeriodStart: new Date(rzpSub.current_start * 1000).toISOString(),
                }),
                ...(rzpSub.current_end && {
                  currentPeriodEnd: new Date(rzpSub.current_end * 1000).toISOString(),
                }),
              }
            );
            console.log(`      ✓ Updated in database`);
          }

          changed++;
        } else {
          console.log(`${getStatusEmoji(mappedStatus)} OK (${mappedStatus})`);
          unchanged++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        console.log(`❌ ERROR`);
        console.log(`      ${error.message || error}`);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total verified: ${verified}`);
    console.log(`   Unchanged: ${unchanged}`);
    console.log(`   Changed: ${changed}`);
    console.log(`   Errors: ${errors}`);
    console.log('='.repeat(50));

    // List issues
    if (issues.length > 0) {
      console.log('\n⚠️  Subscriptions with status changes:');
      for (const issue of issues) {
        console.log(`\n   ${issue.email}`);
        console.log(`   Razorpay ID: ${issue.razorpayId}`);
        console.log(`   ${issue.previousStatus} → ${issue.newStatus}`);
        
        if (issue.newStatus === 'halted' || issue.newStatus === 'payment_pending') {
          console.log(`   ⚠️  This user likely revoked their UPI mandate!`);
        }
      }
    }

    if (isDryRun && changed > 0) {
      console.log('\n⚠️  Dry run complete. Run without --dry-run to apply changes.');
    } else if (changed > 0) {
      console.log('\n✅ All changes applied!');
    } else {
      console.log('\n✅ All subscriptions are in sync!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Show help
if (process.argv.includes('--help')) {
  console.log(`
Usage: npx tsx scripts/verify-subscriptions.ts [options]

Options:
  --dry-run   Show what would change without updating
  --all       Check all subscriptions (not just active)
  --help      Show this help message

Examples:
  npx tsx scripts/verify-subscriptions.ts              # Verify active subscriptions
  npx tsx scripts/verify-subscriptions.ts --dry-run    # Preview changes
  npx tsx scripts/verify-subscriptions.ts --all        # Check all subscriptions
`);
  process.exit(0);
}

verifySubscriptions();
