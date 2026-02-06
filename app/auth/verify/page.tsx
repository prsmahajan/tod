"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Account, Client } from 'appwrite';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const account = new Account(client);

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new one.');
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/app');
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
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Verifying Email
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
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Redirecting to your dashboard...
                </p>
                <Link
                  href="/app"
                  className="mt-4 inline-block px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Link>
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
                <div className="space-y-3">
                  <Link
                    href="/app"
                    className="block px-6 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Go to Dashboard
                  </Link>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You can request a new verification email from your dashboard.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
