import { NextRequest, NextResponse } from "next/server";
import { syncAllSubscriptions } from "@/lib/subscription-sync";

/**
 * Sync all subscriptions from Appwrite to PostgreSQL
 * Run this once to migrate existing data
 *
 * POST /api/admin/sync-subscriptions
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add proper admin authentication check here
    // For now, relying on manual execution

    console.log('Starting subscription sync from Appwrite to PostgreSQL...');

    const results = await syncAllSubscriptions();

    return NextResponse.json({
      success: true,
      message: 'Subscription sync completed',
      results: {
        synced: results.synced,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * Get sync status and statistics
 *
 * GET /api/admin/sync-subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Add proper authentication

    return NextResponse.json({
      message: 'Sync endpoint ready',
      instructions: 'Send POST request to sync all subscriptions from Appwrite to PostgreSQL',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
