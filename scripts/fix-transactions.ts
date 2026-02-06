/**
 * Fix incorrectly recorded transactions
 * 
 * This script finds transactions that were recorded as "one-time" but should be "subscription"
 * based on:
 * 1. Payment amounts that are subscription-only prices (29, 79, 199)
 * 2. Users who have active subscriptions
 * 
 * Run with: npx tsx scripts/fix-transactions.ts
 */

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

// Use the same IDs as the rest of the app (from lib/appwrite/config.ts)
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'opendraft';
const TRANSACTIONS_COLLECTION = 'transactions';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

// Subscription-only prices (not used for one-time donations)
const SUBSCRIPTION_ONLY_PRICES_INR = [29, 79, 199];
// Prices that could be either (overlap between one-time and subscription)
const AMBIGUOUS_PRICES_INR = [99, 499, 999];

// Check if --dry-run flag is passed
const isDryRun = process.argv.includes('--dry-run');
const isListOnly = process.argv.includes('--list');

async function fixTransactions() {
  console.log('🔧 Starting transaction fix script...');
  console.log(`   Database ID: ${DATABASE_ID}`);
  console.log(`   Transactions Collection: ${TRANSACTIONS_COLLECTION}`);
  console.log(`   Subscriptions Collection: ${SUBSCRIPTIONS_COLLECTION}`);
  if (isDryRun) console.log('   Mode: DRY RUN (no changes will be made)');
  if (isListOnly) console.log('   Mode: LIST ONLY');
  console.log('');

  try {
    // Step 1: Get all transactions
    console.log('📋 Fetching transactions...');
    let allTransactions;
    try {
      allTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION,
        [Query.limit(100)]
      );
      console.log(`   Found ${allTransactions.documents.length} total transactions`);
      
      // Show breakdown by type
      const byType: Record<string, number> = {};
      for (const tx of allTransactions.documents) {
        const type = (tx as any).type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      }
      console.log('   Breakdown by type:', byType);
    } catch (error: any) {
      console.error(`   ❌ Error fetching transactions: ${error.message}`);
      console.log('   Make sure the collection "transactions" exists in your Appwrite database.');
      return;
    }

    // If list-only mode, show all transactions and exit
    if (isListOnly) {
      console.log('\n📄 All transactions:');
      for (const tx of allTransactions.documents) {
        const t = tx as any;
        console.log(`   - ${t.razorpayPaymentId || t.$id}`);
        console.log(`     Email: ${t.userEmail}`);
        console.log(`     Amount: ₹${t.amount}`);
        console.log(`     Type: ${t.type}`);
        console.log(`     Plan: ${t.planType} / ${t.billingCycle || 'n/a'}`);
        console.log('');
      }
      return;
    }

    // Step 2: Find DUPLICATE transactions (same paymentId appears twice)
    // Group transactions by razorpayPaymentId
    const transactionsByPaymentId: Record<string, any[]> = {};
    for (const tx of allTransactions.documents) {
      const paymentId = (tx as any).razorpayPaymentId;
      if (paymentId) {
        if (!transactionsByPaymentId[paymentId]) {
          transactionsByPaymentId[paymentId] = [];
        }
        transactionsByPaymentId[paymentId].push(tx);
      }
    }

    // Find duplicates (paymentIds with more than one transaction)
    const duplicates = Object.entries(transactionsByPaymentId).filter(([_, txs]) => txs.length > 1);
    console.log(`\n🔍 Found ${duplicates.length} payment IDs with duplicate transactions\n`);

    let deletedCount = 0;

    for (const [paymentId, transactions] of duplicates) {
      // Check if there's both a one-time and subscription version
      const oneTimeTx = transactions.find((tx: any) => tx.type === 'one-time');
      const subscriptionTx = transactions.find((tx: any) => tx.type === 'subscription');

      if (oneTimeTx && subscriptionTx) {
        console.log(`   🗑️  ${isDryRun ? 'Would delete' : 'Deleting'} duplicate one-time transaction`);
        console.log(`      Payment ID: ${paymentId}`);
        console.log(`      Email: ${(oneTimeTx as any).userEmail}`);
        console.log(`      Amount: ₹${(oneTimeTx as any).amount}`);
        console.log(`      Keeping: subscription transaction`);

        if (!isDryRun) {
          await databases.deleteDocument(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION,
            oneTimeTx.$id
          );
          console.log(`      ✓ Deleted\n`);
        } else {
          console.log(`      (dry run - no changes made)\n`);
        }

        deletedCount++;
      }
    }

    // Step 3: Check remaining one-time transactions (no duplicate subscription version)
    // These might be genuine one-time donations or incorrectly classified
    const remainingOneTime = allTransactions.documents.filter((tx: any) => {
      const paymentId = tx.razorpayPaymentId;
      const group = transactionsByPaymentId[paymentId] || [];
      // Only one transaction for this paymentId and it's one-time
      return group.length === 1 && tx.type === 'one-time';
    });

    if (remainingOneTime.length > 0) {
      console.log(`\n📋 Checking ${remainingOneTime.length} remaining one-time transactions...\n`);

      for (const tx of remainingOneTime) {
        const transaction = tx as any;
        const amount = transaction.amount;

        // If it's a subscription-only price, it was incorrectly classified
        if (SUBSCRIPTION_ONLY_PRICES_INR.includes(amount)) {
          console.log(`   ⚠️  Suspicious one-time transaction (subscription-only price):`);
          console.log(`      Payment ID: ${transaction.razorpayPaymentId}`);
          console.log(`      Email: ${transaction.userEmail}`);
          console.log(`      Amount: ₹${amount}`);
          console.log(`      This should probably be a subscription transaction.`);
          console.log(`      (Keeping for now - no subscription.charged event was recorded)\n`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total transactions: ${allTransactions.documents.length}`);
    console.log(`   Duplicate payment IDs found: ${duplicates.length}`);
    console.log(`   ${isDryRun ? 'Would delete' : 'Deleted'} duplicate one-time: ${deletedCount}`);
    console.log('='.repeat(50));

    if (deletedCount > 0) {
      if (isDryRun) {
        console.log('\n⚠️  Dry run complete. Run without --dry-run to apply changes.');
      } else {
        console.log('\n✅ Duplicate transactions deleted!');
      }
    } else {
      console.log('\n✅ No duplicate transactions found.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Show usage help
if (process.argv.includes('--help')) {
  console.log(`
Usage: npx tsx scripts/fix-transactions.ts [options]

Options:
  --list      List all transactions (no changes)
  --dry-run   Show what would be fixed (no changes)
  --help      Show this help message

Examples:
  npx tsx scripts/fix-transactions.ts --list      # See all transactions
  npx tsx scripts/fix-transactions.ts --dry-run   # Preview fixes
  npx tsx scripts/fix-transactions.ts             # Apply fixes
`);
  process.exit(0);
}

// Run the script
fixTransactions();
