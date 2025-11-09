"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const { status } = useSession();
  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Signup failed");
      return;
    }

    // Auto-login with credentials
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.ok) {
      // Check if user is admin (first user becomes admin automatically)
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(session.user.role)) {
        // Redirect to quirky subdomain admin
        const protocol = window.location.protocol;
        const host = window.location.host.replace(/^(www\.|quirky\.)/, '');
        window.location.href = `${protocol}//quirky.${host}/admin`;
      } else {
        router.replace("/");
      }
    } else {
      setLoading(false);
      setError("Auto-login failed. Please log in manually.");
    }
  }

  return (
    <main>
      <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="name" placeholder="Name" required className="w-full border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password (≥8, 1 uppercase, 1 symbol)" required className="w-full border p-2 rounded" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full border p-2 rounded bg-black text-white">
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-gray-600 text-center">
        Already have an account? <Link href="/login" className={`underline text-blue-600 font-semibold`}>Log in</Link>
      </p>
      <p className="mt-4 text-xs text-gray-500 text-center">
        We’ve sent a verification link to your email. Some features may require verification.
      </p>
      </div>
    </main>
  );
}
