"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import type { Transaction, Subscription, UserPhoto } from '@/lib/appwrite/types';
import PersonalImpact from '@/components/PersonalImpact';

interface Stats {
  totalContributed: number;
  transactionCount: number;
  photosSubmitted: number;
  photosApproved: number;
  activeSubscription: Subscription | null;
}

// Fallback amounts when subscription.amount is 0
const getFallbackAmount = (planType: string, billingCycle: string): number => {
  const isWeekly = billingCycle === 'weekly';
  if (planType === 'seedling') return isWeekly ? 29 : 79;
  if (planType === 'sprout') return isWeekly ? 99 : 499;
  if (planType === 'tree') return isWeekly ? 199 : 999;
  return 0;
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalContributed: 0,
    transactionCount: 0,
    photosSubmitted: 0,
    photosApproved: 0,
    activeSubscription: null,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.email) return;

      try {
        // Fetch transactions by email (webhooks record userEmail, not always userId)
        const transactionsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          [
            Query.equal('userEmail', user.email),
            Query.equal('status', 'success'),
            Query.orderDesc('$createdAt'),
            Query.limit(5),
          ]
        );

        const transactions = transactionsResponse.documents as unknown as Transaction[];
        const totalContributed = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Fetch all transactions count
        const allTransactionsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          [
            Query.equal('userEmail', user.email),
            Query.equal('status', 'success'),
          ]
        );

        // Fetch active subscription by email
        const subscriptionsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [
            Query.equal('userEmail', user.email),
            Query.equal('status', 'active'),
            Query.limit(1),
          ]
        );

        const activeSubscription = subscriptionsResponse.documents[0] as unknown as Subscription | null;

        // Fetch photos (keep userId for photos as they're uploaded directly)
        const photosResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USER_PHOTOS,
          [Query.equal('userId', user.$id)]
        );

        const photos = photosResponse.documents as unknown as UserPhoto[];
        const approvedPhotos = photos.filter((p) => p.status === 'approved');

        setStats({
          totalContributed: (allTransactionsResponse.documents as unknown as Transaction[]).reduce((sum, t) => sum + t.amount, 0),
          transactionCount: allTransactionsResponse.total,
          photosSubmitted: photos.length,
          photosApproved: approvedPhotos.length,
          activeSubscription,
        });

        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If Appwrite collections don't exist yet, show empty state
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user?.email, user?.$id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
        Welcome back, {user?.name?.split(' ')[0] || 'Supporter'}!
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Here&apos;s an overview of your contributions and activity.
      </p>

      {/* Personal Impact Section */}
      <div className="mt-8">
        <PersonalImpact
          totalContributed={stats.totalContributed}
          transactionCount={stats.transactionCount}
          subscriptionStartDate={stats.activeSubscription?.$createdAt}
          planType={stats.activeSubscription?.planType}
          billingCycle={stats.activeSubscription?.billingCycle}
          amount={stats.activeSubscription?.amount}
        />
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Total Contributed</p>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            ₹{stats.totalContributed.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Transactions</p>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            {stats.transactionCount}
          </p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Photos Submitted</p>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            {stats.photosSubmitted}
          </p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Photos Approved</p>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            {stats.photosApproved}
          </p>
        </div>
      </div>

      {/* Active Subscription */}
      {stats.activeSubscription ? (
        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Subscription</p>
              <p className="mt-1 font-heading text-xl font-bold text-[var(--color-text-primary)]">
                {stats.activeSubscription.planType.charAt(0).toUpperCase() + stats.activeSubscription.planType.slice(1)} - ₹{stats.activeSubscription.amount > 0 ? stats.activeSubscription.amount : getFallbackAmount(stats.activeSubscription.planType, stats.activeSubscription.billingCycle)}/{stats.activeSubscription.billingCycle === 'weekly' ? 'week' : 'month'}
              </p>
              {stats.activeSubscription.currentPeriodEnd && (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Next billing: {new Date(stats.activeSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <Link
              href="/app/subscription"
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-card-bg)] transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
          <p className="text-[var(--color-text-secondary)]">No active subscription</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Subscribe for recurring support with GPay/UPI autopay.
          </p>
          <Link
            href="/support"
            className="mt-4 inline-block px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start Subscription
          </Link>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">Recent Transactions</h2>
          <Link
            href="/app/contributions"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            View All
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.$id}
                className="flex items-center justify-between p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {transaction.type === 'subscription' ? 'Subscription Payment' : 'One-time Donation'}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(transaction.$createdAt).toLocaleDateString()} • {transaction.planType}
                  </p>
                </div>
                <p className="font-heading font-bold text-[var(--color-text-primary)]">
                  ₹{transaction.amount}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
            <p className="text-[var(--color-text-secondary)]">No transactions yet</p>
            <Link
              href="/support"
              className="mt-2 inline-block text-sm text-[var(--color-text-primary)] hover:underline"
            >
              Make your first contribution
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/app/upload"
          className="flex items-center gap-4 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-text-secondary)] transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">Upload Photos</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Share your animal feeding moments</p>
          </div>
        </Link>
        <Link
          href="/impact"
          className="flex items-center gap-4 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-text-secondary)] transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">View Impact</p>
            <p className="text-xs text-[var(--color-text-secondary)]">See how contributions are helping</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
