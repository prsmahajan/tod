import Image from "next/image"
import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"
import { Heart } from "lucide-react"
import { memo } from "react"

function Hero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 py-12 sm:py-16 px-4">
      {/* Logo */}
      <div className="place-items-center">
        <Image
          src="/images/logo-dark.png"
          alt="The Open Draft logo"
          width={100}
          height={100}
          className="rounded-xl shadow-lg"
          priority
        />
      </div>

      {/* Main Heading */}
      <div className="text-center space-y-4">
        <h1 className="text-balance font-sans text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          <span className="font-serif text-gray-900 dark:text-gray-100">
            The Open Draft
          </span>
        </h1>
        <p className="text-xl sm:text-2xl font-medium text-gray-700 dark:text-gray-300">
          Technology Explained, Simply
        </p>
      </div>

      {/* Mission Banner */}
      <div className="w-full max-w-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={24} className="text-red-600 dark:text-red-400 fill-current" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Our Purpose</h2>
        </div>
        <p className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          Every subscription helps feed <strong className="text-red-600 dark:text-red-400">stray animals across India</strong>.
          Learn tech, save lives. <Link href="/mission" className="text-blue-600 dark:text-blue-400 underline font-semibold">Read our story →</Link>
        </p>
      </div>

      {/* Description */}
      <p className="text-pretty max-w-2xl text-center text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
        Helping you understand the technology that runs your systems, protects your data, and drives growth—so you can
        lead confidently in a digital world.
      </p>

      {/* CTA Box */}
      <div className="w-full max-w-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 sm:p-8 shadow-md">
        <h2 className="text-center text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          📬 Join Our Newsletter
        </h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get weekly insights on technology, explained in simple terms
        </p>
        <NewsletterForm className="mt-0" />
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-center mt-4">
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">Free</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Always</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">Weekly</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Updates</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">No Spam</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Guaranteed</span>
        </div>
      </div>
    </section>
  )
}

export default memo(Hero)