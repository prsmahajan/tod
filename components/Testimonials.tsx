"use client"

import { Quote, Heart } from "lucide-react"

export function Testimonials() {
  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-black">
            Stories from Our Community
          </h2>
          <p className="text-base text-[#212121] max-w-2xl mx-auto">
            Real experiences from people who are part of our mission
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white border border-[#E5E5E5] p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Quote className="text-[#DC2626]" size={32} />
            <h3 className="text-2xl font-semibold text-black">Coming Soon</h3>
          </div>
          <div className="space-y-6">
            <p className="text-base text-[#212121] leading-relaxed italic">
              "Stories from our community coming soon"
            </p>
            <p className="text-base text-[#212121]">
              We're building a community of people who care about technology and animals. 
              As our community grows, we'll share inspiring stories, testimonials, and experiences here.
            </p>
            <div className="pt-6 border-t border-[#E5E5E5]">
              <p className="text-sm text-[#212121]">
                Have a story to share? <a href="/community" className="text-[#212121] underline hover:opacity-70 transition-opacity">Join our community</a> and let us know!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
