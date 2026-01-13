"use client";

import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';

const ContactPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Contact Us</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Have questions? We're here to help. Reach out to us anytime.
            </p>
          </header>
        </AnimatedSection>

        <div className="mt-16 max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Contact */}
              <div className="bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8 text-center">
                <svg className="h-12 w-12 text-[var(--color-accent)] mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  Email
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  For general inquiries, support, and feedback
                </p>
                <a
                  href="mailto:account@theopendraft.com"
                  className="text-[var(--color-accent)] hover:underline font-medium"
                >
                  account@theopendraft.com
                </a>
                <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
                  Response time: Within 24-48 hours
                </p>
              </div>

              {/* WhatsApp Contact */}
              <div className="bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8 text-center">
                <svg className="h-12 w-12 text-[var(--color-accent)] mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  For quick questions and urgent support
                </p>
                <a
                  href="https://wa.me/916307166266"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline font-medium"
                >
                  +91 6307166266
                </a>
                <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
                  WhatsApp only • Available 9 AM - 6 PM IST
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mt-16 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8">
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    What should I include in my email?
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Please include your name, email address, and a detailed description of your inquiry or issue. If relevant, include transaction IDs, account details, or any supporting documentation.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    How long does it take to get a response?
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    We typically respond to emails within 24-48 hours during business days. WhatsApp messages are usually answered within a few hours during our available hours (9 AM - 6 PM IST).
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Can I call you directly?
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    We currently only accept WhatsApp messages at the provided number. We do not have a dedicated phone support line. Please message us on WhatsApp or send an email.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    I have an issue with my donation. What should I do?
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    For donation-related inquiries, please email <a href="mailto:account@theopendraft.com" className="text-[var(--color-accent)] hover:underline">account@theopendraft.com</a> with your transaction ID, date, and a description of the issue. We'll investigate and respond as soon as possible.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                    Do you offer refunds?
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    No, all donations and subscriptions are non-refundable. Please review our <a href="/refund" className="text-[var(--color-accent)] hover:underline">Refund Policy</a> for more details.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mt-16 text-center bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] p-8">
              <svg className="h-16 w-16 text-[var(--color-accent)] mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <h3 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                Need Instant Help?
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Try our AI chatbot for quick answers to common questions. Click the chat icon at the bottom-right corner of any page.
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Our chatbot is available 24/7 and can help with general inquiries about our mission, donation process, and more.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mt-16 text-center">
              <p className="text-[var(--color-text-secondary)]">
                We appreciate your support and interest in our mission. Whether you have questions, suggestions, or just want to share a story, we'd love to hear from you.
              </p>
              <p className="mt-4 text-[var(--color-text-primary)] font-medium">
                Thank you for being part of our community! 🐾
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
