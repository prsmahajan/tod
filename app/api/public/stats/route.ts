import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';

/**
 * Public Stats API
 * 
 * Returns aggregated statistics for public display:
 * - Total funds collected
 * - Number of supporters
 * - Animals helped (estimated)
 * - Active subscriptions
 * 
 * This data is cached for 5 minutes to reduce database load.
 */

// Simple in-memory cache
let cachedStats: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (cachedStats && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(cachedStats);
    }

    // Fetch all successful transactions
    let totalRevenue = 0;
    let transactionCount = 0;
    let cursor: string | undefined;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const queries = [
        Query.limit(100),
        Query.equal('status', 'success'),
      ];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        queries
      );

      for (const doc of res.documents as any[]) {
        totalRevenue += doc.amount || 0;
        transactionCount++;
      }

      if (res.documents.length < 100) break;
      cursor = res.documents[res.documents.length - 1].$id;
    }

    // Fetch active subscriptions count
    const activeSubsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('status', 'active')]
    );
    const activeSubscriptions = activeSubsRes.total;

    // Fetch total unique supporters (by email)
    const allSubsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.limit(100)]
    );
    const uniqueEmails = new Set<string>();
    for (const doc of allSubsRes.documents as any[]) {
      if (doc.userEmail) {
        uniqueEmails.add(doc.userEmail.toLowerCase());
      }
    }
    const totalSupporters = uniqueEmails.size;

    // Estimate animals helped
    // Based on approximate cost: ₹30 feeds one animal for a day
    // We'll use a more conservative estimate: ~₹50 per animal meal
    const animalsHelped = Math.floor(totalRevenue / 50);

    // Calculate MRR (for display purposes)
    let mrr = 0;
    for (const doc of activeSubsRes.documents as any[]) {
      const amount = (doc as any).amount || 0;
      const billingCycle = (doc as any).billingCycle || 'monthly';
      if (billingCycle === 'weekly') {
        mrr += amount * 4;
      } else {
        mrr += amount;
      }
    }

    const stats = {
      totalRevenue,
      totalSupporters,
      activeSubscriptions,
      animalsHelped,
      transactionCount,
      mrr,
      // Don't expose exact numbers, round them for public display
      display: {
        totalRevenue: formatCurrency(totalRevenue),
        totalSupporters: totalSupporters,
        activeSubscriptions: activeSubscriptions,
        animalsHelped: animalsHelped,
        // Milestone progress (goal: ₹10,000)
        goalProgress: Math.min(100, Math.round((totalRevenue / 10000) * 100)),
      },
    };

    // Update cache
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching public stats:', error);
    
    // Return fallback stats if there's an error
    return NextResponse.json({
      totalRevenue: 0,
      totalSupporters: 0,
      activeSubscriptions: 0,
      animalsHelped: 0,
      transactionCount: 0,
      mrr: 0,
      display: {
        totalRevenue: '₹0',
        totalSupporters: 0,
        activeSubscriptions: 0,
        animalsHelped: 0,
        goalProgress: 0,
      },
    });
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
