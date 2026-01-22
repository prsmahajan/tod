"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import { User, LogOut, LayoutDashboard, Bookmark, Menu, X } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { ThemeToggle } from "@/components/ThemeToggle";

function Navbar() {
  const { user, loading: authLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
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

  // Fetch user role from API
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/auth/check-role?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.role) {
            setUserRole(data.role);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    } else {
      setUserRole(null);
    }
  }, [user]);

  const isAdmin = useMemo(
    () => userRole && ["ADMIN", "EDITOR", "AUTHOR"].includes(userRole),
    [userRole]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout]);

  const toggleDropdown = useCallback(() => {
    setOpen((x) => !x);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((x) => !x);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo-dark.png"
                alt="The Open Draft"
                width={32}
                height={32}
                priority
              />
              <span className="text-lg font-bold text-slate-900 dark:text-slate-50 hidden sm:inline">
                The Open Draft
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/articles" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Articles
              </Link>
              <Link href="/impact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Impact
              </Link>
              <Link href="/mission" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Our Mission
              </Link>
              <Link href="/community" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Community
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu size={24} className="text-slate-700 dark:text-slate-300" />
              )}
            </button>
            <ThemeToggle />
            {!authLoading && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.name ?? user.email ?? "User"}
                  </span>
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-slate-600 dark:text-slate-400" />
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
                        onClick={closeDropdown}
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/saved"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
                      onClick={closeDropdown}
                    >
                      <Bookmark size={16} />
                      Saved Posts
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-left text-red-600 dark:text-red-400"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : !authLoading ? (
              <LoginModal>
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Log in
                </button>
              </LoginModal>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col py-4">
            <Link
              href="/articles"
              className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={closeMobileMenu}
            >
              Articles
            </Link>
            <Link
              href="/impact"
              className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={closeMobileMenu}
            >
              Impact
            </Link>
            <Link
              href="/mission"
              className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={closeMobileMenu}
            >
              Our Mission
            </Link>
            <Link
              href="/community"
              className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={closeMobileMenu}
            >
              Community
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default memo(Navbar);
