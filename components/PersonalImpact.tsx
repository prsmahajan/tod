"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PersonalImpactProps {
  totalContributed: number;
  transactionCount: number;
  subscriptionStartDate?: string;
  planType?: string;
  billingCycle?: string;
  amount?: number;
}

// Plan options for the modal
const PLAN_OPTIONS = [
  { id: 'seedling-weekly', name: 'Seedling', cycle: 'weekly', amount: 29, label: '₹29/week' },
  { id: 'seedling-monthly', name: 'Seedling', cycle: 'monthly', amount: 79, label: '₹79/month' },
  { id: 'sapling-weekly', name: 'Sapling', cycle: 'weekly', amount: 99, label: '₹99/week' },
  { id: 'sapling-monthly', name: 'Sapling', cycle: 'monthly', amount: 199, label: '₹199/month' },
  { id: 'tree-weekly', name: 'Tree', cycle: 'weekly', amount: 499, label: '₹499/week' },
  { id: 'tree-monthly', name: 'Tree', cycle: 'monthly', amount: 999, label: '₹999/month' },
];

export default function PersonalImpact({
  totalContributed,
  transactionCount,
  subscriptionStartDate,
  planType,
  billingCycle,
  amount,
}: PersonalImpactProps) {
  const [animatedMeals, setAnimatedMeals] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate estimated meals (₹50 per meal)
  const estimatedMeals = Math.floor(totalContributed / 50);
  
  // Calculate days since first contribution
  const daysSinceJoined = subscriptionStartDate 
    ? Math.floor((Date.now() - new Date(subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Animate the meals counter
  useEffect(() => {
    if (estimatedMeals === 0) return;
    
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = estimatedMeals / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= estimatedMeals) {
        setAnimatedMeals(estimatedMeals);
        clearInterval(timer);
      } else {
        setAnimatedMeals(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [estimatedMeals]);

  // Get a personalized message based on contribution level
  const getPersonalizedMessage = () => {
    if (estimatedMeals >= 100) {
      return "You're a true champion for animals! Your generosity has made a massive difference.";
    } else if (estimatedMeals >= 50) {
      return "Amazing dedication! You've helped feed so many hungry animals.";
    } else if (estimatedMeals >= 20) {
      return "Your consistent support is changing lives, one meal at a time.";
    } else if (estimatedMeals >= 5) {
      return "Every meal counts, and yours have made a real difference.";
    } else if (estimatedMeals >= 1) {
      return "Thank you for taking the first step. Every journey begins with one meal.";
    }
    return "Your support journey is about to begin. Every contribution helps!";
  };

  // Get milestone progress
  const getMilestoneProgress = () => {
    const milestones = [5, 10, 25, 50, 100, 250, 500, 1000];
    const nextMilestone = milestones.find(m => m > estimatedMeals) || milestones[milestones.length - 1];
    const prevMilestone = milestones.filter(m => m <= estimatedMeals).pop() || 0;
    const progress = ((estimatedMeals - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    return { nextMilestone, progress: Math.min(100, Math.max(0, progress)) };
  };

  const { nextMilestone, progress } = getMilestoneProgress();

  // Handle plan selection and checkout
  const handlePlanSelect = async (plan: typeof PLAN_OPTIONS[0]) => {
    setSelectedPlan(plan.id);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.name.toLowerCase(),
          billingCycle: plan.cycle,
          amount: plan.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'The Open Draft',
        description: `${plan.name} - ${plan.cycle} subscription`,
        handler: function () {
          setShowModal(false);
          window.location.reload();
        },
        prefill: {
          email: data.customerEmail || '',
        },
        theme: {
          color: '#22c55e',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (totalContributed === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 md:p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Start Your Impact Journey
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Every contribution helps feed a hungry animal. Make your first donation and see your impact grow.
          </p>
          <Link
            href="/support"
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
          >
            Make Your First Contribution
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border border-green-500/20 rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-green-600 uppercase tracking-wider mb-1">Your Impact</p>
            <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
              Making a Difference
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Main Impact Stat */}
        <div className="text-center py-6 mb-6 bg-[var(--color-card-bg)]/50 rounded-xl">
          <p className="text-6xl md:text-7xl font-bold text-green-500 mb-2">
            {animatedMeals}
          </p>
          <p className="text-lg text-[var(--color-text-primary)] font-medium">
            Meals Provided
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Through your ₹{totalContributed.toLocaleString('en-IN')} contribution
          </p>
        </div>

        {/* Milestone Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">Next milestone</span>
            <span className="font-medium text-[var(--color-text-primary)]">{nextMilestone} meals</span>
          </div>
          <div className="w-full h-3 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-center">
            {nextMilestone - estimatedMeals} more meals to reach your next milestone!
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{transactionCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Contributions</p>
          </div>
          <div className="text-center border-x border-[var(--color-border)]">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{daysSinceJoined}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Days Supporting</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              ₹{Math.round(totalContributed / Math.max(1, transactionCount))}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Avg. Contribution</p>
          </div>
        </div>

        {/* Personalized Message */}
        <div className="bg-[var(--color-card-bg)]/50 rounded-xl p-4 border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)] italic text-center">
            "{getPersonalizedMessage()}"
          </p>
        </div>

        {/* Impact Equivalents */}
        <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">What your contribution means</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-[var(--color-card-bg)]/50 rounded-lg">
              <span className="text-2xl">🐕</span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{Math.floor(estimatedMeals / 2)} dogs</p>
                <p className="text-xs text-[var(--color-text-secondary)]">fed for a day</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-card-bg)]/50 rounded-lg">
              <span className="text-2xl">🐈</span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{Math.floor(estimatedMeals / 3)} cats</p>
                <p className="text-xs text-[var(--color-text-secondary)]">fed for a day</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-center px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Increase Impact
          </button>
          <Link
            href="/impact"
            className="flex-1 text-center px-4 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-card-bg)] transition-colors"
          >
            See Community Impact
          </Link>
        </div>
      </div>

      {/* Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Increase Your Impact
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Choose a subscription plan to support more animals
              </p>
            </div>

            {/* Plan Options */}
            <div className="space-y-3">
              {PLAN_OPTIONS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                    selectedPlan === plan.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-left">
                    <p className="font-medium text-[var(--color-text-primary)]">{plan.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{plan.cycle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text-primary)]">{plan.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      ~{Math.floor(plan.amount / 50)} meals/{plan.cycle === 'weekly' ? 'wk' : 'mo'}
                    </p>
                  </div>
                  {selectedPlan === plan.id && isProcessing && (
                    <div className="ml-3">
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* One-time option */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <Link
                href="/support"
                className="block text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                onClick={() => setShowModal(false)}
              >
                Or make a one-time donation →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
