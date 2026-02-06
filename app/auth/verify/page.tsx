"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new one.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <AnimatedSection>
        <div className="w-full max-w-md text-center">
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-8">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
                <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Verifying...
                </h1>
                <p className="text-[var(--color-text-secondary)]">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Email Verified!
                </h1>
                <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Redirecting to login...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Verification Failed
                </h1>
                <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
