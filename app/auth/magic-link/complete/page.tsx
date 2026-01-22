"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/appwrite/auth";

export default function MagicLinkCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function completeSignIn() {
      const verifyCode = searchParams.get("verify");
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      if (!verifyCode) {
        setError("Missing verification code");
        setLoading(false);
        return;
      }

      try {
        // Verify the code and get email
        const verifyRes = await fetch("/api/auth/magic-link/check-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verifyCode }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.ok) {
          setError(verifyData.error || "Invalid or expired verification code");
          setLoading(false);
          return;
        }

        const email = verifyData.email;

        // Appwrite requires password for email/password authentication
        // Since magic links don't provide a password, we'll redirect to login
        // with the email pre-filled so the user can enter their password
        router.replace(`/login?email=${encodeURIComponent(email)}&magicLinkVerified=true`);
      } catch (err) {
        console.error("Magic link sign in error:", err);
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    }

    completeSignIn();
  }, [router, searchParams, refreshUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 underline">
            Go to login page
          </a>
        </div>
      </div>
    );
  }

  return null;
}
