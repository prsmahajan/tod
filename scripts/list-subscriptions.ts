import { Client, Databases, Query } from 'node-appwrite';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'opendraft';

async function listSubscriptions() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      'subscriptions',
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );

    console.log(`\nTotal subscriptions: ${res.total}\n`);
    console.log('=' .repeat(100));
    
    for (const doc of res.documents as any[]) {
      const status = doc.status || 'unknown';
      const statusIcon = status === 'active' ? '✅' : status === 'cancelled' ? '❌' : '⚠️';
      
      console.log(`${statusIcon} ${doc.userEmail}`);
      console.log(`   Plan: ${doc.planType} (${doc.billingCycle}) - ₹${doc.amount}`);
      console.log(`   Status: ${status}`);
      console.log(`   Razorpay ID: ${doc.razorpaySubscriptionId || 'N/A'}`);
      console.log(`   Created: ${new Date(doc.$createdAt).toLocaleDateString()}`);
      console.log('-'.repeat(100));
    }

    // Summary
    const active = res.documents.filter((d: any) => d.status === 'active').length;
    const inactive = res.documents.filter((d: any) => d.status !== 'active').length;
    
    console.log(`\nSummary: ${active} active, ${inactive} inactive`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

listSubscriptions();
