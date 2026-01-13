"use client";

import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';

const TermsPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Terms & Conditions</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </header>
        </AnimatedSection>

        <div className="mt-12 max-w-4xl mx-auto space-y-8 text-[var(--color-text-secondary)]">
          <AnimatedSection>
            <p className="text-base leading-relaxed">
              Welcome to The Open Draft ("tod;", "we", "us", "our"). These Terms and Conditions ("Terms") govern your access to and use of our website theopendraft.com and all related services. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">1. Acceptance of Terms</h2>
            <p className="mt-4">
              By creating an account, making a donation, or using any part of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy and Refund Policy. If you are using our services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">2. Eligibility</h2>
            <p className="mt-4">
              You must be at least 13 years old to use our services. If you are between 13 and 18, you must have parental or guardian consent. By using our services, you represent and warrant that you meet these age requirements and have the legal capacity to enter into these Terms.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">3. User Accounts</h2>
            <p className="mt-4">When you create an account, you agree to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">4. Donations and Subscriptions</h2>
            <p className="mt-4"><strong className="text-[var(--color-text-primary)]">Voluntary Contributions:</strong> All donations and subscriptions are voluntary. We do not guarantee specific outcomes or results from your contributions.</p>
            <p className="mt-3"><strong className="text-[var(--color-text-primary)]">Non-Refundable:</strong> All donations and subscriptions are final and non-refundable. This policy is non-negotiable. By making a contribution, you acknowledge and accept that no refunds will be provided under any circumstances.</p>
            <p className="mt-3"><strong className="text-[var(--color-text-primary)]">Payment Processing:</strong> Payments are processed through third-party payment gateways (e.g., Razorpay). You agree to comply with their terms of service. We are not responsible for payment processing errors or delays caused by third-party services.</p>
            <p className="mt-3"><strong className="text-[var(--color-text-primary)]">Subscription Cancellation:</strong> You may cancel recurring subscriptions at any time through your account settings. Cancellation will take effect at the end of the current billing cycle. No refunds will be issued for partial periods.</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">5. Use of Services</h2>
            <p className="mt-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others, including intellectual property rights</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Engage in fraudulent, deceptive, or misleading activities</li>
              <li>Interfere with or disrupt the operation of our services</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts</li>
              <li>Use automated scripts, bots, or scrapers without permission</li>
              <li>Harass, threaten, or abuse other users or our staff</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">6. Intellectual Property</h2>
            <p className="mt-4">
              All content on our website, including text, graphics, logos, images, videos, software, and designs, is the property of The Open Draft or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written consent.
            </p>
            <p className="mt-3">
              You grant us a non-exclusive, worldwide, royalty-free license to use any content you submit or post on our platform (e.g., comments, feedback) for operational and promotional purposes.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">7. Disclaimers and Limitations of Liability</h2>
            <p className="mt-4">
              <strong className="text-[var(--color-text-primary)]">"AS IS" Basis:</strong> Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or secure.
            </p>
            <p className="mt-3">
              <strong className="text-[var(--color-text-primary)]">Limitation of Liability:</strong> To the maximum extent permitted by law, The Open Draft and its directors, employees, volunteers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of our services.
            </p>
            <p className="mt-3">
              In jurisdictions that do not allow the exclusion of certain warranties or limitations of liability, our liability shall be limited to the fullest extent permitted by law.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">8. Indemnification</h2>
            <p className="mt-4">
              You agree to indemnify, defend, and hold harmless The Open Draft and its affiliates from any claims, liabilities, damages, losses, costs, or expenses (including legal fees) arising from your use of our services, violation of these Terms, or infringement of any third-party rights.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">9. Termination</h2>
            <p className="mt-4">
              We reserve the right to suspend or terminate your access to our services at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use our services will immediately cease, and we may delete your account and data.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">10. Third-Party Links and Services</h2>
            <p className="mt-4">
              Our website may contain links to third-party websites or integrate third-party services. We are not responsible for the content, privacy practices, or terms of these third parties. Your interactions with them are governed by their respective terms and policies.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">11. Governing Law and Dispute Resolution</h2>
            <p className="mt-4">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in [Your City/State], India.
            </p>
            <p className="mt-3">
              We encourage you to contact us first to resolve any disputes informally. If informal resolution is not possible, you agree to resolve disputes through binding arbitration or small claims court, rather than class action lawsuits.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">12. Changes to Terms</h2>
            <p className="mt-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting an updated version on our website with a new "Last Updated" date. Your continued use of our services after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">13. Severability</h2>
            <p className="mt-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">14. Entire Agreement</h2>
            <p className="mt-4">
              These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and The Open Draft regarding your use of our services and supersede all prior agreements.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">15. Contact Us</h2>
            <p className="mt-4">
              If you have any questions or concerns about these Terms, please contact us at:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-[var(--color-text-primary)]">Email:</strong> <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a></p>
              <p><strong className="text-[var(--color-text-primary)]">WhatsApp:</strong> <a href="https://wa.me/916307166266" className="text-[var(--color-accent)] hover:underline">+91 6307166266</a></p>
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsPage;
