"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AnimalPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
}

export function AnimalPhotoCarousel() {
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch("/api/animal-photos");
        const data = await res.json();
        setPhotos(data);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  // Duplicate photos for seamless infinite scroll
  const duplicatedPhotos = [...photos, ...photos, ...photos];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Animals We're Feeding
        </h2>
        <p className="text-gray-600">
          Real photos from our mission to feed stray animals across India
        </p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-6 px-6 overflow-hidden">
          <div
            className={`flex gap-6 ${isPaused ? "" : "animate-scroll"}`}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
          >
            {duplicatedPhotos.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                className="flex-shrink-0 w-80 h-80 relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                style={{
                  isolation: 'isolate',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
                }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Animal being fed"}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-200 ease-out"
                    style={{
                      transformOrigin: 'center center',
                      willChange: 'transform, filter'
                    }}
                    sizes="320px"
                    unoptimized={photo.imageUrl.startsWith("http")}
                    onError={(e) => {
                      // Hide broken images gracefully
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlays for smooth edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(-320px * ${photos.length} - ${photos.length * 24}px), 0, 0);
          }
        }

        .animate-scroll {
          animation: scroll ${photos.length * 5}s linear infinite;
        }
      `}</style>
    </div>
  );
}
