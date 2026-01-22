"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/appwrite/auth";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [email, setEmail] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Reset state when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setEmailChecked(false);
      setEmailExists(false);
      setEmail("");
      setTempEmail("");
      setErr(null);
      setMagicLinkSent(false);
    }
    setOpen(newOpen);
  };

  // Email validation function
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function checkEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const emailValue = tempEmail.trim();

    if (!emailValue) {
      setErr("Email is required");
      setLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmail(emailValue)) {
      setErr("Please enter a valid email address");
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

  async function sendMagicLink() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErr(data.error || "Failed to send magic link");
        return;
      }

      setMagicLinkSent(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErr("Failed to send magic link. Please try again.");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const emailValue = email || String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    try {
      if (emailExists) {
        // Login flow
        await login(emailValue, password);
        handleOpenChange(false);
        router.refresh();
      } else {
        // Signup flow
        const name = String(fd.get("name") || "");
        await signup(emailValue, password, name);
        handleOpenChange(false);
        router.refresh();
      }
    } catch (error: any) {
      setLoading(false);
      setErr(error.message || (emailExists ? "Invalid email or password" : "Signup failed"));
    }
  }

  function handleBack() {
    setEmailChecked(false);
    setEmailExists(false);
    setEmail("");
    setTempEmail("");
    setErr(null);
    setMagicLinkSent(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-white" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-black">
            {magicLinkSent 
              ? "Check your email" 
              : emailChecked 
                ? (emailExists ? "Log in" : "Sign up") 
                : "Enter your email"
            }
          </h3>
          
          {magicLinkSent ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in. The link expires in 15 minutes.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="w-full text-xs text-[#212121] underline hover:opacity-70 transition-opacity"
              >
                Use a different method
              </button>
            </div>
          ) : !emailChecked ? (
            <form className="space-y-3" onSubmit={checkEmail}>
              <div>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] text-sm" 
                />
              </div>
              {err && <p className="text-[#DC2626] text-xs">{err}</p>}
              <button 
                disabled={loading} 
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          ) : emailExists ? (
            <div className="space-y-3">
              <div>
                <input 
                  type="email" 
                  value={email || ""}
                  disabled
                  className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] opacity-60 cursor-not-allowed text-sm" 
                />
              </div>
              
              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>

              <div className="relative flex items-center my-3">
                <div className="flex-grow border-t border-[#E5E5E5]"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                <div className="flex-grow border-t border-[#E5E5E5]"></div>
              </div>

              <form className="space-y-3" onSubmit={onSubmit}>
                <div>
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="Password" 
                    required 
                    className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] text-sm" 
                  />
                </div>
                
                {err && <p className="text-[#DC2626] text-xs">{err}</p>}
                
                <button 
                  disabled={loading} 
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </form>
              
              <button
                type="button"
                onClick={handleBack}
                className="w-full text-xs text-[#212121] underline hover:opacity-70 transition-opacity"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <input 
                  type="email" 
                  value={email || ""}
                  disabled
                  className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] opacity-60 cursor-not-allowed text-sm" 
                />
              </div>
              
              <div>
                <input 
                  name="name" 
                  placeholder="Full Name" 
                  required 
                  className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] text-sm" 
                />
              </div>
              
              <div>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password (≥8, 1 uppercase, 1 symbol)" 
                  required 
                  className="w-full border-b border-[#E5E5E5] px-0 py-2 bg-transparent focus:outline-none focus:border-[#212121] text-[#212121] text-sm" 
                />
              </div>
              
              {err && <p className="text-[#DC2626] text-xs">{err}</p>}
              
              <button 
                disabled={loading} 
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Creating..." : "Sign up"}
              </button>
              
              <button
                type="button"
                onClick={handleBack}
                className="w-full text-xs text-[#212121] underline hover:opacity-70 transition-opacity"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="text-xs text-[#212121] pt-1">
            <Link href="/reset" className="underline hover:opacity-70 transition-opacity">
              Forgot your password?
            </Link>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
