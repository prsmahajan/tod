"use client";

import { useEffect, useState } from "react";
import { Users, Utensils, Heart, Target } from "lucide-react";

interface Stats {
  subscribers: number;
  monthlyRevenue: number;
  mealsPerMonth: number;
  animalsHelpedDaily: number;
}

const TARGET_SUBSCRIBERS = 1000;
const SUBSCRIPTION_AMOUNT = 10; // ₹10
const MEAL_COST = 5; // ₹5 per meal

export function ImpactDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-slate-600 dark:text-slate-400">Loading impact data...</div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const projectedMonthlyRevenue = TARGET_SUBSCRIBERS * SUBSCRIPTION_AMOUNT;
  const projectedMealsPerMonth = Math.floor(projectedMonthlyRevenue / MEAL_COST);
  const progressPercentage = (stats.subscribers / TARGET_SUBSCRIBERS) * 100;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Our Impact
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Every subscription directly feeds hungry animals across India
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {stats.subscribers} of {TARGET_SUBSCRIBERS} subscribers
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Feeders</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.subscribers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Target</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {TARGET_SUBSCRIBERS.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Utensils className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Meals/Month</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {projectedMealsPerMonth.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Meals/Day</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {Math.floor(projectedMealsPerMonth / 30).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Projected Impact */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Projected Impact at Target
          </h3>
          <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {projectedMealsPerMonth.toLocaleString()}
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            meals per month = {TARGET_SUBSCRIBERS.toLocaleString()} subscribers × ₹{SUBSCRIPTION_AMOUNT}
          </p>
        </div>
      </div>
    </section>
  );
}
