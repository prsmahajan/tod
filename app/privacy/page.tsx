"use client";

import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Privacy Policy</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </header>
        </AnimatedSection>

        <div className="mt-12 max-w-4xl mx-auto space-y-8 text-[var(--color-text-secondary)]">
          <AnimatedSection>
            <p className="text-base leading-relaxed">
              At The Open Draft ("tod;", "we", "us", "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website theopendraft.com or use our services.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">1. Information We Collect</h2>
            <div className="mt-4 space-y-3">
              <p><strong className="text-[var(--color-text-primary)]">Personal Information:</strong> When you create an account, subscribe, or make a donation, we collect information such as your name, email address, phone number, city, and payment details.</p>
              <p><strong className="text-[var(--color-text-primary)]">Usage Data:</strong> We automatically collect information about your device, browser type, IP address, pages visited, time spent on pages, and referring URLs.</p>
              <p><strong className="text-[var(--color-text-primary)]">Cookies and Tracking:</strong> We use cookies and similar technologies to enhance user experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.</p>
              <p><strong className="text-[var(--color-text-primary)]">Communication Data:</strong> If you contact us via email, WhatsApp, or our chatbot, we collect the content of your messages and associated metadata.</p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">2. How We Use Your Information</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              <li>To provide, maintain, and improve our services</li>
              <li>To process donations and subscriptions</li>
              <li>To send you updates about our mission and impact (you can opt-out anytime)</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              <li>To personalize your experience and deliver relevant content</li>
              <li>To comply with legal obligations and enforce our terms</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">3. Data Sharing and Disclosure</h2>
            <p className="mt-4">We do not sell your personal information. We may share your data only in the following circumstances:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-[var(--color-text-primary)]">Service Providers:</strong> We share data with trusted third-party services (e.g., payment processors, email services, analytics providers) who assist in operating our platform. These providers are contractually bound to protect your data.</li>
              <li><strong className="text-[var(--color-text-primary)]">Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation, or to protect our rights and safety.</li>
              <li><strong className="text-[var(--color-text-primary)]">Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your data may be transferred to the new entity.</li>
              <li><strong className="text-[var(--color-text-primary)]">With Your Consent:</strong> We may share data for other purposes with your explicit consent.</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">4. Data Security</h2>
            <p className="mt-4">
              We implement industry-standard security measures to protect your personal information, including encryption (SSL/TLS), secure servers, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security. We regularly review and update our security practices to address emerging threats.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">5. Data Retention</h2>
            <p className="mt-4">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">6. Your Rights and Choices</h2>
            <p className="mt-4">Depending on your location, you may have the following rights:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-[var(--color-text-primary)]">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-[var(--color-text-primary)]">Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong className="text-[var(--color-text-primary)]">Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
              <li><strong className="text-[var(--color-text-primary)]">Portability:</strong> Request your data in a structured, machine-readable format</li>
              <li><strong className="text-[var(--color-text-primary)]">Opt-Out:</strong> Unsubscribe from marketing emails or withdraw consent for certain data processing</li>
              <li><strong className="text-[var(--color-text-primary)]">Object:</strong> Object to processing of your data for specific purposes</li>
            </ul>
            <p className="mt-3">To exercise these rights, please contact us at <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a></p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">7. Third-Party Services</h2>
            <p className="mt-4">
              Our website may contain links to third-party websites or integrate third-party services (e.g., Google Analytics, Clerk authentication, Razorpay payments). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">8. Children's Privacy</h2>
            <p className="mt-4">
              Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will take steps to delete it promptly.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">9. International Data Transfers</h2>
            <p className="mt-4">
              Your data may be transferred to and processed in countries outside of India. We ensure that appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">10. Changes to This Policy</h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our website with a new "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">11. Contact Us</h2>
            <p className="mt-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
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

export default PrivacyPage;
