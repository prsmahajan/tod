"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PayContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Get amount from URL params
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseFloat(amountParam) : 0;
  const isValidAmount = amount > 0;

  // Format amount for display
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handlePayment = async () => {
    if (!isValidAmount) {
      toast.error("Invalid amount");
      return;
    }

    if (!razorpayLoaded) {
      toast.warning("Payment gateway is loading. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: "USD",
          receipt: `pay_${Date.now()}`,
          notes: {
            type: "custom_payment",
            displayAmount: amount,
            displayCurrency: "USD",
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "The Open Draft",
        description: `Payment of ${formatAmount(amount)}`,
        order_id: orderData.orderId,
        theme: { color: "#A8A29E" },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) throw new Error("Payment verification failed");

            const verifyData = await verifyResponse.json();
            setPaymentSuccess(true);
            setPaymentId(verifyData.paymentId);
            toast.success(`Payment of ${formatAmount(amount)} was successful!`);
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment.");
      setIsProcessing(false);
    }
  };

  // Success state
  if (paymentSuccess) {
    return (
      <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32 min-h-screen flex items-center justify-center">
          <AnimatedSection>
            <div className="text-center max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
                Payment Successful
              </h1>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
                Thank you for your payment.
              </p>
              <div className="mt-8 p-6 border border-[var(--color-border)] rounded-lg bg-[var(--color-card-bg)]">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Amount Paid</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {formatAmount(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Payment ID</span>
                    <span className="font-mono text-xs text-[var(--color-text-primary)]">
                      {paymentId}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/"
                className="mt-8 inline-block px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </>
    );
  }

  // Invalid amount state
  if (!isValidAmount) {
    return (
      <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32 min-h-screen flex items-center justify-center">
          <AnimatedSection>
            <div className="text-center max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
                Invalid Payment Link
              </h1>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
                This payment link is missing a valid amount. Please contact the sender for a correct link.
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Expected format: <code className="bg-[var(--color-card-bg)] px-2 py-1 rounded">/pay?amount=100</code>
              </p>
              <Link
                href="/"
                className="mt-8 inline-block px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-[var(--color-card-bg)] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </>
    );
  }

  // Main payment page
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Payment gateway failed to load. Please refresh.")}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32 min-h-screen flex items-center justify-center">
        <AnimatedSection>
          <div className="text-center max-w-md mx-auto">
            <header>
              <p className="text-sm uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">
                Amount Due
              </p>
              <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">
                {formatAmount(amount)}
              </h1>
              <p className="mt-4 text-[var(--color-text-secondary)]">
                Click the button below to complete your payment securely via Razorpay.
              </p>
            </header>

            <div className="mt-10">
              <button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                className="w-full px-8 py-4 bg-[var(--color-text-primary)] text-[var(--color-bg)] font-medium text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : !razorpayLoaded ? (
                  "Loading..."
                ) : (
                  `Pay ${formatAmount(amount)}`
                )}
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </>
  );
};

const PayPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--color-text-primary)] border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-[var(--color-text-secondary)]">Loading...</p>
          </div>
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
};

export default PayPage;
