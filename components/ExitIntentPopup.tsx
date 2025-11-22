"use client";

import { useEffect, useState } from "react";
import { X, Heart, Mail } from "lucide-react";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    }, 5000); // Show after 5 seconds on page

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`🎉 Success! You're position #${data.position} on the waitlist! Check your email.`);
        setEmail("");
        setName("");
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setMessage("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Heart className="text-red-600 fill-current" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wait! Before you go...
          </h2>
          <p className="text-gray-600">
            Join our mission to feed stray animals while learning about technology!
          </p>
        </div>

        {/* Value proposition */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>In-depth tech articles (FREE)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Monthly impact reports with photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Help feed stray dogs, cats, cows & birds</span>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("Success")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              "Joining Waitlist..."
            ) : (
              <>
                <Mail size={20} />
                Join Waitlist (FREE)
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Unsubscribe anytime. We respect your privacy.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
