"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MagicLinkCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        // First, verify the code is valid via API
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

        // Now sign in using NextAuth with magic link authentication
        const result = await signIn("credentials", {
          email,
          password: "__MAGIC_LINK__",
          redirect: false,
        });

        if (result?.ok) {
          router.replace(callbackUrl);
        } else {
          setError("Sign in failed. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Magic link sign in error:", err);
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    }

    completeSignIn();
  }, [router, searchParams]);

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
