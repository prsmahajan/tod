"use client";

import { useState } from "react";
import { Heart, Users, Utensils, Share2, Twitter, MessageCircle, Copy, Check, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ImpactCalculatorWidget() {
  const [friends, setFriends] = useState(5);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculations
  const monthlyPerFriend = 10; // ₹10 per subscriber
  const totalMonthly = friends * monthlyPerFriend;
  const mealsPerMonth = Math.floor(totalMonthly / 5); // ₹5 per meal
  const animalsFedPerMonth = Math.floor(mealsPerMonth / 30); // Rough estimate

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `If I get ${friends} friends to join, we can feed ${animalsFedPerMonth} animals every month! Join me in this mission: ${shareUrl}/mission`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl + "/mission")}&hashtags=AnimalWelfare,FeedAnimals`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`🐾 Impact Calculator\n\n${shareText}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl + "/mission")}&quote=${encodeURIComponent(shareText)}`,
  };

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function handleShare(platform: string, url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 rounded-2xl p-8 shadow-xl border-2 border-orange-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
          Impact Calculator
        </h2>
        <p className="text-gray-600 font-serif">
          If I get X friends to join = Y animals fed
        </p>
      </div>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-gray-900 font-serif">
            Number of Friends
          </label>
          <div className="text-3xl font-bold text-orange-600 font-hand">
            {friends}
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={friends}
          onChange={(e) => setFriends(parseInt(e.target.value))}
          className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(friends / 50) * 100}%, #fed7aa ${(friends / 50) * 100}%, #fed7aa 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1</span>
          <span>25</span>
          <span>50</span>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">Monthly Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{totalMonthly.toLocaleString()}
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
            <span className="text-sm text-gray-600">Animals Fed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {animalsFedPerMonth.toLocaleString()}/month
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-xl p-6 text-center mb-4">
        <p className="text-lg mb-2 font-serif">
          <span className="font-bold text-orange-600">
            If I get {friends} friends to join
          </span>
          , we can feed{" "}
          <span className="font-bold text-red-600">
            {animalsFedPerMonth} animals every month
          </span>
        </p>
        <p className="text-sm text-gray-600 mb-4 font-serif">
          Just ₹10/month per person = Real impact on animal lives
        </p>
      </div>

      {/* Share Button */}
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Share2 size={16} />
              Share This Impact
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem
              onClick={() => handleShare("twitter", shareLinks.twitter)}
            >
              <Twitter className="mr-2 h-4 w-4 text-blue-400" />
              Share on Twitter
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
            >
              <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
              Share on WhatsApp
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleShare("facebook", shareLinks.facebook)}
            >
              <Facebook className="mr-2 h-4 w-4 text-blue-600" />
              Share on Facebook
            </DropdownMenuItem>

            <DropdownMenuItem onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Message
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #ea580c;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #ea580c;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

