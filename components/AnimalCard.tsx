"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ShareAnimalButton } from "./ShareAnimalButton";

interface AnimalCardProps {
  animal: {
    id: string;
    name: string;
    slug: string;
    species: string;
    photoUrl?: string | null;
    shortStory: string;
    status: string;
    location: string;
    featured: boolean;
  };
  getSpeciesEmoji: (species: string) => string;
  getStatusLabel: (status: string) => string;
}

export function AnimalCard({ animal, getSpeciesEmoji, getStatusLabel }: AnimalCardProps) {
  return (
    <div className="bg-white border border-[#E5E5E5]">
      <Link href={`/animals/${animal.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#FAFAFA]">
          {animal.photoUrl ? (
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getSpeciesEmoji(animal.species)}
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getSpeciesEmoji(animal.species)}</span>
          <Link href={`/animals/${animal.slug}`}>
            <h3 className="text-xl font-semibold text-black hover:opacity-70 transition-opacity">
              {animal.name}
            </h3>
          </Link>
        </div>
        <p className="text-[#212121] text-sm mb-4 line-clamp-2 leading-relaxed">{animal.shortStory}</p>
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
          <span className="text-sm text-[#212121]">📍 {animal.location}</span>
          <div onClick={(e) => e.stopPropagation()}>
            <ShareAnimalButton
              animal={{
                id: animal.id,
                name: animal.name,
                slug: animal.slug,
                shortStory: animal.shortStory,
                photoUrl: animal.photoUrl,
                species: animal.species,
              }}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
