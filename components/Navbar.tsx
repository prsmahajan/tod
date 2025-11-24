"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, LayoutDashboard, Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = useMemo(
    () => session?.user && ["ADMIN", "EDITOR", "AUTHOR"].includes((session.user as any).role),
    [session]
  );

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const toggleDropdown = useCallback(() => {
    setOpen((x) => !x);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <nav className="w-full border-b border-[#E5E5E5] dark:border-[#212121] bg-white dark:bg-black sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo-dark.png"
              alt="The Open Draft"
              width={32}
              height={32}
              priority
            />
            <span className="text-lg font-semibold text-black dark:text-white hidden sm:inline">The Open Draft</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/articles" className="text-[#212121] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
              Articles
            </Link>
            <Link href="/impact" className="text-[#212121] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
              Impact
            </Link>
            <Link href="/mission" className="text-[#212121] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
              Our Mission
            </Link>
            <Link href="/community" className="text-[#212121] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
              Community
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[#212121] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* User Menu & Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {status === "authenticated" ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#FAFAFA] dark:hover:bg-[#212121] transition-colors"
              >
                <span className="hidden sm:inline text-sm text-[#212121] dark:text-gray-300">
                  {session?.user?.name ?? session?.user?.email ?? "User"}
                </span>
                <div className="w-8 h-8 bg-[#FAFAFA] dark:bg-[#212121] border border-[#E5E5E5] dark:border-[#404040] flex items-center justify-center">
                  <User size={18} className="text-[#212121] dark:text-gray-300" />
                </div>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 border border-[#E5E5E5] dark:border-[#404040] bg-white dark:bg-black shadow-lg">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-[#FAFAFA] dark:hover:bg-[#212121] transition-colors text-sm text-[#212121] dark:text-gray-300"
                      onClick={closeDropdown}
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/saved"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-[#FAFAFA] dark:hover:bg-[#212121] transition-colors text-sm text-[#212121] dark:text-gray-300"
                    onClick={closeDropdown}
                  >
                    <Bookmark size={16} />
                    Saved Posts
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#FAFAFA] dark:hover:bg-[#212121] transition-colors text-sm text-left text-[#DC2626]"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity">
                Log in
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
