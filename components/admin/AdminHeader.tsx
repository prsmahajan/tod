"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ExternalLink, LogOut, User, Settings } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  itemCount?: number;
}

export function AdminHeader({ title, itemCount }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
            <div className="w-7 h-7 bg-[#4f46e5] rounded-full flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
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
