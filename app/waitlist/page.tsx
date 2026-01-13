"use client";

import { useState, useEffect, Suspense } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function WaitlistPageContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    city: "",
    referredBy: refCode || "",
  });

  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({ ...prev, referredBy: refCode }));
    }
  }, [refCode]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          city: formData.city || undefined,
          referredBy: formData.referredBy || undefined,
          source: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to join waitlist" });
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: `Success! You're position #${data.position} on the waitlist!`
      });
      setPosition(data.position);
      setReferralCode(data.referralCode);
      setFormData({ email: "", name: "", city: "", referredBy: "" });
      setLoading(false);
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
      setLoading(false);
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-24">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">Join The Waitlist</h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Be among the first 1,000 members of our community. Every person who joins brings us closer to launching our mission of feeding animals while sharing knowledge.
            </p>
          </header>
        </AnimatedSection>

        {/* Benefits Section */}
        <AnimatedSection>
          <div className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)]">
              <svg className="h-12 w-12 text-[var(--color-accent)] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">First Access</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Be the first to join when we launch. No waiting in line, immediate access to all features.
              </p>
            </div>

            <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)]">
              <svg className="h-12 w-12 text-[var(--color-accent)] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Founding Member</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Get a special badge recognizing you as an early supporter who helped make this possible.
              </p>
            </div>

            <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)]">
              <svg className="h-12 w-12 text-[var(--color-accent)] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Launch Faster</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Every person you refer brings us closer to 1,000 members, meaning we can start feeding sooner.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Form Section */}
        <AnimatedSection>
          <div className="mt-20 max-w-2xl mx-auto">
            {message && message.type === "success" && position && referralCode ? (
              <div className="bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8 text-center">
                <svg className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <h2 className="font-heading text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
                  You're In!
                </h2>
                <div className="bg-[var(--color-bg)] rounded-lg p-6 mb-6 border border-[var(--color-border)]">
                  <p className="text-5xl font-bold text-[var(--color-accent)] mb-2">
                    #{position}
                  </p>
                  <p className="text-xl text-[var(--color-text-secondary)]">
                    You're Member #{position.toLocaleString()}
                  </p>
                </div>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  Check your email for your welcome message and dashboard link.
                </p>
                <Link href={`/waitlist-dashboard?code=${referralCode}`}>
                  <button className="px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    View Your Dashboard →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8">
                <h2 className="font-heading text-2xl font-bold mb-6 text-center text-[var(--color-text-primary)]">
                  Join the Waitlist
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                      Name (Optional)
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                      City (Optional)
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="referredBy" className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                      Who told you about us? (Optional)
                    </label>
                    <input
                      id="referredBy"
                      type="text"
                      placeholder="Friend's name or email"
                      value={formData.referredBy}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Joining Waitlist..." : "Join Waitlist"}
                  </button>
                </form>
              </div>
            )}

            {/* Trust Indicator */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Your information is safe with us. We'll only use it to notify you when we launch.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection>
          <div className="mt-20 max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] p-8 text-center">
            <svg className="h-16 w-16 text-[var(--color-accent)] mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <h2 className="font-heading text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
              Help Us Reach 1,000 Faster
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              The more people join, the sooner we can start feeding animals. Share this page with friends who care about tech and compassion.
            </p>
            <Link href="/mission">
              <button className="px-6 py-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] transition-colors cursor-pointer">
                Learn About Our Mission →
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    }>
      <WaitlistPageContent />
    </Suspense>
  );
}
