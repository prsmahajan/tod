"use client";

import { useEffect, useState } from "react";
import { Users, Utensils, Heart, TrendingUp, PieChart, Calculator } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  subscribers: number;
  monthlyRevenue: number;
  mealsPerMonth: number;
  animalsHelpedDaily: number;
}

interface RecentSignup {
  id: string;
  name?: string;
  subscribedAt: string;
}

const TARGET_SUBSCRIBERS = 1000;
const SUBSCRIPTION_AMOUNT = 10; // ₹10
const MEAL_COST = 5; // ₹5 per meal
const SUBSCRIPTIONS_PER_MEAL = MEAL_COST / SUBSCRIPTION_AMOUNT; // 0.5 meals per subscription

// ₹10 breakdown for pie chart
const BREAKDOWN_DATA = [
  { name: "Direct to Animals", value: 8.5, color: "#10b981", percentage: 85 },
  { name: "Operational Costs", value: 1.0, color: "#3b82f6", percentage: 10 },
  { name: "Payment Processing", value: 0.5, color: "#8b5cf6", percentage: 5 },
];

const chartConfig = {
  animals: { label: "Animals Fed", color: "#ef4444" },
  meals: { label: "Meals", color: "#f97316" },
  rupees: { label: "Rupees", color: "#10b981" },
};

export function ImpactDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatorValue, setCalculatorValue] = useState(100);

  useEffect(() => {
    fetchStats();
    fetchRecentSignups();
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

  async function fetchRecentSignups() {
    try {
      const res = await fetch("/api/stats/recent-signups");
      const data = await res.json();
      setRecentSignups(data.signups || []);
    } catch (error) {
      console.error("Failed to fetch recent signups:", error);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 shadow-lg">
        <div className="text-center text-gray-500">Loading impact data...</div>
      </div>
    );
  }

  if (!stats) return null;

  const progress = (stats.subscribers / TARGET_SUBSCRIBERS) * 100;
  const projectedMonthlyRevenue = TARGET_SUBSCRIBERS * SUBSCRIPTION_AMOUNT;
  const projectedMealsPerMonth = Math.floor(projectedMonthlyRevenue / MEAL_COST);

  // Calculator calculations
  const calculatedMeals = Math.floor((calculatorValue * SUBSCRIPTION_AMOUNT) / MEAL_COST);
  const calculatedAnimals = Math.floor(calculatedMeals / 30); // Assume 30 meals per animal per month

  // Get next subscriber number
  const nextSubscriberNumber = stats.subscribers + 1;

  // Anonymize names for ticker
  const anonymizedSignups = recentSignups.map((signup, idx) => ({
    ...signup,
    displayName: signup.name
      ? `${signup.name.split(" ")[0].charAt(0).toUpperCase()}***`
      : `S***`,
  }));

  return (
    <div className="space-y-8">
      {/* Main Impact Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 shadow-xl border border-blue-100 dark:border-blue-900">
      <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Current Impact
        </h2>
          <p className="text-gray-600 dark:text-gray-400">
          Every subscription feeds hungry animals across India
        </p>
      </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.subscribers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  People committed
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <TrendingUp className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {TARGET_SUBSCRIBERS.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Target subscribers
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Utensils className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projectedMealsPerMonth.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Meals/month at target
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress to {TARGET_SUBSCRIBERS.toLocaleString()} subscribers
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-4" />
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>{stats.subscribers.toLocaleString()} / {TARGET_SUBSCRIBERS.toLocaleString()}</span>
            <span>{TARGET_SUBSCRIBERS - stats.subscribers} more needed</span>
          </div>
      </div>

        {/* Projected Impact */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Projected Impact at Target
            </h3>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {TARGET_SUBSCRIBERS.toLocaleString()} × ₹{SUBSCRIPTION_AMOUNT} = {projectedMealsPerMonth.toLocaleString()} meals/month
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              That's {Math.floor(projectedMealsPerMonth / 30).toLocaleString()} meals per day!
            </p>
          </div>
        </Card>

        {/* Transparency: Pie Chart */}
        <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-800 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PieChart className="text-amber-600 dark:text-amber-400 w-6 h-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ₹10 Breakdown
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete transparency on where your money goes
            </p>
          </div>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={BREAKDOWN_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {BREAKDOWN_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {BREAKDOWN_DATA.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  ₹{item.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{item.name}</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Impact Calculator */}
        <Card className="p-6 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Impact Calculator
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See the difference X people can make
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                If <strong className="text-purple-600 dark:text-purple-400">{calculatorValue} people</strong> join:
              </label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={calculatorValue}
                onChange={(e) => setCalculatorValue(parseInt(e.target.value) || 1)}
                className="text-center text-lg font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center border-2 border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {calculatedMeals}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Meals/month</div>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center border-2 border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ~{calculatedAnimals}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Animals fed</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Proof */}
        <div className="space-y-4">
          {/* People Committed Counter */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="text-red-600 dark:text-red-400 w-6 h-6 fill-current" />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {stats.subscribers.toLocaleString()} people committed to join
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Be subscriber #{nextSubscriberNumber.toLocaleString()}!
              </p>
            </div>
          </Card>

          {/* Recent Signups Ticker */}
          {anonymizedSignups.length > 0 && (
            <Card className="p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
              <div className="text-center mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Recent signups
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {anonymizedSignups.map((signup, idx) => (
                  <div
                    key={signup.id}
                    className="flex-shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {signup.displayName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {signup.displayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(signup.subscribedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
