"use client"
import Image from "next/image"
import Link from "next/link"
import { NewsletterForm } from "./newsletter-form"
import { Heart } from "lucide-react"
import { memo } from "react"

function Hero() {
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 md:gap-16 py-16 md:py-24 px-4 bg-white dark:bg-black">
      {/* Main Heading */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-black dark:text-white">
          The Open Draft
        </h1>
        <p className="text-base md:text-lg text-[#212121] dark:text-gray-300">
          Technology Explained, Simply
        </p>
      </div>

      {/* Photo Section - Placeholder for photo with animal */}
      <div className="w-full max-w-2xl">
        <div className="relative aspect-[4/3] bg-[#FAFAFA] dark:bg-[#212121] border border-[#E5E5E5] dark:border-[#404040] overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=900&fit=crop&q=80"
            alt="Person feeding stray animals in India"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
      </div>

      {/* Mission Statement */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <p className="text-base md:text-lg leading-relaxed text-[#212121] dark:text-gray-300">
          Every subscription helps feed <strong className="text-[#DC2626]">stray animals across India</strong>.
          Learn tech, save lives.
        </p>
        <Link
          href="/mission"
          className="inline-block text-sm md:text-base text-[#212121] dark:text-gray-300 underline hover:opacity-70 transition-opacity focus:outline-2 focus:outline-[#DC2626]"
        >
          Read our story →
        </Link>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-black dark:text-white">
            Join Our Waitlist
          </h2>
          <p className="text-sm md:text-base text-[#212121] dark:text-gray-300">
            Be among the first 1,000 Feeders + get first access when we launch
          </p>
        </div>
        <NewsletterForm className="mt-0" />
      </div>
    </section>
  )
}

export default memo(Hero)
