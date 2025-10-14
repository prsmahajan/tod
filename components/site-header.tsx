import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SiteHeader() {
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
          <Link href="#" className="rounded-md px-3 py-2 text-sm hover:bg-accent" aria-label="Login">
            Login
          </Link>
          <Button asChild className="rounded-full px-4 py-2" aria-label="Sign Up">
            <Link href="#">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
