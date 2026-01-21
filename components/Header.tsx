"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Icon from "@/components/Icon";
import { useScroll } from "@/hooks/useScroll";
import AuthModal from "@/components/AuthModal";

const NAV_LINKS = [
  { name: "Impact", path: "/impact" },
  { name: "Mission", path: "/mission" },
  { name: "Support", path: "/support" },
  { name: "Articles", path: "/articles" },
];

function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLoaded = !loading;
  const isSignedIn = !!user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const scrolled = useScroll(50);

  // Check if user has admin/editor/author role
  useEffect(() => {
    async function checkAdminRole() {
      if (!user?.email) {
        setIsAdminUser(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/check-role?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (res.ok && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(data.role)) {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      } catch {
        setIsAdminUser(false);
      }
    }
    checkAdminRole();
  }, [user?.email]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // User dropdown component
  const UserMenu = ({ compact = false }: { compact?: boolean }) => (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center gap-2 focus:outline-none cursor-pointer"
      >
        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center font-medium text-sm overflow-hidden border-2 border-[var(--color-border)]`}>
          {user?.prefs?.avatar ? (
            <img
              src={user.prefs.avatar}
              alt={user.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        {!compact && (
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
          </span>
        )}
      </button>
      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xl py-2 z-50 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {user?.email}
            </p>
          </div>
          {isAdminUser && (
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                router.push('/admin');
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] cursor-pointer flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Content Studio
            </button>
          )}
          <button
            onClick={() => {
              setIsUserMenuOpen(false);
              router.push('/app');
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] cursor-pointer flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => {
              setIsUserMenuOpen(false);
              router.push('/app/subscription');
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] cursor-pointer flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            Subscription
          </button>
          <div className="border-t border-[var(--color-border)] mt-2 pt-2">
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const navLinks = (
    <nav className="flex items-center space-x-2">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.name}
          href={link.path}
          className="px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-300"
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-2 left-0 right-0 z-50 h-24 flex items-center hidden md:block font-nav">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div
            className={`
              relative flex items-center h-16
              transition-all duration-500 ease-in-out
              ${scrolled
                ? 'w-auto bg-[var(--color-card-bg)] shadow-lg rounded-2xl px-4'
                : 'w-full'
              }
            `}
          >
            {/* Unscrolled Layout */}
            <div
              className={`
                flex w-full items-center justify-between
                transition-opacity duration-300
                ${scrolled ? 'opacity-0' : 'opacity-100'}
              `}
            >
              <Link href="/" className="flex items-center space-x-3">
                <Icon name="logo" className="h-8 w-8 text-[var(--color-text-primary)]" />
                <span className="font-heading font-bold text-2xl">tod;</span>
              </Link>
              {navLinks}
              <div className="flex items-center space-x-2">
                {isLoaded && isSignedIn ? (
                  <UserMenu />
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-border)]/50 hover:bg-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-card-bg)] text-[var(--color-text-primary)] shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Scrolled "Pill" Layout */}
            <div
              className={`
                absolute inset-0 flex items-center justify-between px-4 space-x-6
                transition-opacity duration-300
                ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
            >
              <Link href="/">
                <Icon name="logo" className="h-8 w-8 text-[var(--color-text-primary)]" />
              </Link>
              {navLinks}
              <div className="flex items-center space-x-2">
                {isLoaded && isSignedIn ? (
                  <UserMenu compact />
                ) : (
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 cursor-pointer"
                  >
                    Sign Up
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out md:hidden ${scrolled || isMenuOpen ? 'bg-[var(--color-bg)]/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
              <Icon name="logo" className="h-8 w-auto text-[var(--color-text-primary)]" />
              <span className="font-heading font-bold text-xl">tod</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-[var(--color-text-primary)]"
              aria-label="Open menu"
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} className="h-7 w-7" />
            </button>
          </div>
        </div>

        <div className={`absolute top-20 left-0 w-full bg-[var(--color-bg)] shadow-lg md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-[var(--color-border)]">
            {isLoaded && isSignedIn ? (
              <div className="px-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center font-medium overflow-hidden border-2 border-[var(--color-border)]">
                    {user?.prefs?.avatar ? (
                      <img
                        src={user.prefs.avatar}
                        alt={user.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/app"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/app/subscription"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]"
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center px-5 space-x-4">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
            <div className="mt-4 px-5">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Theme</p>
              <ThemeSwitcher isFixed={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        redirectTo="/app"
      />
    </>
  );
}

export default Header;
