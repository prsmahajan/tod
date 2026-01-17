"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import type { Subscription } from '@/lib/appwrite/types';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user?.$id) return;

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]
        );

        if (response.documents.length > 0) {
          setSubscription(response.documents[0] as unknown as Subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user?.$id]);

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? You will continue to have access until the current billing period ends.')) {
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.razorpaySubscriptionId,
          userId: user?.$id,
          cancelAtCycleEnd: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update local state
      setSubscription({
        ...subscription,
        status: 'cancelled',
      });

      toast.success('Subscription cancelled successfully.', { description: 'You will have access until the end of your current billing period.' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-500/10';
      case 'paused':
        return 'text-yellow-600 bg-yellow-500/10';
      case 'cancelled':
      case 'halted':
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-[var(--color-text-secondary)] bg-[var(--color-card-bg)]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Loading subscription...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
        Subscription
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Manage your recurring support subscription.
      </p>

      {subscription ? (
        <div className="mt-8">
          {/* Subscription Card */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Current Plan</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan
                </h2>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Amount</p>
                <p className="mt-1 font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  ₹{subscription.amount}/{subscription.billingCycle === 'weekly' ? 'week' : 'month'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Billing Cycle</p>
                <p className="mt-1 font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                </p>
              </div>
            </div>

            {subscription.currentPeriodEnd && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {subscription.status === 'active' ? 'Next billing date:' : 'Access until:'}{' '}
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Actions */}
            {subscription.status === 'active' && (
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex gap-4">
                <Link
                  href="/support"
                  className="flex-1 py-2 text-center border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  Upgrade Plan
                </Link>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 py-2 text-center border border-red-500/30 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}

            {subscription.status === 'cancelled' && (
              <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Your subscription has been cancelled. You can resubscribe anytime.
                </p>
                <Link
                  href="/support"
                  className="mt-4 inline-block px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Resubscribe
                </Link>
              </div>
            )}

            {(subscription.status === 'halted' || subscription.status === 'expired') && (
              <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-red-500">
                    {subscription.status === 'halted'
                      ? 'Your subscription has been paused due to payment issues. Please update your payment method.'
                      : 'Your subscription has expired. Please resubscribe to continue supporting.'}
                  </p>
                </div>
                <Link
                  href="/support"
                  className="mt-4 inline-block px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Resubscribe
                </Link>
              </div>
            )}
          </div>

          {/* Subscription ID */}
          <div className="mt-4 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
            <p className="text-xs text-[var(--color-text-secondary)]">Subscription ID</p>
            <p className="mt-1 font-mono text-sm text-[var(--color-text-primary)]">
              {subscription.razorpaySubscriptionId}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <h2 className="mt-4 font-heading text-xl font-bold text-[var(--color-text-primary)]">
            No Active Subscription
          </h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Subscribe for recurring support and make a lasting impact.
          </p>

          <div className="mt-6 max-w-sm mx-auto space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg">
              <span className="text-sm text-[var(--color-text-secondary)]">Weekly from</span>
              <span className="font-heading font-bold text-[var(--color-text-primary)]">₹29/week</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg">
              <span className="text-sm text-[var(--color-text-secondary)]">Monthly from</span>
              <span className="font-heading font-bold text-[var(--color-text-primary)]">₹79/month</span>
            </div>
          </div>

          <Link
            href="/support"
            className="mt-6 inline-block px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start Subscription
          </Link>

          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            GPay / UPI Autopay supported • Cancel anytime
          </p>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">FAQ</h3>

        <details className="group bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-[var(--color-text-primary)] list-none flex items-center justify-between">
            How does the subscription work?
            <svg className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 text-sm text-[var(--color-text-secondary)]">
            Your subscription automatically charges your UPI/card at the chosen frequency (weekly or monthly). The amount goes directly towards feeding and caring for stray animals.
          </div>
        </details>

        <details className="group bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-[var(--color-text-primary)] list-none flex items-center justify-between">
            Can I cancel anytime?
            <svg className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 text-sm text-[var(--color-text-secondary)]">
            Yes, you can cancel your subscription at any time from this page. Your access continues until the end of the current billing period.
          </div>
        </details>

        <details className="group bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-[var(--color-text-primary)] list-none flex items-center justify-between">
            What payment methods are supported?
            <svg className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 text-sm text-[var(--color-text-secondary)]">
            We support UPI Autopay (GPay, PhonePe, Paytm, etc.), credit/debit cards, and net banking for recurring payments.
          </div>
        </details>
      </div>
    </div>
  );
}
