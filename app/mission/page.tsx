"use client";

import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import Footer from '@/components/Footer';

const MissionPage: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-24">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Our Mission</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Simple, direct action for animals in need. We exist to bridge the gap between human compassion and street-level reality.
            </p>
          </header>
        </AnimatedSection>

        <div className="mt-20 max-w-4xl mx-auto space-y-12">
          <AnimatedSection>
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">Why We Exist</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                Stray animals are often invisible. They face hunger, illness, and cruelty with no one to turn to. While large organizations do important work, there's a gap in immediate, localized care. The Open Draft was started to fill that gap. We are not an NGO; we are a network of individuals who believe that small, collective actions can create a safety net for the most vulnerable animals among us. Our purpose is to make compassion practical.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">How It Works</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                Our model is built on transparency and community. Here's the process:
              </p>
              <ul className="mt-6 space-y-4 list-decimal list-inside text-[var(--color-text-secondary)]">
                <li>
                  <strong className="text-[var(--color-text-primary)]">Identify Needs: </strong>
                  Community members report areas with stray animals in need of food, water, or medical attention.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Pool Resources: </strong>
                  Supporters contribute funds or supplies. Every contribution, no matter how small, is tracked and allocated to a specific, verified need.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Local Action: </strong>
                  Volunteers on the ground use the pooled resources to provide food, build shelters, or arrange for veterinary care.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Report Back: </strong>
                  Updates and photos are shared directly on our platform, showing supporters the exact impact of their contribution. No ambiguity, just clear results.
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">How You Can Support</h2>
              <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                Support comes in many forms. You can contribute financially through our <a href="/support" className="text-[var(--color-accent)] hover:text-[var(--color-text-primary)] font-medium underline transition-colors">Support page</a>, volunteer your time if you're in an active area, or simply help by spreading the word. The goal is to build a self-sustaining community where everyone can play a part in a way that feels right for them.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MissionPage;
