"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated logo/spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-[var(--color-border)]`} />

        {/* Animated arc */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-[var(--color-text-primary)] animate-spin`}
          style={{ animationDuration: '0.8s' }}
        />

        {/* Center dot pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${size === 'lg' ? 'w-3 h-3' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full bg-[var(--color-text-primary)] animate-pulse`}
          />
        </div>
      </div>

      {/* Optional text */}
      {text && (
        <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative w-16 h-16">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
          >
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
            <div className="w-4 h-4 rounded-full bg-[var(--color-text-primary)] animate-pulse" />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
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
  );
}

// Dashboard content skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-[var(--color-border)] rounded-lg" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)]">
            <div className="h-4 w-20 bg-[var(--color-border)] rounded mb-3" />
            <div className="h-8 w-32 bg-[var(--color-border)] rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="p-6 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)]">
        <div className="space-y-4">
          <div className="h-4 w-full bg-[var(--color-border)] rounded" />
          <div className="h-4 w-3/4 bg-[var(--color-border)] rounded" />
          <div className="h-4 w-5/6 bg-[var(--color-border)] rounded" />
        </div>
      </div>
    </div>
  );
}
