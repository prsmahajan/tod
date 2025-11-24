"use client";

import { Instagram } from "lucide-react";
import Image from "next/image";

export function InstagramFeed() {
  // Placeholder images - in production, you'd fetch from Instagram API or static images
  const posts = [
    {
      id: "1",
      image: "/images/placeholder-animal-1.jpg",
      alt: "Animal rescue story",
    },
    {
      id: "2",
      image: "/images/placeholder-animal-2.jpg",
      alt: "Community impact",
    },
    {
      id: "3",
      image: "/images/placeholder-animal-3.jpg",
      alt: "Happy animal",
    },
    {
      id: "4",
      image: "/images/placeholder-animal-4.jpg",
      alt: "Feeding time",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram size={32} className="text-pink-600" />
            <h2 className="text-4xl font-bold text-gray-900">
              Follow Our Journey
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            See daily updates of the animals we help and the impact you make
          </p>
          <a
            href="https://instagram.com/theopendraft"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700 transition-colors"
          >
            <Instagram size={20} />
            @theopendraft
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/theopendraft"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Instagram size={48} className="text-gray-300" />
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram
                  size={32}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com/theopendraft"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-orange-700 transition-all shadow-lg"
          >
            <Instagram size={20} />
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
