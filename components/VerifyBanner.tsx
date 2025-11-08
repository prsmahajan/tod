"use client";
import { useSession } from "next-auth/react";

export default function VerifyBanner() {
  const { data: session } = useSession();
  const verified = !!(session as any)?.emailVerified;

  if (verified) return null;
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-900 px-4 py-2 text-sm">
      Please verify your email to unlock all features. Check your inbox.
    </div>
  );
}
