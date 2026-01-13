"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Icon from "@/components/Icon";
import { useScroll } from "@/hooks/useScroll";

const NAV_LINKS = [
  { name: "Impact", path: "/impact" },
  { name: "Mission", path: "/mission" },
  { name: "Support", path: "/support" },
  { name: "Articles", path: "/articles" },
];

function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrolled = useScroll(50);

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

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
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {user?.firstName || user?.username}
                    </span>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                          userButtonPopoverCard: "bg-[var(--color-card-bg)] border border-[var(--color-border)]",
                          userButtonPopoverActions: "bg-[var(--color-card-bg)]",
                          userButtonPopoverActionButton: "text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-border)]/50 hover:bg-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer">
                        Log In
                      </button>
                    </SignInButton>
                    <Link href="/waitlist">
                      <button className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-card-bg)] text-[var(--color-text-primary)] shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                        Join The Waitlist
                      </button>
                    </Link>
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
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-[var(--color-card-bg)] border border-[var(--color-border)]",
                        userButtonPopoverActions: "bg-[var(--color-card-bg)]",
                        userButtonPopoverActionButton: "text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50",
                      },
                    }}
                  />
                ) : (
                  <Link href="/waitlist">
                    <button className="px-5 py-2 text-base font-medium rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 cursor-pointer">
                      Join The Waitlist
                    </button>
                  </Link>
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
              <div className="flex items-center px-5 gap-3">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-[var(--color-card-bg)] border border-[var(--color-border)]",
                      userButtonPopoverActions: "bg-[var(--color-card-bg)]",
                      userButtonPopoverActionButton: "text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/50",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center px-5 space-x-4">
                <SignInButton mode="modal">
                  <button className="flex-1 px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors cursor-pointer">
                    Log In
                  </button>
                </SignInButton>
                <Link href="/waitlist" className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 transition-opacity cursor-pointer">
                    Join the Waitlist
                  </button>
                </Link>
              </div>
            )}
            <div className="mt-4 px-5">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Theme</p>
              <ThemeSwitcher isFixed={false} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
