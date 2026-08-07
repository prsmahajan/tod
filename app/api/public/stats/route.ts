import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';
import { respondWithPublicData } from '@/lib/public-data/availability';
import { sumConfirmedInrTransactions } from '@/lib/impact/public-metrics';

/**
 * Public Stats API
 *
 * Returns aggregated statistics for public display:
 * - Total funds collected
 * - Animals helped (estimated)
 *
 * This data is cached for 5 minutes to reduce database load.
 */

let cachedStats: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  return respondWithPublicData(
    async () => {
      const now = Date.now();
      if (cachedStats && now - cacheTimestamp < CACHE_DURATION) {
        return cachedStats;
      }

      let totalRevenue = 0;
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

        totalRevenue += sumConfirmedInrTransactions(res.documents as any[]);

        if (res.documents.length < 100) break;
        cursor = res.documents[res.documents.length - 1].$id;
      }

      const animalsHelped = Math.floor(totalRevenue / 50);

      const stats = {
        totalRevenue,
        animalsHelped,
        display: {
          totalRevenue: formatCurrency(totalRevenue),
          animalsHelped,
        },
      };

      cachedStats = stats;
      cacheTimestamp = now;

      return stats;
    },
    'Impact totals are unavailable right now.',
    (error) => console.error('Error fetching public stats:', error),
  );
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
