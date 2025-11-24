"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { LoginModal } from "@/components/LoginModal";

export function SiteHeader() {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);

    function getFirstName(name?: string) {
  if (!name) return "";
  const first = name.trim().split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
    
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Home" className="inline-flex items-center">
            <span className="place-items-center">
              <Image
                src="/images/logo-dark.png"
                alt="The Open Draft logo"
                className="rounded-xl"
                width={40}
                height={40}
                priority
              />
            </span>
          </Link>
          <button
            type="button"
            aria-label="Search"
            className="inline-flex size-9 items-center justify-center rounded-md border border-input bg-card hover:bg-accent"
          >
            <Search className="size-5" />
          </button>
        </div>

        <nav className="flex items-center gap-2">
          {status === "authenticated" ? (
        <div className="relative">
          <button onClick={() => setOpen((x) => !x)} className="flex items-center gap-3">
            <span className="hidden sm:inline">Hi, {getFirstName(session?.user?.name ?? "User")}</span>
            <div className="w-8 h-8 rounded-md border grid place-items-center">
              {/* simple hamburger icon */}
              <div className="space-y-1">
                <span className="block w-4 h-0.5 bg-black"></span>
                <span className="block w-4 h-0.5 bg-black"></span>
                <span className="block w-4 h-0.5 bg-black"></span>
              </div>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <LoginModal>
          <button className="border px-3 py-1.5 rounded bg-black text-white hover:bg-gray-900">
            Log in
          </button>
        </LoginModal>
      )}
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader