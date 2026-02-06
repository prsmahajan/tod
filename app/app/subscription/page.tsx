"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import type { Subscription } from '@/lib/appwrite/types';
import { toast } from 'sonner';

type PlanType = 'seedling' | 'sprout' | 'tree';
type BillingCycle = 'weekly' | 'monthly';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user?.email) return;

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [
            Query.equal('userEmail', user.email),
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
  }, [user?.email]);

  const performCancelSubscription = async () => {
    if (!subscription) return;

    setCancelling(true);
    setShowCancelModal(false);

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

      setSubscription({
        ...subscription,
        status: 'cancelled',
      });

      toast.success('Subscription cancelled successfully.', { 
        description: 'You will have access until the end of your current billing period.' 
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgradeClick = async (planType: PlanType, billingCycle: BillingCycle, amount: number) => {
    if (!subscription || !user) return;

    if (!razorpayLoaded) {
      toast.warning('Payment gateway is loading. Please try again.');
      return;
    }

    setProcessingUpgrade(true);

    try {
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          billingCycle,
          customerEmail: user.email || '',
          customerName: user.name || '',
          customerContact: (user as any).phone || '',
          displayAmount: amount,
          displayCurrency: 'INR',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create subscription');
      }

      const data = await response.json();

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'The Open Draft',
        description: `Upgrade to ${getPlanLabel(planType)} ${billingCycle === 'weekly' ? 'Weekly' : 'Monthly'}`,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: (user as any).phone || '',
        },
        notes: {
          planType,
          billingCycle,
          userId: user.$id,
          customerEmail: user.email || '',
          customerName: user.name || '',
          displayAmount: amount,
          displayCurrency: 'INR',
        },
        theme: { color: '#A8A29E' },
        handler: async function () {
          toast.success('Subscription upgraded!', { 
            description: 'Your new plan will be active once payment is confirmed.' 
          });
          setShowUpgradeModal(false);
          setTimeout(() => window.location.reload(), 1000);
        },
        modal: {
          ondismiss: function () {
            setProcessingUpgrade(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start upgrade.');
      setProcessingUpgrade(false);
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-500/10';
      case 'paused':
        return 'text-yellow-600 bg-yellow-500/10';
      case 'payment_pending':
        return 'text-orange-600 bg-orange-500/10';
      case 'cancelled':
      case 'halted':
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-[var(--color-text-secondary)] bg-[var(--color-card-bg)]';
    }
  };

  // Check if subscription is at risk (mandate may be revoked)
  const isAtRisk = subscription && ['payment_pending', 'halted'].includes(subscription.status);
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'payment_pending':
        return 'Payment Pending';
      case 'halted':
        return 'Halted';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getFallbackAmount = (planType: PlanType, billingCycle: BillingCycle): number => {
    const isWeekly = billingCycle === 'weekly';
    if (planType === 'seedling') return isWeekly ? 29 : 79;
    if (planType === 'sprout') return isWeekly ? 99 : 499;
    if (planType === 'tree') return isWeekly ? 199 : 999;
    return 0;
  };

  const getPlanLabel = (planType: PlanType): string => {
    if (planType === 'seedling') return 'Seedling';
    if (planType === 'sprout') return 'Sprout';
    return 'Tree';
  };

  const displayAmount =
    subscription && subscription.amount > 0
      ? subscription.amount
      : subscription
      ? getFallbackAmount(subscription.planType as PlanType, subscription.billingCycle as BillingCycle)
      : 0;

  const planRank: Record<PlanType, number> = {
    seedling: 1,
    sprout: 2,
    tree: 3,
  };

  // Generate all upgrade options (higher tier plans with both billing cycles)
  type UpgradeOption = { planType: PlanType; billingCycle: BillingCycle; amount: number };
  const upgradeOptions: UpgradeOption[] = [];

  if (subscription && subscription.planType) {
    const currentRank = planRank[subscription.planType as PlanType];
    const allPlans: PlanType[] = ['seedling', 'sprout', 'tree'];
    const higherTierPlans = allPlans.filter((p) => planRank[p] > currentRank);
    
    // Add both weekly and monthly options for each higher tier
    higherTierPlans.forEach((planType) => {
      upgradeOptions.push({
        planType,
        billingCycle: 'weekly',
        amount: getFallbackAmount(planType, 'weekly'),
      });
      upgradeOptions.push({
        planType,
        billingCycle: 'monthly',
        amount: getFallbackAmount(planType, 'monthly'),
      });
    });
    
    // Sort by amount (ascending) so cheaper options appear first
    upgradeOptions.sort((a, b) => a.amount - b.amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Loading subscription...</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error('Payment gateway failed to load. Please refresh.')}
      />
      
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
                  {getStatusLabel(subscription.status)}
                </span>
              </div>

              {/* At-Risk Warning Banner */}
              {isAtRisk && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-orange-600">
                        {subscription.status === 'payment_pending' 
                          ? 'Payment Issue Detected' 
                          : 'Subscription Halted'}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {subscription.status === 'payment_pending' 
                          ? 'Your last payment couldn\'t be processed. Please check if your UPI AutoPay mandate is still active in your GPay/PhonePe app.'
                          : 'Your subscription has been paused due to payment failures. This usually happens when the UPI mandate is revoked. Please resubscribe to continue supporting.'}
                      </p>
                      <Link
                        href="/support"
                        className="mt-3 inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Resubscribe
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Amount</p>
                  <p className="mt-1 font-heading text-lg font-bold text-[var(--color-text-primary)]">
                    ₹{displayAmount}/{subscription.billingCycle === 'weekly' ? 'week' : 'month'}
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
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-1 py-2 text-center border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
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

      {/* Cancel Subscription Modal */}
      {subscription && showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
              Cancel Subscription
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Are you sure you want to cancel your{' '}
              <span className="font-medium text-[var(--color-text-primary)]">
                {getPlanLabel(subscription.planType as PlanType)}{' '}
                {subscription.billingCycle === 'weekly' ? 'Weekly' : 'Monthly'}
              </span>{' '}
              subscription?
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Your access will continue until the end of your current billing period. After that, autopay will stop and your plan will be inactive.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-card-bg)] cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={performCancelSubscription}
                disabled={cancelling}
                className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {subscription && showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Upgrade Plan</h2>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {upgradeOptions.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                You&apos;re already on the highest plan. Thank you for your generous support!
              </p>
            ) : (
              <>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  Choose a higher plan to increase your impact. You can also switch billing cycles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upgradeOptions.map((option) => {
                    const impact = option.planType === 'seedling' ? 1 : option.planType === 'sprout' ? 2 : 5;
                    return (
                      <button
                        key={`${option.planType}-${option.billingCycle}`}
                        type="button"
                        onClick={() => handleUpgradeClick(option.planType, option.billingCycle, option.amount)}
                        disabled={processingUpgrade}
                        className="border border-[var(--color-border)] rounded-lg p-4 text-left hover:border-[var(--color-text-primary)] hover:bg-[var(--color-card-bg)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
                              {getPlanLabel(option.planType)} • {option.billingCycle === 'weekly' ? 'Weekly' : 'Monthly'}
                            </p>
                            <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                              ₹{option.amount}/{option.billingCycle === 'weekly' ? 'wk' : 'mo'}
                            </p>
                            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                              ~{impact} animal{impact > 1 ? 's' : ''} per cycle
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {processingUpgrade && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-4 text-center">
                    Opening Razorpay checkout...
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
