"use client";
import { useAuth } from "@/lib/appwrite/auth";

export default function VerifyBanner() {
  const { user } = useAuth();
  const verified = user?.emailVerification || false;

  if (verified) return null;
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-900 px-4 py-2 text-sm">
      Please verify your email to unlock all features. Check your inbox.
    </div>
  );
}
