// app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export function SignupPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // If already logged in, go home
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
        const email = String(fd.get("email"));
        const password = String(fd.get("password"));

        // Create account
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            // Will show: "An account with this email already exists." (409),
            // or a validation message (400), etc.
            setError(data.error || "Signup failed");
            setLoading(false);
            return;
        }


        // Auto-login with credentials; land on home page
        const login = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/",
        });

        // If for some reason redirect didn't happen, fallback:
        if ((login as any)?.error) {
            setLoading(false);
            setError("Auto-login failed. Please log in.");
        }
    }

    if (status === "loading") return <main className="p-6">Loading…</main>;

    return (
        <main className="max-w-md mx-auto p-6">
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
                Already have an account? <a className="underline text-blue-600" href="/login">Log in</a>
            </p>
        </main>
    );
}

export default SignupPage