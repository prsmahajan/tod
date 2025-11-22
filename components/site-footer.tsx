import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#E5E5E5] bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-black">
              The Open Draft
            </h3>
            <p className="max-w-lg text-[#212121]">
              Technology explained simply. Every subscription feeds stray animals in India.
            </p>
            <Link href="/mission" className="inline-block text-[#212121] underline hover:opacity-70 transition-opacity">
              Learn about our mission →
            </Link>
          </div>
          <div className="md:justify-self-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#E5E5E5] pt-8 text-sm text-[#212121] md:flex-row">
          <p>© 2025 The Open Draft. Built with ❤️ for animals.</p>
          <nav className="flex gap-6">
            <Link href="/mission" className="hover:opacity-70 transition-opacity">
              Our Mission
            </Link>
            <Link href="/newsletter" className="hover:opacity-70 transition-opacity">
              Newsletter
            </Link>
            <Link href="mailto:account@theopendraft.com" className="hover:opacity-70 transition-opacity">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
