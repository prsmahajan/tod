"use client";

import React, { useEffect, useState } from 'react';

interface Stats {
  totalRevenue: number;
  totalSupporters: number;
  activeSubscriptions: number;
  animalsHelped: number;
  display: {
    totalRevenue: string;
    totalSupporters: number;
    activeSubscriptions: number;
    animalsHelped: number;
    goalProgress: number;
  };
}

interface CommunityStatsProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function CommunityStats({ variant = 'full', className = '' }: CommunityStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
              <div className="h-4 w-20 bg-[var(--color-border)] rounded mb-3" />
              <div className="h-8 w-16 bg-[var(--color-border)] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 ${className}`}>
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
            {stats.display.totalSupporters}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Supporters</p>
        </div>
        <div className="w-px h-10 bg-[var(--color-border)] hidden md:block" />
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
            {stats.display.totalRevenue}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Raised</p>
        </div>
        <div className="w-px h-10 bg-[var(--color-border)] hidden md:block" />
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
            {stats.display.animalsHelped}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">Meals Served</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Raised */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-text-secondary)] transition-colors">
          <div className="w-10 h-10 mb-4 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Total Raised</p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {stats.display.totalRevenue}
          </p>
        </div>

        {/* Supporters */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-text-secondary)] transition-colors">
          <div className="w-10 h-10 mb-4 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Supporters</p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {stats.display.totalSupporters}
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-text-secondary)] transition-colors">
          <div className="w-10 h-10 mb-4 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Active</p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {stats.display.activeSubscriptions}
          </p>
        </div>

        {/* Meals Served */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-text-secondary)] transition-colors">
          <div className="w-10 h-10 mb-4 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Meals Served</p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {stats.display.animalsHelped}
          </p>
        </div>
      </div>

      {/* Progress to Goal */}
      {stats.display.goalProgress < 100 && (
        <div className="mt-6 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Progress to ₹10,000 goal</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{stats.display.goalProgress}%</p>
          </div>
          <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-text-primary)] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.display.goalProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
