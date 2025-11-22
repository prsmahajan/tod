"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Calendar, MapPin, Target, CheckCircle2, Mail } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewsletterForm } from "@/components/newsletter-form"

export default function MissionPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-24 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Photo Section */}
              <div className="relative">
                <div className="relative aspect-[4/5] bg-[#FAFAFA] border border-[#E5E5E5] overflow-hidden rounded-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=1000&fit=crop&q=80"
                    alt="Feeding stray animals in Pune"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
              </div>

              {/* Story Section */}
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight text-black">
                  Why I Started This
                </h1>
                <div className="space-y-4 text-base leading-relaxed text-[#212121]">
                  <p>
                    I live in Pune, a city I love. But every day, I walk past stray dogs, cats, and cows who are hungry. 
                    <strong className="text-[#DC2626]"> Really hungry.</strong>
                  </p>
                  <p>
                    I started feeding them whenever I could—a few rotis here, some rice there. But I realized something: 
                    <em className="text-black"> my small efforts weren't enough.</em> There are thousands of animals, and I'm just one person.
                  </p>
                  <p className="text-lg text-[#DC2626]">
                    So I decided to do something bigger. Something that could actually make a difference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline/Story Section */}
        <section className="py-16 px-4 bg-[#FAFAFA]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-semibold mb-12 text-center text-black">
              The Day I Decided to Act
            </h2>

            <div className="space-y-8">
              {/* The Incident */}
              <div className="bg-white border-l-4 border-[#DC2626] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-[#DC2626]" size={24} />
                  <span className="text-lg font-semibold text-black">The Moment That Changed Everything</span>
                </div>
                <p className="text-base text-[#212121] leading-relaxed mb-4">
                  It was a hot afternoon in Pune. I saw a mother dog trying to feed her puppies, but she was so thin, 
                  so weak. She had nothing to give them. The puppies were crying, and she just looked at me with eyes 
                  that said everything.
                </p>
                <p className="text-base text-[#212121] leading-relaxed">
                  <strong className="text-[#DC2626]">That's when I knew.</strong> I couldn't just walk away anymore. 
                  I had to find a way to help—not just this one family, but all the animals who have no one.
                </p>
              </div>

              {/* Current Reality */}
              <div className="bg-white border-l-4 border-[#DC2626] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-[#DC2626]" size={24} />
                  <span className="text-lg font-semibold text-black">The Reality in Pune Today</span>
                </div>
                <p className="text-base text-[#212121] leading-relaxed mb-4">
                  Every single day, thousands of stray animals in Pune go hungry. Dogs searching through garbage. 
                  Cats hiding in corners. Cows wandering the streets, looking for something to eat.
                </p>
                <p className="text-base text-[#212121] leading-relaxed">
                  They didn't choose this life. They depend on us. And right now, <em className="text-[#DC2626]">we're failing them.</em>
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white border-l-4 border-[#DC2626] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-[#DC2626]" size={24} />
                  <span className="text-lg font-semibold text-black">My Vision for the Future</span>
                </div>
                <p className="text-base text-[#212121] leading-relaxed mb-4">
                  I want to create something sustainable. Something that doesn't depend on one person's ability to give, 
                  but on a community that cares.
                </p>
                <p className="text-base text-[#212121] leading-relaxed">
                  Imagine if thousands of people came together, each giving just <strong className="text-[#DC2626] text-lg">₹10 a month</strong>. 
                  That's less than a cup of coffee. But together? <em className="text-[#DC2626]">That's thousands of meals for animals who have nothing.</em>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Transparency */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center text-black">
              How It Works
            </h2>
            <p className="text-base text-center text-[#212121] mb-12">
              Complete transparency. Every rupee accounted for.
            </p>

            {/* ₹10 Breakdown */}
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-8 mb-12">
              <h3 className="text-2xl font-semibold mb-8 text-center text-black">
                Your ₹10 Breakdown
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-[#E5E5E5] p-6 text-center">
                  <div className="text-4xl font-semibold text-[#212121] mb-2">₹8.50</div>
                  <div className="text-sm text-[#212121] mb-2">Direct to Animals</div>
                  <div className="text-lg font-semibold text-black">85%</div>
                </div>
                <div className="bg-white border border-[#E5E5E5] p-6 text-center">
                  <div className="text-4xl font-semibold text-[#212121] mb-2">₹1.00</div>
                  <div className="text-sm text-[#212121] mb-2">Operational Costs</div>
                  <div className="text-lg font-semibold text-black">10%</div>
                </div>
                <div className="bg-white border border-[#E5E5E5] p-6 text-center">
                  <div className="text-4xl font-semibold text-[#212121] mb-2">₹0.50</div>
                  <div className="text-sm text-[#212121] mb-2">Payment Processing</div>
                  <div className="text-lg font-semibold text-black">5%</div>
                </div>
              </div>

              <div className="bg-white border-l-4 border-[#DC2626] p-6">
                <p className="text-base text-[#212121] leading-relaxed">
                  <strong className="text-[#DC2626]">Why ₹10?</strong> Because everyone should be able to help. 
                  A student, a working professional, a retiree—₹10 is something we can all afford. 
                  It's not about how much you give. <em className="text-black">It's about coming together.</em>
                </p>
              </div>
            </div>

            {/* My Commitment */}
            <div className="bg-black text-white p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">My Commitment to You</h3>
              <div className="space-y-4 text-base">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-white flex-shrink-0 mt-1" size={24} />
                  <p>
                    <strong>Monthly Reports:</strong> Every month, I'll publish exactly how much was collected, 
                    how much was spent, and where the food went.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-white flex-shrink-0 mt-1" size={24} />
                  <p>
                    <strong>Photos & Videos:</strong> You'll see the animals being fed. Real moments. Real impact.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-white flex-shrink-0 mt-1" size={24} />
                  <p>
                    <strong>100% Transparency:</strong> Every rupee tracked. Every meal documented. 
                    This is my promise to you, and to the animals.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-white flex-shrink-0 mt-1" size={24} />
                  <p>
                    <strong>Accountability:</strong> If you ever have questions, I'm here. 
                    Email me. Ask me anything. This is personal for me, and I want you to trust this mission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - Waitlist */}
        <section className="py-16 px-4 bg-[#FAFAFA]">
          <div className="max-w-[1200px] mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <Heart className="text-[#DC2626]" size={40} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-semibold mb-6 text-black">
              Join Me in This Mission
            </h2>
            <p className="text-base text-[#212121] mb-4 leading-relaxed max-w-2xl mx-auto">
              I'm still setting up the payment system, but I'd love to know if you're interested.
            </p>
            <p className="text-base text-[#212121] mb-10 leading-relaxed max-w-2xl mx-auto">
              Join the waitlist, and I'll notify you the moment subscriptions are ready. 
              Together, we can make a real difference.
            </p>

            {/* Waitlist Form */}
            <div className="bg-white border border-[#E5E5E5] p-8 max-w-xl mx-auto">
              <NewsletterForm />
              <p className="text-sm text-[#212121] mt-6 text-center">
                No spam. Just a notification when we're ready. That's it.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
