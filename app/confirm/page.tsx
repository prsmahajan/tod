"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetConfirmPage() {
  const router = useRouter();
  const q = useSearchParams();
  const token = q.get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setLoading(true);
    const pwd = String(new FormData(e.currentTarget).get("password"));

    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pwd }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not reset password");
    setOk(true);
    setTimeout(() => router.replace("/login"), 1500);
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input name="password" type="password" required placeholder="New password (≥8, 1 uppercase, 1 symbol)" className="w-full border p-2 rounded"/>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ok && <p className="text-green-700 text-sm">Password updated. Redirecting…</p>}
        <button disabled={loading} className="w-full border p-2 rounded bg-black text-white">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </main>
  );
}
