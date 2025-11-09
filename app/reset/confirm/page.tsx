"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ResetConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation messages
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!password) {
      setValidationErrors([]);
      return;
    }

    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter");
    }
    if (!/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(password)) {
      errors.push("Password must include at least one symbol");
    }
    setValidationErrors(errors);
  }, [password]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (validationErrors.length > 0) {
      setError("Please fix password requirements");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold text-red-600">Invalid Reset Link</h1>
        <p className="mt-4">This password reset link is invalid or has expired.</p>
        <Link href="/reset" className="mt-4 inline-block text-blue-600 underline">
          Request a new reset link
        </Link>
      </main>
    );
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
        <h1 className="text-2xl font-semibold">Set New Password</h1>

        {success ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 font-semibold">Password reset successful!</p>
            <p className="text-sm text-green-600 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full border p-2 rounded"
              />
              {password && validationErrors.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {validationErrors.map((err, i) => (
                    <li key={i} className="text-red-600">• {err}</li>
                  ))}
                </ul>
              )}
              {password && validationErrors.length === 0 && (
                <p className="mt-2 text-xs text-green-600">✓ Password meets requirements</p>
              )}
            </div>

            <div>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full border p-2 rounded"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || validationErrors.length > 0 || password !== confirmPassword}
              className="w-full border p-2 rounded bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="underline text-blue-600 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
