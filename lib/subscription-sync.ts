/**
 * Subscription Sync Utility
 *
 * This utility syncs subscription data between Appwrite and PostgreSQL.
 * Appwrite is the source of truth (receives webhook updates from Razorpay).
 * PostgreSQL is synced for admin dashboard queries.
 */

import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';
import { prisma } from '@/lib/db';

export interface AppwriteSubscription {
  $id: string;
  userId: string;
  userEmail: string;
  razorpaySubscriptionId: string;
  planType: string;
  billingCycle: string;
  amount: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  $createdAt: string;
}

/**
 * Sync a single subscription from Appwrite to PostgreSQL
 */
export async function syncSubscriptionToPostgres(
  appwriteSubscription: AppwriteSubscription
): Promise<void> {
  try {
    // Find or create user in PostgreSQL by email
    let user = await prisma.user.findUnique({
      where: { email: appwriteSubscription.userEmail },
    });

    if (!user) {
      // Create user if doesn't exist, prefer the name the user chose at signup
      user = await prisma.user.create({
        data: {
          email: appwriteSubscription.userEmail,
          name: appwriteSubscription.userName || appwriteSubscription.userEmail.split('@')[0],
          passwordHash: '', // No password for now
          role: 'SUBSCRIBER',
        },
      });
    }

    // Map Appwrite status to PostgreSQL enum
    const statusMap: Record<string, 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'PAST_DUE' | 'EXPIRED'> = {
      'active': 'ACTIVE',
      'cancelled': 'CANCELLED',
      'paused': 'PAUSED',
      'halted': 'PAST_DUE',
      'pending': 'PAST_DUE',
      'expired': 'EXPIRED',
    };

    const subscriptionStatus = statusMap[appwriteSubscription.status] || 'ACTIVE';

    // Update user's subscription data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        razorpaySubscriptionId: appwriteSubscription.razorpaySubscriptionId,
        subscriptionStatus: subscriptionStatus,
        // Use the Appwrite subscription creation time as the "Started" date
        // so the admin dashboard shows when the user first subscribed.
        subscriptionStartedAt: new Date(appwriteSubscription.$createdAt),
        subscriptionEndsAt: new Date(appwriteSubscription.currentPeriodEnd),
        nextBillingDate: new Date(appwriteSubscription.currentPeriodEnd),
      },
    });

    console.log(`Synced subscription ${appwriteSubscription.razorpaySubscriptionId} to PostgreSQL`);
  } catch (error) {
    console.error('Error syncing subscription to PostgreSQL:', error);
    throw error;
  }
}

/**
 * Sync all subscriptions from Appwrite to PostgreSQL
 * Use this for initial migration or periodic batch sync
 */
export async function syncAllSubscriptions(): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Get all subscriptions from Appwrite
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.limit(100)] // Adjust limit as needed
    );

    console.log(`Found ${response.documents.length} subscriptions in Appwrite`);

    for (const doc of response.documents) {
      try {
        await syncSubscriptionToPostgres(doc as any);
        results.synced++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to sync ${doc.$id}: ${error.message}`);
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error in syncAllSubscriptions:', error);
    throw error;
  }
}

/**
 * Get subscription data from Appwrite by user email
 * Use this in your API routes instead of PostgreSQL
 */
export async function getSubscriptionByEmail(
  email: string
): Promise<AppwriteSubscription | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('userEmail', email), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as any;
  } catch (error) {
    console.error('Error getting subscription from Appwrite:', error);
    return null;
  }
}

/**
 * Sync subscription status when admin makes changes
 * Call this after admin extends or cancels a subscription
 */
export async function syncStatusFromPostgres(
  userEmail: string
): Promise<void> {
  try {
    // Get PostgreSQL user data
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
        nextBillingDate: true,
      },
    });

    if (!user || !user.razorpaySubscriptionId) {
      console.log('No subscription found in PostgreSQL for', userEmail);
      return;
    }

    // Find subscription in Appwrite
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [
        Query.equal('razorpaySubscriptionId', user.razorpaySubscriptionId),
        Query.limit(1),
      ]
    );

    if (response.documents.length === 0) {
      console.log('No matching subscription found in Appwrite');
      return;
    }

    const appwriteDoc = response.documents[0];

    // Map PostgreSQL status to Appwrite status
    const statusMap: Record<string, string> = {
      'ACTIVE': 'active',
      'CANCELLED': 'cancelled',
      'PAUSED': 'paused',
      'PAST_DUE': 'halted',
      'EXPIRED': 'expired',
    };

    const newStatus = statusMap[user.subscriptionStatus || 'ACTIVE'] || 'active';

    // Update Appwrite
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      appwriteDoc.$id,
      {
        status: newStatus,
        currentPeriodEnd: user.nextBillingDate?.toISOString() || new Date().toISOString(),
      }
    );

    console.log(`Synced status from PostgreSQL to Appwrite for ${userEmail}`);
  } catch (error) {
    console.error('Error syncing status from PostgreSQL:', error);
    throw error;
  }
}
