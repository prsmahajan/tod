"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');

    if (error === 'auth_error') {
      setErr("Authentication error. Please try logging in again. If the problem persists, check the deployment configuration.");
    } else if (callbackUrl) {
      setErr(`You must be logged in to access ${callbackUrl}`);
    }
  }, [searchParams]);

  async function checkEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const emailValue = String(fd.get("email") || "").trim();

    if (!emailValue) {
      setErr("Email is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErr(data.error || "Failed to check email");
        return;
      }

      setEmail(emailValue);
      setEmailExists(data.exists);
      setEmailChecked(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErr("Failed to check email. Please try again.");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const emailValue = email || String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    if (emailExists) {
      // Login flow
      const res = await signIn("credentials", { email: emailValue, password, redirect: false });

      if (res?.ok) {
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl) {
          router.replace(callbackUrl);
        } else {
          router.replace("/admin");
        }
      } else {
        setLoading(false);
        const errorMessage = res?.error || "Invalid email or password";
        setErr(errorMessage);
      }
    } else {
      // Signup flow
      const name = String(fd.get("name") || "");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailValue, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErr(data.error || "Signup failed");
        return;
      }

      const result = await signIn("credentials", { email: emailValue, password, redirect: false });

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl) {
          router.replace(callbackUrl);
        } else {
          router.replace("/admin");
        }
      } else {
        setLoading(false);
        setErr("Auto-login failed. Please log in manually.");
      }
    }
  }

  function handleBack() {
    setEmailChecked(false);
    setEmailExists(false);
    setEmail("");
    setErr(null);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-16">
      <div className="max-w-md w-full px-4">
        <h1 className="text-3xl font-semibold mb-8 text-black">
          {emailChecked ? (emailExists ? "Log in" : "Sign up") : "Enter your email"}
        </h1>
        
        {!emailChecked ? (
          <form className="space-y-6" onSubmit={checkEmail}>
            <div>
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                required 
                className="w-full border-b border-[#E5E5E5] px-0 py-3 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121]" 
              />
            </div>
            {err && <p className="text-[#DC2626] text-sm">{err}</p>}
            <button 
              disabled={loading} 
              className="w-full bg-black text-white py-3 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <input 
                type="email" 
                value={email}
                disabled
                className="w-full border-b border-[#E5E5E5] px-0 py-3 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] opacity-60 cursor-not-allowed" 
              />
            </div>
            
            {!emailExists && (
              <div>
                <input 
                  name="name" 
                  placeholder="Full Name" 
                  required 
                  className="w-full border-b border-[#E5E5E5] px-0 py-3 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121]" 
                />
              </div>
            )}
            
            <div>
              <input 
                name="password" 
                type="password" 
                placeholder={emailExists ? "Password" : "Password (≥8, 1 uppercase, 1 symbol)"} 
                required 
                className="w-full border-b border-[#E5E5E5] px-0 py-3 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121]" 
              />
            </div>
            
            {err && <p className="text-[#DC2626] text-sm">{err}</p>}
            
            <button 
              disabled={loading} 
              className="w-full bg-black text-white py-3 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading 
                ? (emailExists ? "Signing in..." : "Creating...") 
                : (emailExists ? "Log in" : "Sign up")
              }
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full text-sm text-[#212121] underline hover:opacity-70 transition-opacity"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-[#212121]">
          <Link href="/reset" className="underline hover:opacity-70 transition-opacity">
            Forgot your password?
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
