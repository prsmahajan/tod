"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Share2, Heart, Clock } from "lucide-react";
import Link from "next/link";

interface RecentSignup {
  id: string;
  name: string | null;
  subscribedAt: string;
}

interface MostSharedAnimal {
  id: string;
  name: string;
  slug: string;
  shortStory: string;
  photoUrl: string | null;
  species: string;
  shareCount: number;
}

export function EnhancedSocialProof() {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [mostSharedAnimal, setMostSharedAnimal] = useState<MostSharedAnimal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch subscriber count
        const countRes = await fetch("/api/stats/subscribers");
        const countData = await countRes.json();
        setSubscriberCount(countData.count || 0);

        // Fetch recent signups
        const signupsRes = await fetch("/api/stats/recent-signups");
        const signupsData = await signupsRes.json();
        setRecentSignups(signupsData.signups || []);

        // Fetch most shared animal
        const sharedRes = await fetch("/api/animals/most-shared?period=week&limit=1");
        const sharedData = await sharedRes.json();
        if (sharedData.animals && sharedData.animals.length > 0) {
          setMostSharedAnimal(sharedData.animals[0]);
        }
      } catch (error) {
        console.error("Failed to fetch social proof data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      DOG: "🐕",
      CAT: "🐱",
      COW: "🐄",
      PIGEON: "🕊️",
      BULL: "🐂",
    };
    return emojis[species] || "🐾";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Subscriber Count */}
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
                    {subscriberCount.toLocaleString()}
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
              Goal: 1,000 subscribers
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round((subscriberCount / 1000) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((subscriberCount / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recently Joined Feed */}
      {recentSignups.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recently Joined
            </h3>
          </div>
          <div className="space-y-2">
            {recentSignups.slice(0, 5).map((signup) => (
              <div
                key={signup.id}
                className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {signup.name || "Someone"} joined
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatTimeAgo(signup.subscribedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Shared Animal This Week */}
      {mostSharedAnimal && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="text-orange-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Most Shared Animal This Week
            </h3>
          </div>
          <Link
            href={`/animals/${mostSharedAnimal.slug}`}
            className="block group"
          >
            <div className="flex items-start gap-4">
              {mostSharedAnimal.photoUrl ? (
                <img
                  src={mostSharedAnimal.photoUrl}
                  alt={mostSharedAnimal.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl">
                  {getSpeciesEmoji(mostSharedAnimal.species)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getSpeciesEmoji(mostSharedAnimal.species)}</span>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {mostSharedAnimal.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {mostSharedAnimal.shortStory}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="text-red-500" size={14} fill="currentColor" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {mostSharedAnimal.shareCount} shares this week
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}







