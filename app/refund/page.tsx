"use client";

import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';

const RefundPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Refund Policy</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </header>
        </AnimatedSection>

        <div className="mt-12 max-w-4xl mx-auto space-y-8 text-[var(--color-text-secondary)]">
          <AnimatedSection>
            <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
              <p className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                Important Notice: No Refunds Policy
              </p>
              <p className="text-base leading-relaxed">
                All donations, subscriptions, and contributions made to The Open Draft ("tod;") are final and non-refundable. This policy is non-negotiable and applies to all transactions without exception.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">1. Policy Overview</h2>
            <p className="mt-4">
              By making a donation or subscribing to our services, you explicitly acknowledge and agree that:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>All payments are voluntary contributions toward our animal welfare mission</li>
              <li>All transactions are final upon successful payment processing</li>
              <li>No refunds will be issued under any circumstances</li>
              <li>This policy is clearly stated before each transaction</li>
              <li>You accept full responsibility for your contribution decision</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">2. Why We Have a No Refunds Policy</h2>
            <p className="mt-4">Our no-refunds policy exists for the following reasons:</p>
            <div className="mt-4 space-y-3">
              <p><strong className="text-[var(--color-text-primary)]">Direct Impact:</strong> Your contributions are immediately allocated to feeding, sheltering, and caring for animals. Once funds are deployed for animal welfare, they cannot be recalled.</p>
              <p><strong className="text-[var(--color-text-primary)]">Operational Efficiency:</strong> Processing refunds would divert resources away from our core mission and reduce the funds available for animal care.</p>
              <p><strong className="text-[var(--color-text-primary)]">Transparency and Trust:</strong> We maintain complete transparency about fund usage. All contributions are tracked and documented, ensuring your money directly benefits animals.</p>
              <p><strong className="text-[var(--color-text-primary)]">Voluntary Nature:</strong> All contributions are voluntary. We do not sell products or services that would warrant a refund policy.</p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">3. Payment Processing Errors</h2>
            <p className="mt-4">
              In the rare event of a technical error where you are charged multiple times for a single transaction, or charged an incorrect amount due to a system malfunction, please contact us immediately at <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a> with proof of the error (e.g., bank statement, transaction receipt).
            </p>
            <p className="mt-3">
              We will investigate genuine technical errors on a case-by-case basis. However, refunds will only be considered for verified system errors, not for changes of mind or buyer's remorse.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">4. Subscription Cancellations</h2>
            <p className="mt-4">
              If you have a recurring subscription, you may cancel it at any time through your account settings or by contacting us. Cancellation will take effect at the end of the current billing cycle.
            </p>
            <p className="mt-3">
              <strong className="text-[var(--color-text-primary)]">Important:</strong> Canceling a subscription does not entitle you to a refund for the current or any previous billing period. You will continue to have access to subscription benefits until the end of the paid period.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">5. Fraudulent Transactions</h2>
            <p className="mt-4">
              If you believe your payment method was used fraudulently (e.g., unauthorized transaction by a third party), you should:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Contact your bank or payment provider immediately to report the fraud</li>
              <li>Notify us at <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a> with details of the fraudulent transaction</li>
              <li>Provide any documentation requested by us or your payment provider</li>
            </ul>
            <p className="mt-3">
              We will cooperate with fraud investigations and may issue a refund if fraud is verified by appropriate authorities. However, this is at our sole discretion and subject to legal requirements.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">6. Chargebacks</h2>
            <p className="mt-4">
              Filing a chargeback without first attempting to resolve the issue with us may result in immediate suspension or termination of your account. Repeated chargebacks may result in permanent banning from our services.
            </p>
            <p className="mt-3">
              We encourage you to contact us directly to address any concerns before initiating a chargeback with your financial institution.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">7. Exceptions</h2>
            <p className="mt-4">
              This no-refunds policy applies universally. There are no exceptions except for:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Verified technical errors resulting in duplicate or incorrect charges</li>
              <li>Fraudulent transactions confirmed by law enforcement or payment authorities</li>
              <li>Legal requirements mandated by applicable consumer protection laws in your jurisdiction</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">8. Contact Us</h2>
            <p className="mt-4">
              If you have questions about this Refund Policy or believe you have encountered a legitimate technical error, please contact us:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-[var(--color-text-primary)]">Email:</strong> <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a></p>
              <p><strong className="text-[var(--color-text-primary)]">WhatsApp:</strong> <a href="https://wa.me/916307166266" className="text-[var(--color-accent)] hover:underline">+91 6307166266</a> (WhatsApp only)</p>
            </div>
            <p className="mt-4 text-sm">
              Please include your transaction ID, date of transaction, and a clear description of the issue. We will respond within 48-72 hours.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-6 mt-8">
              <p className="text-base leading-relaxed">
                <strong className="text-[var(--color-text-primary)]">Final Note:</strong> By proceeding with any payment on theopendraft.com, you explicitly acknowledge that you have read, understood, and agree to this No Refunds Policy. If you do not agree with this policy, please do not make any contributions.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RefundPage;
