"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleUnsubscribe() {
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link. Please check your email and try again.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setStatus("success");
      setMessage(data.message || "You have been successfully unsubscribed from our newsletter.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Mail size={32} className="text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe from Newsletter</h1>
          {email && (
            <p className="text-gray-600">
              Email: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        {status === "idle" && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              We're sorry to see you go. Click the button below to unsubscribe from our newsletter.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Confirm Unsubscribe
            </button>
            <Link
              href="/"
              className="block text-center text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Never mind, take me back
            </Link>
          </div>
        )}

        {status === "loading" && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Processing your request...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Unsubscribed</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm text-gray-600">Changed your mind?</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <XCircle size={32} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <button
                onClick={() => setStatus("idle")}
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition mr-2"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            If you continue to receive emails after unsubscribing, please contact us at{" "}
            <a href="mailto:hello@theopendraft.com" className="text-blue-600 hover:underline">
              hello@theopendraft.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading unsubscribe page...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
