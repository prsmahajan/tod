"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.ok) router.replace("/dashboard");
    else setErr("Invalid email or password");
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
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-2 rounded" />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button disabled={loading} className="w-full border p-2 rounded bg-black text-white">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">No account? Try signing up:{" "}
          <a href="/signup" className="text-blue-600 underline font-bold">Sign up</a>
        </p>
      </div>
    </main>
  );
}

function SignupForm() {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
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

    setLoading(false);
    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Signup failed");
    setOk(true);
  }

  return (
    <form className="mt-3 space-y-3" onSubmit={onSignup}>
      <input name="name" placeholder="Name (optional)" className="w-full border p-2 rounded" />
      <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
      <input name="password" type="password" placeholder="Password (min 8 chars)" required className="w-full border p-2 rounded" />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {ok && <p className="text-green-700 text-sm">Account created. Now log in above.</p>}
      <button disabled={loading} className="w-full border p-2 rounded">
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
