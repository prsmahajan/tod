"use client"

import { Instagram, ExternalLink } from "lucide-react"
import Image from "next/image"

const INSTAGRAM_USERNAME = "theopendraft"
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`

const placeholderPosts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop&q=80",
    caption: "Feeding stray dogs in Pune 🐕",
    url: INSTAGRAM_URL,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop&q=80",
    caption: "Every meal makes a difference ❤️",
    url: INSTAGRAM_URL,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=600&fit=crop&q=80",
    caption: "Join our mission to feed animals",
    url: INSTAGRAM_URL,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=600&fit=crop&q=80",
    caption: "Helping animals one meal at a time",
    url: INSTAGRAM_URL,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop&q=80",
    caption: "Community coming together",
    url: INSTAGRAM_URL,
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop&q=80",
    caption: "Making a real difference",
    url: INSTAGRAM_URL,
  },
]

export function InstagramFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-black">
            Follow Our Journey
          </h2>
          <p className="text-base text-[#212121] max-w-2xl mx-auto">
            See real-time updates, photos, and stories of animals we're feeding. Join our community!
          </p>
        </div>

        {/* Instagram Posts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          {placeholderPosts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden bg-[#FAFAFA] border border-[#E5E5E5]">
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                />
              </div>
              <p className="mt-2 text-sm text-[#212121] line-clamp-2">{post.caption}</p>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            <Instagram size={20} />
            Follow @{INSTAGRAM_USERNAME} on Instagram
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
