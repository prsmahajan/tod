"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Utensils, Heart } from "lucide-react";

interface Stats {
  subscribers: number;
  monthlyRevenue: number;
  mealsPerMonth: number;
  animalsHelpedDaily: number;
}

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
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
        <div className="text-center text-gray-500">Loading impact data...</div>
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      icon: Users,
      label: "Active Subscribers",
      value: stats.subscribers.toLocaleString(),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "People supporting the mission",
    },
    {
      icon: DollarSign,
      label: "Monthly Impact",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Funds for animal welfare",
    },
    {
      icon: Utensils,
      label: "Meals Per Month",
      value: stats.mealsPerMonth.toLocaleString(),
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Meals provided to strays",
    },
    {
      icon: Heart,
      label: "Animals Fed Daily",
      value: stats.animalsHelpedDaily.toLocaleString(),
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Dogs, cats & cows helped",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-xl border border-blue-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Real-Time Impact
        </h2>
        <p className="text-gray-600">
          Every subscription feeds hungry animals across India
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${metric.color} w-6 h-6`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500">
                {metric.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block bg-white rounded-xl px-6 py-4 shadow-md">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-bold text-blue-600">
              Join {stats.subscribers.toLocaleString()} others
            </span>{" "}
            making a difference
          </p>
          <p className="text-xs text-gray-500">
            Just ₹10/month = Learn tech + Feed hungry animals
          </p>
        </div>
      </div>
    </div>
  );
}
