"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ResetRequestPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true); // Always show success (non-enumerating)
  }

  return (
    <main>
      <div className="m-3">
        <Link href="/" aria-label="Home" className="inline-flex items-center">
          <span className="place-items-center">
            <Image
              src="/images/logo-dark.png"
              alt="The Open Draft logo"
              className="rounded-xl"
              width={50}
              height={50}
              priority
            />
          </span>
        </Link>
      </div>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        {sent ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700">If an account exists for that email, a reset link has been sent.</p>
            </div>
            <p className="text-sm text-gray-600">Check your inbox and click the link to reset your password.</p>
            <Link href="/login" className="inline-block mt-4 text-blue-600 underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full border p-2 rounded"
              />
              <button
                disabled={loading}
                className="w-full border p-2 rounded bg-black text-white disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="underline text-blue-600 font-semibold">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
