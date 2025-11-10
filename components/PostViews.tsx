"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface PostViewsProps {
  postId: string;
  initialViews: number;
}

export function PostViews({ postId, initialViews }: PostViewsProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    // Track view
    const trackView = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/views`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.views) {
          setViews(data.views);
        }
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    // Only track once per session
    const viewedKey = `viewed_${postId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      trackView();
      sessionStorage.setItem(viewedKey, "true");
    }
  }, [postId]);

  return (
    <div className="flex items-center gap-1 text-gray-600">
      <Eye size={14} />
      <span className="text-sm">{views.toLocaleString()} views</span>
    </div>
  );
}
