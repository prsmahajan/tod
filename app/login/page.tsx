"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for error in URL params
  useEffect(() => {
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');

    if (error === 'auth_error') {
      setErr("Authentication error. Please try logging in again. If the problem persists, check the deployment configuration.");
    } else if (callbackUrl) {
      setErr(`You must be logged in to access ${callbackUrl}`);
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    console.log('[LOGIN] Attempting login for:', email);

    const res = await signIn("credentials", { email, password, redirect: false });

    console.log('[LOGIN] Sign in result:', { ok: res?.ok, error: res?.error });

    if (res?.ok) {
      // Check if there's a callback URL
      const callbackUrl = searchParams.get('callbackUrl');

      console.log('[LOGIN] Login successful, redirecting to:', callbackUrl || '/admin');

      if (callbackUrl) {
        // Redirect to the callback URL
        router.replace(callbackUrl);
      } else {
        // Default redirect
        router.replace("/admin");
      }
    } else {
      setLoading(false);
      const errorMessage = res?.error || "Invalid email or password";
      console.error('[LOGIN] Login failed:', errorMessage);
      setErr(errorMessage);
    }
  }

  return (
    <main>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-2 rounded" />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button disabled={loading} className="w-full border p-2 rounded bg-black text-white">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          <Link href="/reset" className="underline text-blue-600">
            Forgot your password?
          </Link>
        </p>

        <p className="mt-6 text-sm text-gray-600">No account? Try signing up:{" "}
           <Link href="/signup" className={`underline text-blue-600 font-semibold`}>Sign up</Link>
        </p>
      </div>
    </main>
  );
}
