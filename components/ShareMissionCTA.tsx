"use client";

import { Share2, Twitter, MessageCircle, Copy, Check, Heart, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ShareMissionCTA() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setShareUrl(typeof window !== "undefined" ? window.location.origin + "/mission" : "");
  }, []);

  const shareText = `I just joined a mission to feed stray animals in Pune! For just ₹10/month, we can make a real difference. Join me: ${shareUrl}`;

  const whatsappMessage = `🐾 *I just joined a mission to feed stray animals!*\n\nFor just ₹10/month, we can help feed thousands of hungry animals in Pune.\n\nThis is personal. Every day, I see dogs, cats, and cows who are hungry. Really hungry.\n\nTogether, we can change that.\n\nJoin me: ${shareUrl}\n\n#AnimalWelfare #FeedAnimals`;

  const twitterMessage = `I just joined a mission to feed stray animals in Pune! For just ₹10/month, we can make a real difference. Join me: ${shareUrl} #AnimalWelfare #FeedAnimals`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}&url=${encodeURIComponent(shareUrl)}&hashtags=AnimalWelfare,FeedAnimals`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
  };

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function handleShare(platform: string, url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
          <Heart className="text-white" size={32} fill="currentColor" />
        </div>
        <h3 className="text-3xl font-bold mb-4 font-serif">
          Share This Mission With Friends
        </h3>
        <p className="text-lg mb-6 font-serif opacity-90">
          The more people who join, the more animals we can feed. Share your story and invite others to be part of this mission.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <Button
          onClick={() => handleShare("twitter", shareLinks.twitter)}
          variant="secondary"
          size="lg"
          className="bg-white text-orange-600 hover:bg-gray-100 gap-2"
        >
          <Twitter size={20} />
          Share on Twitter
        </Button>

        <Button
          onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
          variant="secondary"
          size="lg"
          className="bg-white text-green-600 hover:bg-gray-100 gap-2"
        >
          <MessageCircle size={20} />
          Share on WhatsApp
        </Button>

        <Button
          onClick={copyToClipboard}
          variant="secondary"
          size="lg"
          className="bg-white text-gray-700 hover:bg-gray-100 gap-2"
        >
          {copied ? (
            <>
              <Check size={20} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={20} />
              Copy Message
            </>
          )}
        </Button>
      </div>

      <div className="bg-white/10 rounded-xl p-6 mt-6">
        <h4 className="font-semibold mb-3 text-lg">Pre-written messages:</h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">For WhatsApp:</p>
            <p className="opacity-90 italic">{whatsappMessage}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">For Twitter:</p>
            <p className="opacity-90 italic">{twitterMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

