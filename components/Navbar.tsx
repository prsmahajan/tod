// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, LayoutDashboard, Bookmark } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    <nav className="w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo-dark.png"
              alt="The Open Draft"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">The Open Draft</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/newsletter" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition">
              Newsletter
            </Link>
            <Link href="/mission" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition">
              Our Mission
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Theme Toggle & User Menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {status === "authenticated" ? (
            <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                {session?.user?.name ?? session?.user?.email ?? "User"}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User size={18} className="text-gray-600 dark:text-gray-300" />
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-gray-700 dark:text-gray-200"
                    onClick={closeDropdown}
                  >
                    <LayoutDashboard size={16} />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/saved"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-gray-700 dark:text-gray-200"
                  onClick={closeDropdown}
                >
                  <Bookmark size={16} />
                  Saved Posts
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-left text-red-600 dark:text-red-400"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
