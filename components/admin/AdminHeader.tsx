"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ExternalLink, LogOut, User, Settings } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  itemCount?: number;
}

export function AdminHeader({ title, itemCount }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user avatar from database
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user?.email) return;

      try {
        const res = await fetch("/api/user/profile", {
          headers: { "x-user-email": user.email },
        });
        if (res.ok) {
          const data = await res.json();
          setUserAvatar(data.avatar || user.prefs?.avatar || null);
        }
      } catch (error) {
        console.error("Failed to fetch user avatar:", error);
        // Fallback to Appwrite prefs
        setUserAvatar(user.prefs?.avatar || null);
      }
    };

    fetchUserAvatar();
  }, [user?.email, user?.prefs?.avatar]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-3 flex items-center justify-between">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-white">
            {title}
            {itemCount !== undefined && (
              <span className="ml-2 text-[#666] font-normal">({itemCount})</span>
            )}
          </h1>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Preview Button */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white text-sm font-medium rounded hover:bg-[#3a3a3a] transition-colors"
        >
          <ExternalLink size={16} />
          Preview Site
        </Link>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={user?.name || "User"}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 bg-[#000000] rounded-full"></div>
            )}
            <span className="text-sm">{user?.name || "User"}</span>
            <ChevronDown size={16} className={`text-[#666] transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-[#3a3a3a]">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-[#666] truncate">{user?.email}</p>
              </div>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#3a3a3a] transition-colors"
              >
                <Settings size={16} />
                Settings
              </Link>
              <Link
                href="/app"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#3a3a3a] transition-colors"
              >
                <User size={16} />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-[#3a3a3a] transition-colors rounded-b-lg"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
