"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

interface Animal {
  id: string;
  name: string;
  slug: string;
  species: string;
  photoUrl: string | null;
  shortStory: string;
  location: string;
  status: string;
}

export function FeaturedAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/animals/featured")
      .then((res) => res.json())
      .then((data) => {
        setAnimals(data.animals || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500">Loading featured animals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!animals.length) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Friends 🐾
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every subscription helps feed these beautiful souls and many more like them
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <Link
              key={animal.id}
              href={`/animals/${animal.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64 bg-gray-200">
                {animal.photoUrl ? (
                  <Image
                    src={animal.photoUrl}
                    alt={animal.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Heart size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                  {animal.species}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {animal.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin size={16} />
                  <span className="text-sm">{animal.location}</span>
                </div>
                <p className="text-gray-700 line-clamp-3">{animal.shortStory}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all">
                  Read their story
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/impact"
            className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
          >
            See All Animals We Help
          </Link>
        </div>
      </div>
    </section>
  );
}
