"use client";

import { Share2, Twitter, MessageCircle, Instagram, Copy, Check, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareAnimalButtonProps {
  animal: {
    id: string;
    name: string;
    slug: string;
    shortStory: string;
    photoUrl?: string | null;
    species: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function ShareAnimalButton({ animal, variant = "default", size = "default" }: ShareAnimalButtonProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setShareUrl(`${window.location.origin}/animals/${animal.slug}`);
  }, [animal.slug]);

  const shareText = `Meet ${animal.name}! ${animal.shortStory} Help feed animals like ${animal.name} by joining our mission.`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Share ${animal.name}'s story: ${shareText}`)}&url=${encodeURIComponent(shareUrl)}&hashtags=AnimalWelfare,FeedAnimals`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`🐾 Share ${animal.name}'s story\n\n${shareText}\n\n${shareUrl}`)}`,
    instagram: `https://www.instagram.com/create/story/?media=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`Share ${animal.name}'s story: ${shareText}`)}`,
  };

  async function trackShare(platform: string) {
    try {
      await fetch("/api/animals/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalId: animal.id,
          platform,
        }),
      });
    } catch (error) {
      console.error("Failed to track share:", error);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await trackShare("COPY_LINK");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Share ${animal.name}'s story`,
          text: shareText,
          url: shareUrl,
        });
        await trackShare("NATIVE");
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
  }

  function handleShare(platform: string, url: string) {
    trackShare(platform);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 size={16} />
          Share {animal.name}'s Story
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Native Share (Mobile) */}
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
        )}

        {/* Twitter */}
        <DropdownMenuItem
          onClick={() => handleShare("TWITTER", shareLinks.twitter)}
        >
          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem
          onClick={() => handleShare("WHATSAPP", shareLinks.whatsapp)}
        >
          <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
          Share on WhatsApp
        </DropdownMenuItem>

        {/* Instagram Stories */}
        <DropdownMenuItem
          onClick={() => handleShare("INSTAGRAM", shareLinks.instagram)}
        >
          <Instagram className="mr-2 h-4 w-4 text-pink-500" />
          Share to Instagram Stories
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem
          onClick={() => handleShare("FACEBOOK", shareLinks.facebook)}
        >
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>

        {/* Copy Link */}
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

