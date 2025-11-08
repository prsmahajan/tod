"use client";
import { useState } from "react";

export default function ResetRequestPage() {
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true); // Always show success (non-enumerating)
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      {sent ? (
        <p className="mt-4">If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full border p-2 rounded"/>
          <button className="w-full border p-2 rounded bg-black text-white">Send reset link</button>
        </form>
      )}
    </main>
  );
}
