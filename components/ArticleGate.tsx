"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

const FREE_ARTICLE_LIMIT = 3;
const STORAGE_KEY = 'open-draft-article-reads';

interface ArticleRead {
  slug: string;
  timestamp: number;
}

interface ReadData {
  month: string; // Format: "2024-01"
  reads: ArticleRead[];
}

interface ArticleGateProps {
  articleSlug: string;
  articleTitle: string;
  children: React.ReactNode;
  preview?: React.ReactNode; // First part of article to show as preview
}

export default function ArticleGate({ 
  articleSlug, 
  articleTitle,
  children,
  preview 
}: ArticleGateProps) {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  const [remainingReads, setRemainingReads] = useState(FREE_ARTICLE_LIMIT);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      // Wait for auth to load
      if (authLoading) return;

      // If user is logged in, check if they have an active subscription
      if (user?.email) {
        try {
          const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SUBSCRIPTIONS,
            [
              Query.equal('userEmail', user.email),
              Query.equal('status', 'active'),
              Query.limit(1),
            ]
          );
          
          if (res.documents.length > 0) {
            setIsSubscriber(true);
            setHasAccess(true);
            setLoading(false);
            // Record the read but don't count against limit
            recordRead(articleSlug);
            return;
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }

      // For non-subscribers, check localStorage
      const currentMonth = getCurrentMonth();
      const data = getStoredData();
      
      // Reset if it's a new month
      if (data.month !== currentMonth) {
        resetReads();
        recordRead(articleSlug);
        setRemainingReads(FREE_ARTICLE_LIMIT - 1);
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Check if this article was already read this month
      const alreadyRead = data.reads.some(r => r.slug === articleSlug);
      const uniqueReads = new Set(data.reads.map(r => r.slug)).size;
      
      if (alreadyRead) {
        // Already read this article, allow access
        setHasAccess(true);
        setRemainingReads(Math.max(0, FREE_ARTICLE_LIMIT - uniqueReads));
      } else if (uniqueReads < FREE_ARTICLE_LIMIT) {
        // Still have free reads left
        recordRead(articleSlug);
        setHasAccess(true);
        setRemainingReads(FREE_ARTICLE_LIMIT - uniqueReads - 1);
      } else {
        // No more free reads
        setHasAccess(false);
        setRemainingReads(0);
      }
      
      setLoading(false);
    }

    checkAccess();
  }, [user, authLoading, articleSlug]);

  if (loading || authLoading) {
    return <>{children}</>;
  }

  // Subscribers always have access
  if (isSubscriber) {
    return <>{children}</>;
  }

  // Non-subscribers with access
  if (hasAccess) {
    return (
      <>
        {/* Article read counter banner */}
        {remainingReads <= 2 && (
          <div className="mb-6 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
                  <span className="text-[var(--color-text-primary)] font-bold">{remainingReads}</span>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {remainingReads === 0 
                      ? "This is your last free article this month"
                      : `${remainingReads} free article${remainingReads === 1 ? '' : 's'} remaining this month`
                    }
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Subscribe to support animals & get unlimited access
                  </p>
                </div>
              </div>
              <Link
                href="/support"
                className="px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // No access - show paywall
  return (
    <div className="relative">
      {/* Preview content */}
      {preview && (
        <div className="relative">
          {preview}
          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
        </div>
      )}

      {/* Paywall */}
      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-8 md:p-12 text-center mt-8">
        <div className="max-w-lg mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            You've read your 3 free articles this month
          </h2>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            Subscribe to continue reading "<span className="font-medium text-[var(--color-text-primary)]">{articleTitle}</span>" and get unlimited access to all articles. Plus, your subscription directly feeds stray animals.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
              <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[var(--color-text-primary)]">Unlimited article access</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
              <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[var(--color-text-primary)]">Feed stray animals directly</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
              <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[var(--color-text-primary)]">Track your personal impact</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
              <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[var(--color-text-primary)]">Join the supporters wall</span>
            </div>
          </div>

          {/* Pricing hint */}
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Starting at just <span className="font-bold text-[var(--color-text-primary)]">₹29/week</span> or <span className="font-bold text-[var(--color-text-primary)]">₹79/month</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Subscribe & Continue Reading
            </Link>
            {!user && (
              <Link
                href="/login"
                className="px-8 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full font-medium hover:bg-[var(--color-bg)] transition-colors"
              >
                Already a subscriber? Log in
              </Link>
            )}
          </div>

          {/* Counter resets note */}
          <p className="mt-6 text-xs text-[var(--color-text-secondary)]">
            Free article counter resets on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getStoredData(): ReadData {
  if (typeof window === 'undefined') {
    return { month: getCurrentMonth(), reads: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading article reads from localStorage:', e);
  }
  
  return { month: getCurrentMonth(), reads: [] };
}

function recordRead(slug: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data = getStoredData();
    const currentMonth = getCurrentMonth();
    
    // Reset if new month
    if (data.month !== currentMonth) {
      data.month = currentMonth;
      data.reads = [];
    }
    
    // Don't duplicate
    if (!data.reads.some(r => r.slug === slug)) {
      data.reads.push({ slug, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error recording article read:', e);
  }
}

function resetReads(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: ReadData = { month: getCurrentMonth(), reads: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error resetting article reads:', e);
  }
}
