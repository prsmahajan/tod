"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import type { Transaction } from '@/lib/appwrite/types';

export default function ContributionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'one-time' | 'subscription'>('all');

  useEffect(() => {
    async function fetchTransactions() {
      if (!user?.email) return;

      try {
        const queries = [
          // Query by email since transactions are recorded with userEmail from webhooks
          Query.equal('userEmail', user.email),
          Query.orderDesc('$createdAt'),
        ];

        if (filter !== 'all') {
          queries.push(Query.equal('type', filter));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          queries
        );

        setTransactions(response.documents as unknown as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [user?.email, filter]);

  const totalContributed = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const successfulTransactions = transactions.filter((t) => t.status === 'success').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
        My Contributions
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Track all your donations and subscription payments.
      </p>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Total Contributed</p>
          <p className="mt-2 font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            ₹{totalContributed.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Successful Payments</p>
          <p className="mt-2 font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            {successfulTransactions}
          </p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Animals Helped</p>
          <p className="mt-2 font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            ~{Math.floor(totalContributed / 30)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Estimated</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-8 flex gap-2">
        {(['all', 'one-time', 'subscription'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              filter === f
                ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)]'
                : 'bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'one-time' ? 'One-time' : 'Subscriptions'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="mt-6 space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.$id}
              className="flex items-center justify-between p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.status === 'success'
                      ? 'bg-green-500/10 text-green-600'
                      : transaction.status === 'failed'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-600'
                  }`}
                >
                  {transaction.status === 'success' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : transaction.status === 'failed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {transaction.type === 'subscription' ? 'Subscription Payment' : 'One-time Donation'}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
                      {transaction.planType}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(transaction.$createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {transaction.razorpayPaymentId && (
                    <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-1">
                      ID: {transaction.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-heading text-lg font-bold ${
                  transaction.status === 'success'
                    ? 'text-[var(--color-text-primary)]'
                    : transaction.status === 'failed'
                    ? 'text-red-500 line-through'
                    : 'text-yellow-600'
                }`}>
                  ₹{transaction.amount}
                </p>
                <p className={`text-xs capitalize ${
                  transaction.status === 'success'
                    ? 'text-green-600'
                    : transaction.status === 'failed'
                    ? 'text-red-500'
                    : 'text-yellow-600'
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
            <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-[var(--color-text-secondary)]">No transactions found</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {filter !== 'all' ? 'Try changing the filter or ' : ''}Make your first contribution to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
