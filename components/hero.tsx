"use client"
import Image from "next/image"
import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"
import { Heart, ArrowRight } from "lucide-react"
import { memo } from "react"

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto">
        {/* Main Heading */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50">
            Feed Stray Animals
            <span className="block text-blue-600 dark:text-blue-400 mt-2">While Learning Tech</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Every subscription helps feed hungry animals across India. Learn technology in simple terms, save lives.
          </p>
        </div>

        {/* Image */}
        <div className="mb-16 rounded-xl overflow-hidden shadow-lg">
          <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800">
            <Image
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=900&fit=crop&q=80"
              alt="Person feeding stray animals in India"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        </div>

        {/* Impact Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 text-center">
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">1,000</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Target Subscribers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">2,000</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Meals/Month Goal</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">₹10</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Per Month</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
              Join Our Waitlist
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Be among the first 1,000 Feeders. Get early access when we launch.
            </p>
          </div>
          <NewsletterForm />
          <div className="mt-6 text-center">
            <Link
              href="/mission"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Learn about our mission
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(Hero)
