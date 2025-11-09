"use client";

import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    setMounted(true);
    setShareUrl(`${window.location.origin}${url}`);
  }, [url]);

  const shareText = description || title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&via=theopendraft`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">Share:</span>

      {/* Native Share (Mobile) */}
      {mounted && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
        >
          <Share2 size={16} />
          Share
        </button>
      )}

      {/* Twitter */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition text-blue-700 text-sm"
      >
        <Twitter size={16} />
        <span className="hidden sm:inline">Tweet</span>
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white text-sm"
      >
        <Facebook size={16} />
        <span className="hidden sm:inline">Share</span>
      </a>

      {/* LinkedIn */}
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 transition text-white text-sm"
      >
        <Linkedin size={16} />
        <span className="hidden sm:inline">Post</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
      >
        <LinkIcon size={16} />
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}
