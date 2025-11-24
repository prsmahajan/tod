"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Users, Utensils, TrendingUp } from "lucide-react";

export function SubscriptionCalculator() {
  const [subscribers, setSubscribers] = useState(100);

  // Calculations
  const monthlyRevenue = subscribers * 10; // ₹10 per subscriber
  const mealsPerMonth = Math.floor(monthlyRevenue / 5); // ₹5 per meal
  const animalsPerDay = Math.floor(mealsPerMonth / 30);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-xl border border-blue-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Impact Calculator
        </h2>
        <p className="text-gray-600">
          See the real-time impact of growing our community
        </p>
      </div>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-gray-900">
            Number of Subscribers
          </label>
          <div className="text-3xl font-bold text-blue-600">
            {subscribers.toLocaleString()}
          </div>
        </div>
        <input
          type="range"
          min="10"
          max="50000"
          step="10"
          value={subscribers}
          onChange={(e) => setSubscribers(parseInt(e.target.value))}
          className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(subscribers / 50000) * 100}%, #dbeafe ${(subscribers / 50000) * 100}%, #dbeafe 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>10</span>
          <span>25,000</span>
          <span>50,000</span>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Utensils className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Monthly Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{monthlyRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Utensils className="text-orange-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Meals/Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {mealsPerMonth.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <Heart className="text-red-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Animals/Day</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {animalsPerDay.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-xl p-6 text-center">
        <p className="text-lg mb-4">
          <span className="font-bold text-blue-600">
            You'd be subscriber #{subscribers.toLocaleString()}
          </span>{" "}
          helping feed{" "}
          <span className="font-bold text-red-600">
            {animalsPerDay.toLocaleString()} animals every day
          </span>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Just ₹10/month = Premium tech content + Real impact on animal lives
        </p>
        <Link href="/login">
          <button className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
            Join the Mission
          </button>
        </Link>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
