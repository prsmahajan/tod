"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/appwrite/auth';
import Script from 'next/script';
import { toast } from 'sonner';
import { detectUserLocationClient } from '@/lib/geolocation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMode = 'one-time' | 'subscribe';
type BillingCycle = 'weekly' | 'monthly';
type PlanType = 'seedling' | 'sprout' | 'tree';

interface SupportCardProps {
  amount: number;
  planType: PlanType;
  description: string;
  popular?: boolean;
  onSupport: (amount: number, planType: PlanType) => void;
  isProcessing: boolean;
  paymentMode: PaymentMode;
  currencySymbol?: string;
  isInternational?: boolean;
}

const SupportCard: React.FC<SupportCardProps> = ({ amount, planType, description, popular, onSupport, isProcessing, paymentMode, currencySymbol = '₹', isInternational = false }) => {
  const [displayAmount, setDisplayAmount] = React.useState(amount);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (displayAmount !== amount) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayAmount(amount);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [amount, displayAmount]);

  const planLabels: Record<PlanType, string> = {
    seedling: 'Seedling',
    sprout: 'Sprout',
    tree: 'Tree',
  };

  return (
    <div className={`border rounded-lg p-8 text-center transition-all duration-300 relative ${popular ? 'border-[var(--color-accent)] scale-105 bg-[var(--color-card-bg)]' : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-card-bg)] hover:border-[var(--color-text-secondary)]'}`}>
      {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-[var(--color-bg)] px-3 py-1 text-xs font-bold rounded-full uppercase">Most Popular</div>}
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">{planLabels[planType]}</p>
      <p className={`font-heading text-5xl font-extrabold text-[var(--color-text-primary)] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {currencySymbol}{displayAmount}
      </p>
      {paymentMode === 'subscribe' && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">per cycle (auto-debit)</p>
      )}
      <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{description}</p>
      <button
        onClick={() => onSupport(displayAmount, planType)}
        disabled={isProcessing}
        className={`mt-6 w-full px-6 py-3 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${popular ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]'}`}
      >
        {isProcessing ? 'Processing...' : isInternational ? 'Donate via Ko-fi' : paymentMode === 'subscribe' ? 'Subscribe' : 'Support Now'}
      </button>
    </div>
  );
};

const SupportPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('one-time');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isIndia, setIsIndia] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [locationDetected, setLocationDetected] = useState(false);
  
  const kofiUsername = process.env.NEXT_PUBLIC_KOFI_USERNAME || 'theopendraft';

  // Detect user location on mount
  useEffect(() => {
    async function detectLocation() {
      try {
        const location = await detectUserLocationClient();
        console.log('[Support Page] Location detected:', location);
        setIsIndia(location.isIndia);
        setCurrencySymbol(location.isIndia ? '₹' : '$');
        setLocationDetected(true);
        console.log('[Support Page] Currency set to:', location.isIndia ? 'INR (₹)' : 'USD ($)');
      } catch (error) {
        console.error('[Support Page] Failed to detect location:', error);
        setLocationDetected(true); // Continue with default (India)
      }
    }
    detectLocation();
  }, []);

  // Base amounts in INR and USD
  const oneTimeAmountsINR = { seedling: 99, sprout: 499, tree: 999 };
  const oneTimeAmountsUSD = { seedling: 5, sprout: 10, tree: 25 };
  const subscriptionAmountsINR: Record<BillingCycle, Record<PlanType, number>> = {
    weekly: { seedling: 29, sprout: 99, tree: 199 },
    monthly: { seedling: 79, sprout: 499, tree: 999 },
  };
  const subscriptionAmountsUSD: Record<BillingCycle, Record<PlanType, number>> = {
    weekly: { seedling: 3, sprout: 5, tree: 10 },
    monthly: { seedling: 5, sprout: 10, tree: 25 },
  };

  // Get base amounts based on location and payment mode
  const baseAmounts = paymentMode === 'one-time'
    ? (isIndia ? oneTimeAmountsINR : oneTimeAmountsUSD)
    : (isIndia ? subscriptionAmountsINR[billingCycle] : subscriptionAmountsUSD[billingCycle]);

  // Current amounts to display
  const currentAmounts = {
    seedling: baseAmounts.seedling,
    sprout: baseAmounts.sprout,
    tree: baseAmounts.tree,
  };

  // Handle one-time payment
  const handleOneTimePayment = async (amount: number, planType: PlanType) => {
    if (!user) {
      toast.error('Please sign in to make a donation.');
      return;
    }

    // Convert display amount back to INR for Razorpay (Razorpay only supports INR)
    const inrAmount = baseAmounts[planType];

    setIsProcessing(true);

    try {
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: inrAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            planType,
            userId: user.$id,
            userEmail: user.email,
            userName: user.name,
            displayAmount: amount,
            displayCurrency: isIndia ? 'INR' : 'USD',
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'The Open Draft',
        description: `One-time Support - ${currencySymbol}${amount}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        notes: {
          planType,
          userId: user.$id,
          userEmail: user.email,
          userName: user.name,
          displayAmount: amount,
          displayCurrency: isIndia ? 'INR' : 'USD',
        },
        theme: { color: '#A8A29E' },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) throw new Error('Payment verification failed');

            const verifyData = await verifyResponse.json();
            toast.success(`Thank you! Your donation of ${currencySymbol}${amount} was successful.`, { description: `Payment ID: ${verifyData.paymentId}` });
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment.');
      setIsProcessing(false);
    }
  };

  // Handle subscription payment
  const handleSubscription = async (amount: number, planType: PlanType) => {
    if (!user) {
      toast.error('Please sign in to subscribe.');
      return;
    }

    // Convert display amount back to INR for Razorpay
    const inrAmount = baseAmounts[planType];

    setIsProcessing(true);

    try {
      const subscriptionResponse = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          billingCycle,
          customerEmail: user.email || '',
          customerName: user.name || '',
          customerContact: user.phone || '',
          displayAmount: amount,
          displayCurrency: isIndia ? 'INR' : 'USD',
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const subscriptionData = await subscriptionResponse.json();

      const options = {
        key: subscriptionData.keyId,
        subscription_id: subscriptionData.subscriptionId,
        name: 'The Open Draft',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} Subscription - ${currencySymbol}${amount}/${billingCycle === 'weekly' ? 'week' : 'month'}`,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        notes: {
          planType,
          billingCycle,
          userId: user.$id,
          customerEmail: user.email || '',
          customerName: user.name || '',
          displayAmount: amount,
          displayCurrency: isIndia ? 'INR' : 'USD',
        },
        theme: { color: '#A8A29E' },
        handler: async function (response: any) {
          toast.success(`Subscription activated!`, { description: `Your ${billingCycle} support of ${currencySymbol}${amount} is now active. Thank you!` });
          setIsProcessing(false);
          // Redirect to dashboard
          window.location.href = '/app';
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription.');
      setIsProcessing(false);
    }
  };

  // Handle Ko-fi payment for international users
  const handleKofiPayment = (amount: number, planType: PlanType) => {
    const kofiUrl = `https://ko-fi.com/${kofiUsername}`;
    
    // Calculate popup window position (centered)
    const width = 480;
    const height = 700;
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;
    
    // Open Ko-fi in a popup window (feels more inline than a new tab)
    const popup = window.open(
      kofiUrl,
      'kofi_popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (popup) {
      popup.focus();
      toast.success('Ko-fi payment window opened', {
        description: `Complete your $${amount} donation in the popup window.`,
      });
    } else {
      // Popup blocked - fall back to new tab
      toast.info('Opening Ko-fi in a new tab...', {
        description: 'Please allow popups for a better experience.',
      });
      window.open(kofiUrl, '_blank');
    }
  };

  const handleSupport = (amount: number, planType: PlanType) => {
    // For international users (USD), use Ko-fi
    if (!isIndia) {
      handleKofiPayment(amount, planType);
      return;
    }

    // For Indian users (INR), use Razorpay
    if (!razorpayLoaded) {
      toast.warning('Payment gateway is loading. Please try again.');
      return;
    }

    if (paymentMode === 'one-time') {
      handleOneTimePayment(amount, planType);
    } else {
      handleSubscription(amount, planType);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error('Payment gateway failed to load. Please refresh.')}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Support the Initiative</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Your support is optional but deeply appreciated. Every contribution goes directly to providing food, shelter, and care. We keep things transparent, so you always know where your help is going.
            </p>
            {locationDetected && (
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                Prices shown in {isIndia ? 'Indian Rupees (₹)' : 'US Dollars ($)'}
              </p>
            )}
          </header>
        </AnimatedSection>

        {/* Payment Mode Toggle: One-time vs Subscribe (only for Indian users) */}
        {isIndia ? (
          <AnimatedSection>
            <div className="mt-10 max-w-md mx-auto relative p-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)]">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-text-primary)] rounded-full transition-all duration-500 ease-out"
                style={{ left: paymentMode === 'one-time' ? '4px' : 'calc(50%)' }}
              />
              <div className="relative flex">
                <button
                  onClick={() => setPaymentMode('one-time')}
                  disabled={isProcessing}
                  className={`w-1/2 py-3 text-sm font-medium rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${paymentMode === 'one-time' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  One-time Donation
                </button>
                <button
                  onClick={() => setPaymentMode('subscribe')}
                  disabled={isProcessing}
                  className={`w-1/2 py-3 text-sm font-medium rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${paymentMode === 'subscribe' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  Subscribe (Auto-pay)
                </button>
              </div>
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection>
            <div className="mt-10 max-w-md mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z"/>
                </svg>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Powered by Ko-fi</span>
              </div>
              <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                International payments are processed securely via Ko-fi (0% platform fee)
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* Billing Cycle Toggle (only for subscriptions) */}
        {paymentMode === 'subscribe' && (
          <AnimatedSection>
            <div className="mt-6 max-w-xs mx-auto relative p-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)]">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-accent)] rounded-full transition-all duration-500 ease-out"
                style={{ left: billingCycle === 'weekly' ? '4px' : 'calc(50%)' }}
              />
              <div className="relative flex">
                <button
                  onClick={() => setBillingCycle('weekly')}
                  disabled={isProcessing}
                  className={`w-1/2 py-2 text-xs font-medium rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${billingCycle === 'weekly' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  disabled={isProcessing}
                  className={`w-1/2 py-2 text-xs font-medium rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${billingCycle === 'monthly' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-3">
              GPay / UPI Autopay supported
            </p>
          </AnimatedSection>
        )}

        <AnimatedSection>
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <SupportCard
              amount={currentAmounts.seedling}
              planType="seedling"
              description="Feeds one animal for a week. A small act with a big impact."
              onSupport={handleSupport}
              isProcessing={isProcessing}
              paymentMode={isIndia ? paymentMode : 'one-time'}
              currencySymbol={currencySymbol}
              isInternational={!isIndia}
            />
            <SupportCard
              amount={currentAmounts.sprout}
              planType="sprout"
              description="Provides a week of food and basic medical supplies."
              popular
              onSupport={handleSupport}
              isProcessing={isProcessing}
              paymentMode={isIndia ? paymentMode : 'one-time'}
              currencySymbol={currencySymbol}
              isInternational={!isIndia}
            />
            <SupportCard
              amount={currentAmounts.tree}
              planType="tree"
              description="Contributes to a temporary shelter or a vet visit."
              onSupport={handleSupport}
              isProcessing={isProcessing}
              paymentMode={isIndia ? paymentMode : 'one-time'}
              currencySymbol={currencySymbol}
              isInternational={!isIndia}
            />
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Full Transparency</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              We believe you have the right to know how your support is used. All financials are documented and shared with our community of supporters. This is about trust, not transactions.
            </p>
            {paymentMode === 'subscribe' && (
              <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
                You can cancel your subscription anytime from your dashboard. No questions asked.
              </p>
            )}
          </div>
        </AnimatedSection>

        {loading && (
          <AnimatedSection>
            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
            </div>
          </AnimatedSection>
        )}

        {!loading && !user && isIndia && (
          <AnimatedSection>
            <div className="mt-8 text-center bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Please{' '}
                <Link href="/login?redirect=/support" className="text-[var(--color-text-primary)] font-medium hover:underline">
                  sign in
                </Link>{' '}
                to make a donation or subscribe. This helps us keep track of contributions and send you updates.
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SupportPage;
