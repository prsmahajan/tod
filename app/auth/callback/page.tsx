"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Account, Client } from 'appwrite';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Initialize Appwrite client
        const client = new Client();
        client
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

        const account = new Account(client);

        // Check if user is logged in after OAuth
        const user = await account.get();

        if (user) {
          // Cache the user data for instant loading
          localStorage.setItem('tod_auth_user', JSON.stringify(user));
          localStorage.setItem('tod_auth_expiry', String(Date.now() + 5 * 60 * 1000));

          // Check if user has admin/editor/author role
          try {
            const roleRes = await fetch(`/api/auth/check-role?email=${encodeURIComponent(user.email)}`);
            const roleData = await roleRes.json();

            if (roleRes.ok && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(roleData.role)) {
              // Admin users go to /admin
              localStorage.removeItem('authRedirect');
              router.push('/admin');
              return;
            }
          } catch (e) {
            // If role check fails, continue with normal redirect
          }

          // Get redirect URL from localStorage or default to /app
          const redirect = localStorage.getItem('authRedirect') || '/app';
          localStorage.removeItem('authRedirect');

          // Use Next.js router for client-side navigation
          router.push(redirect);
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        // Redirect to login with error after delay
        setTimeout(() => {
          router.push('/login?error=oauth_failed');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="4"
            />
            {/* Animated arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="70 200"
              className="animate-spin origin-center"
              style={{
                animationDuration: '1s',
                transformOrigin: '50px 50px'
              }}
            />
          </svg>

          {/* Center pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-[var(--color-text-primary)] animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-lg font-medium text-[var(--color-text-primary)]">
            Completing sign in
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
