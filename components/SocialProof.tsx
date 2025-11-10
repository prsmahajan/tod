"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp } from "lucide-react";

export function SocialProof() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/stats/subscribers");
        const data = await res.json();
        setCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch subscriber count:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCount();
  }, []);

  // Calculate progress towards 1000 milestone
  const milestone = 1000;
  const progress = (count / milestone) * 100;
  const remaining = milestone - count;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-full p-2">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">...</span>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {count.toLocaleString()}
                </span>
              )}
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              subscribers helping feed animals
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Goal: {milestone.toLocaleString()} subscribers
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {remaining > 0 ? (
          <>
            Only <span className="font-bold text-blue-600 dark:text-blue-400">{remaining.toLocaleString()}</span> more
            subscribers needed to reach our next milestone! 🎯
          </>
        ) : (
          <>
            🎉 Milestone reached! Join our growing community.
          </>
        )}
      </p>
    </div>
  );
}
