"use client";

import { useEffect, useState } from "react";
import { Users, Utensils, Heart } from "lucide-react";

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
      <div className="bg-white border border-[#E5E5E5] p-8">
        <div className="text-center text-[#212121]">Loading impact data...</div>
      </div>
    );
  }

  if (!stats) return null;

  const projectedMonthlyRevenue = TARGET_SUBSCRIBERS * SUBSCRIPTION_AMOUNT;
  const projectedMealsPerMonth = Math.floor(projectedMonthlyRevenue / MEAL_COST);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4 text-black">
            Our Impact
          </h2>
          <p className="text-base text-[#212121]">
            Every subscription feeds hungry animals across India
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-5xl font-semibold mb-2 text-black">
              {stats.subscribers.toLocaleString()}
            </div>
            <div className="text-base text-[#212121]">
              People committed
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-semibold mb-2 text-black">
              {TARGET_SUBSCRIBERS.toLocaleString()}
            </div>
            <div className="text-base text-[#212121]">
              Target subscribers
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-semibold mb-2 text-black">
              {projectedMealsPerMonth.toLocaleString()}
            </div>
            <div className="text-base text-[#212121]">
              Meals/month at target
            </div>
          </div>
        </div>

        {/* Projected Impact */}
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-8 text-center">
          <h3 className="text-xl font-semibold mb-4 text-black">
            Projected Impact at Target
          </h3>
          <p className="text-2xl font-semibold text-[#212121]">
            {TARGET_SUBSCRIBERS.toLocaleString()} × ₹{SUBSCRIPTION_AMOUNT} = {projectedMealsPerMonth.toLocaleString()} meals/month
          </p>
          <p className="text-sm text-[#212121] mt-2">
            That's {Math.floor(projectedMealsPerMonth / 30).toLocaleString()} meals per day
          </p>
        </div>
      </div>
    </section>
  );
}
