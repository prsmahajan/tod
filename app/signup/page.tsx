"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // ✅ Redirect logged-in users away from signup
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email"));
        const password = String(fd.get("password"));
        const name = String(fd.get("name") || "");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error || "Signup failed");
            return;
        }

        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => router.replace("/login"), 1500);
    }

    // ✅ While checking session
    if (status === "loading") {
        return (
            <main className="flex items-center justify-center h-screen">
                <p>Checking session...</p>
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
                <h1 className="text-3xl font-semibold text-center mb-4">
                    Create your account
                </h1>

                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        name="name"
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password (min 8 chars)"
                        required
                        className="w-full border p-2 rounded"
                    />

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && (
                        <p className="text-green-600 text-sm">
                            Account created successfully! Redirecting to login...
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full border p-2 rounded bg-black text-white hover:bg-gray-900 transition"
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 underline">
                        Log in
                    </a>
                </p>
            </div>
        </main>
    );
}
