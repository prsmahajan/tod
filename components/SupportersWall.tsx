"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Supporter {
  id: string;
  displayName: string;
  planType: string;
  joinedAt: string;
  avatar: string;
}

interface SupportersData {
  supporters: Supporter[];
  total: number;
  activeCount: number;
}

const PLAN_LABELS: Record<string, string> = {
  seedling: 'Seedling',
  sapling: 'Sapling',
  tree: 'Tree',
};

const PLAN_ICONS: Record<string, string> = {
  seedling: '🌱',
  sapling: '🌿',
  tree: '🌳',
};

export default function SupportersWall() {
  const [data, setData] = useState<SupportersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupporters() {
      try {
        const res = await fetch('/api/public/supporters?limit=30');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Error fetching supporters:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSupporters();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-[var(--color-border)] rounded mx-auto mb-8" />
        <div className="flex flex-wrap justify-center gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-full bg-[var(--color-border)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.supporters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-card-bg)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center">
          <span className="text-3xl">🌱</span>
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
          Be the First Supporter
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
          Join our mission to feed stray animals across India. Your name will appear here!
        </p>
        <Link href="/support">
          <button className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-full font-medium hover:opacity-90 transition-opacity">
            Become a Supporter
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-2">
          Our Community
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
          Wall of Supporters
        </h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {data.activeCount} kind hearts making a difference
        </p>
      </div>

      {/* Supporters Grid */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {data.supporters.map((supporter, index) => (
          <SupporterAvatar 
            key={supporter.id} 
            supporter={supporter} 
            index={index}
          />
        ))}
        
        {/* "Join" placeholder */}
        <Link href="/support" className="group">
          <div className="relative">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center bg-[var(--color-card-bg)] group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/10 transition-all">
              <svg 
                className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-secondary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Join us
            </span>
          </div>
        </Link>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link href="/support">
          <button className="px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full font-medium hover:opacity-90 transition-opacity">
            Join {data.total}+ Supporters
          </button>
        </Link>
      </div>
    </div>
  );
}

function SupporterAvatar({ supporter, index }: { supporter: Supporter; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const initials = supporter.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Stagger animation delay
  const animationDelay = `${index * 50}ms`;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Avatar */}
      <div 
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-md hover:scale-110 transition-transform cursor-default animate-fade-in-up"
        style={{ 
          backgroundColor: supporter.avatar,
          animationDelay,
        }}
      >
        {initials}
      </div>

      {/* Plan badge */}
      <span 
        className="absolute -bottom-1 -right-1 text-sm"
        title={PLAN_LABELS[supporter.planType]}
      >
        {PLAN_ICONS[supporter.planType] || '🌱'}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 whitespace-nowrap animate-fade-in">
          <p className="font-medium text-sm text-[var(--color-text-primary)]">
            {supporter.displayName}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {PLAN_LABELS[supporter.planType]} Supporter
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Since {new Date(supporter.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--color-card-bg)]" />
        </div>
      )}
    </div>
  );
}
