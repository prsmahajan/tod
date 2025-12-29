import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"
import { Heart } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                The Open Draft
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-md">
                Technology explained simply. Every subscription feeds stray animals across India. Learn tech, save lives.
              </p>
            </div>
            <Link
              href="/mission"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Learn about our mission →
            </Link>
          </div>
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-2">
                Join Our Newsletter
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get updates on our impact and new articles
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              © 2025 The Open Draft. Built with <Heart className="w-4 h-4 text-red-500 inline" fill="currentColor" /> for animals.
            </p>
            <nav className="flex gap-6 text-sm">
              <Link href="/mission" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Our Mission
              </Link>
              <Link href="/articles" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Articles
              </Link>
              <Link href="mailto:account@theopendraft.com" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
