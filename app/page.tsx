"use client";

import React from "react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useTypeText } from "@/hooks/useTypeText";

export default function HomePage() {
  const animatedText = useTypeText(["Technology", "Compassion", "Community", "Action"], 1500, 100);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        {/* Hero Section */}
        <AnimatedSection>
          <header className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">
              Learn <span className="text-[var(--color-accent)]">{animatedText}</span>
            </h1>
            <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)] mt-2">
              Feed Animals
            </h2>
            <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed">
              A platform where technology education meets animal welfare. Every article you read, every subscription you make, directly contributes to feeding stray animals across India.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/impact">
                <button className="px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer">
                  See Our Impact
                </button>
              </Link>
              <Link href="/articles">
                <button className="px-8 py-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full font-medium hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] transition-colors cursor-pointer">
                  Read Articles
                </button>
              </Link>
            </div>
          </header>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection className="mt-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-center text-[var(--color-text-primary)] mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)] text-center">
                <div className="w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[var(--color-bg)]">1</span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-[var(--color-text-primary)]">Read & Learn</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Browse our collection of technology articles explained in simple, clear language. No jargon, just knowledge.
                </p>
              </div>

              <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)] text-center">
                <div className="w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[var(--color-bg)]">2</span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-[var(--color-text-primary)]">Subscribe</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Support our mission with a small monthly contribution. Every rupee is tracked transparently and goes directly to feeding animals.
                </p>
              </div>

              <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)] text-center">
                <div className="w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[var(--color-bg)]">3</span>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-[var(--color-text-primary)]">Make Impact</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Watch as your contribution feeds hungry animals. Get updates on the direct impact your support creates every single day.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Why We Exist Section */}
        <AnimatedSection className="mt-32">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-6">
                  Why We Exist
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  Technology should be accessible to everyone, not hidden behind complex terminology. At the same time, millions of stray animals across India struggle daily for food and basic care.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  We believe these two problems can solve each other. By making tech education simple and approachable, we create a sustainable way to fund animal welfare—one article, one meal at a time.
                </p>
                <Link href="/mission">
                  <button className="px-6 py-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] transition-colors cursor-pointer">
                    Read Our Full Mission →
                  </button>
                </Link>
              </div>
              <div className="bg-[var(--color-card-bg)] p-8 rounded-lg border border-[var(--color-border)]">
                <svg className="h-48 w-full text-[var(--color-accent)]" viewBox="0 0 200 200" fill="currentColor">
                  <circle cx="100" cy="100" r="80" opacity="0.1" />
                  <path d="M100 40 L120 80 L160 85 L130 115 L138 155 L100 135 L62 155 L70 115 L40 85 L80 80 Z" opacity="0.3" />
                  <circle cx="100" cy="100" r="50" opacity="0.2" />
                  <path d="M100 60 L110 90 L140 95 L120 115 L125 145 L100 130 L75 145 L80 115 L60 95 L90 90 Z" />
                </svg>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Transparency Section */}
        <AnimatedSection className="mt-32">
          <div className="max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8">
            <h2 className="font-heading text-3xl font-extrabold text-center text-[var(--color-text-primary)] mb-6">
              Full Transparency
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8">
              We believe you have the right to know exactly where every rupee goes. Here's our commitment:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">85%</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Directly to animal food & care</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">10%</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Platform operations</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">5%</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Payment processing</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="mt-32">
          <div className="max-w-4xl mx-auto text-center bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-12">
            <svg className="h-16 w-16 text-[var(--color-accent)] mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8">
              Join our community of learners and animal lovers. Start reading, start helping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/waitlist">
                <button className="px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer">
                  Join the Waitlist
                </button>
              </Link>
              <Link href="/support">
                <button className="px-8 py-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full font-medium hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] transition-colors cursor-pointer">
                  Support Now
                </button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </>
  );
}
