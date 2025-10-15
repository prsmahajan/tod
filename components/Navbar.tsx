// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold">MyApp</Link>

      {status === "authenticated" ? (
        <div className="relative">
          <button onClick={() => setOpen((x) => !x)} className="flex items-center gap-3">
            <span className="hidden sm:inline">Hi, {session?.user?.name ?? "User"}</span>
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
        <div className="flex gap-3">
          <Link href="/login" className="border px-3 py-1.5 rounded hover:bg-gray-50">Log in</Link>
          <Link href="/signup" className="border px-3 py-1.5 rounded bg-black text-white hover:bg-gray-900">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
