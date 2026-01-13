"use client";

import React, { useState, useEffect } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SupportCardProps {
  amount: number;
  description: string;
  popular?: boolean;
  onSupport: (amount: number) => void;
  isProcessing: boolean;
}

const SupportCard: React.FC<SupportCardProps> = ({ amount, description, popular, onSupport, isProcessing }) => {
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

  return (
    <div className={`border rounded-lg p-8 text-center transition-all duration-300 relative ${popular ? 'border-[var(--color-accent)] scale-105 bg-[var(--color-card-bg)]' : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-card-bg)] hover:border-[var(--color-text-secondary)]'}`}>
      {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-[var(--color-bg)] px-3 py-1 text-xs font-bold rounded-full uppercase">Most Popular</div>}
      <p className={`font-heading text-5xl font-extrabold text-[var(--color-text-primary)] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        ₹{displayAmount}
      </p>
      <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{description}</p>
      <button
        onClick={() => onSupport(displayAmount)}
        disabled={isProcessing}
        className={`mt-6 w-full px-6 py-3 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${popular ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]'}`}
      >
        {isProcessing ? 'Processing...' : 'Support Now'}
      </button>
    </div>
  );
};

const SupportPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [tier, setTier] = useState<'monthly' | 'quarterly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const amounts = tier === 'monthly'
    ? { basic: 29, popular: 99, premium: 199 }
    : { basic: 79, popular: 499, premium: 999 };

  const handlePayment = async (amount: number) => {
    if (!isLoaded) {
      alert('Please wait while we load your profile...');
      return;
    }

    if (!user) {
      alert('Please sign in to make a donation.');
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            tier: tier,
            userId: user.id,
            userEmail: user.emailAddresses[0]?.emailAddress || '',
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'The Open Draft',
        description: `${tier === 'monthly' ? 'Monthly' : 'Quarterly'} Support - ₹${amount}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.fullName || user.firstName || '',
          email: user.emailAddresses[0]?.emailAddress || '',
          contact: user.phoneNumbers[0]?.phoneNumber || '',
        },
        theme: {
          color: '#A8A29E', // Using your accent color
        },
        handler: async function (response: any) {
          // Step 3: Verify payment on server
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

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            // Payment successful
            alert(`Thank you for your support! Your payment of ₹${amount} has been received successfully. Payment ID: ${verifyData.paymentId}`);
            setIsProcessing(false);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support with your payment details.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            alert('Payment cancelled. You can try again anytime.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error('Failed to load Razorpay script');
          alert('Payment gateway failed to load. Please refresh the page.');
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Support the Initiative</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Your support is optional but deeply appreciated. Every contribution goes directly to providing food, shelter, and care. We keep things transparent, so you always know where your help is going.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mt-12 max-w-sm mx-auto relative p-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)]">
            {/* Animated background slider */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-text-primary)] rounded-full transition-all duration-500 ease-out"
              style={{
                left: tier === 'monthly' ? '4px' : 'calc(50% + 0px)',
                transform: tier === 'monthly' ? 'translateX(0)' : 'translateX(0)'
              }}
            />
            <div className="relative flex">
              <button
                onClick={() => setTier('monthly')}
                disabled={isProcessing}
                className={`w-1/2 py-2 text-sm rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${tier === 'monthly' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTier('quarterly')}
                disabled={isProcessing}
                className={`w-1/2 py-2 text-sm rounded-full transition-colors duration-500 z-10 cursor-pointer disabled:cursor-not-allowed ${tier === 'quarterly' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                Quarterly
              </button>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <SupportCard
              amount={amounts.basic}
              description={`Feeds one animal for a week. A small act with a big impact.`}
              onSupport={handlePayment}
              isProcessing={isProcessing}
            />
            <SupportCard
              amount={amounts.popular}
              description={`Provides a week of food and basic medical supplies.`}
              popular
              onSupport={handlePayment}
              isProcessing={isProcessing}
            />
            <SupportCard
              amount={amounts.premium}
              description={`Contributes to a temporary shelter or a vet visit.`}
              onSupport={handlePayment}
              isProcessing={isProcessing}
            />
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Full Transparency</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              We believe you have the right to know how your support is used. All financials are documented and shared with our community of supporters. This is about trust, not transactions.
            </p>
          </div>
        </AnimatedSection>

        {!isLoaded && (
          <AnimatedSection>
            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Loading payment gateway...</p>
            </div>
          </AnimatedSection>
        )}

        {isLoaded && !user && (
          <AnimatedSection>
            <div className="mt-8 text-center bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Please <strong className="text-[var(--color-text-primary)]">sign in</strong> to make a donation. This helps us keep track of contributions and send you updates on our impact.
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
