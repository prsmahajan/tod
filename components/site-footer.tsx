import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-sans text-2xl font-semibold sm:text-3xl">
              <span className="font-serif">The Open Draft</span>
            </h3>
            <p className="max-w-lg text-muted-foreground">
              Technology explained simply. Every subscription feeds stray animals in India.
            </p>
            <Link href="/mission" className="inline-block text-blue-600 hover:underline font-semibold">
              Learn about our mission →
            </Link>
          </div>
          <div className="md:justify-self-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 The Open Draft. Built with ❤️ for animals.</p>
          <nav className="flex gap-6">
            <Link href="/mission" className="hover:underline">
              Our Mission
            </Link>
            <Link href="/newsletter" className="hover:underline">
              Newsletter
            </Link>
            <Link href="mailto:tod@theopendraft.com" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
