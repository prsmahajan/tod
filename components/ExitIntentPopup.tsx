"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Icon from "./Icon";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem("exitIntentShown");
    if (hasSeenPopup) return;

    let hasShownPopup = false;

    function handleMouseLeave(e: MouseEvent) {
      // Only trigger if mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !hasShownPopup) {
        hasShownPopup = true;
        setIsVisible(true);
        localStorage.setItem("exitIntentShown", "true");
      }
    }

    // Add event listener after a short delay (give user time to read)
    const timeoutId = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Lock body scroll when popup is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome aboard!", {
          description: `You're #${data.position} on the waitlist. Check your email!`
        });
        setEmail("");
        setName("");
        setTimeout(() => setIsVisible(false), 1500);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsVisible(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl mb-5">
              <Icon name="logo" className="w-8 h-8 text-[var(--color-text-primary)]" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3">
              Wait, don't leave yet!
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Join our community and help feed stray animals while learning about technology.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
            <h3 className="font-medium text-[var(--color-text-primary)] mb-4 text-sm uppercase tracking-wide">
              What you'll get
            </h3>
            <div className="space-y-3">
              {[
                { icon: "articles", text: "In-depth tech articles (FREE)" },
                { icon: "heart", text: "Monthly impact reports with photos" },
                { icon: "users", text: "Help feed stray dogs, cats & more" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-text-secondary)] transition-colors"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-text-secondary)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Join Waitlist (FREE)
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-[var(--color-text-secondary)] text-center mt-5">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
