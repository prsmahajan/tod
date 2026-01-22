"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/appwrite/auth";
import { Bookmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SavePostButtonProps {
  postId: string;
  className?: string;
  showText?: boolean;
}

export function SavePostButton({ postId, className = "", showText = false }: SavePostButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        checkSavedStatus();
      } else {
        setChecking(false);
      }
    }
  }, [postId, user, authLoading]);

  async function checkSavedStatus() {
    try {
      const res = await fetch(`/api/saved-posts/check?postId=${postId}`, {
        headers: {
          "x-user-email": user?.email || "",
        },
      });
      const data = await res.json();
      setSaved(data.saved);
    } catch (error) {
      console.error("Failed to check saved status:", error);
    } finally {
      setChecking(false);
    }
  }

  async function toggleSave() {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      };

      if (saved) {
        // Unsave
        const res = await fetch(`/api/saved-posts?postId=${postId}`, {
          method: "DELETE",
          headers,
        });

        if (res.ok) {
          setSaved(false);
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to unsave post");
        }
      } else {
        // Save
        const res = await fetch("/api/saved-posts", {
          method: "POST",
          headers,
          body: JSON.stringify({ postId }),
        });

        if (res.ok) {
          setSaved(true);
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to save post");
        }
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checking || authLoading) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-gray-100 text-gray-400 ${className}`}
      >
        <Loader2 size={18} className="animate-spin" />
        {showText && <span className="text-sm">Loading...</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
        saved
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={saved ? "Unsave post" : "Save post"}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Bookmark size={18} className={saved ? "fill-current" : ""} />
      )}
      {showText && <span className="text-sm">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
