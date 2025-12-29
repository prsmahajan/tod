"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, SortAsc } from "lucide-react";
import { AnimalCard } from "@/components/AnimalCard";

interface Animal {
  id: string;
  name: string;
  slug: string;
  species: string;
  photoUrl: string | null;
  shortStory: string;
  status: string;
  location: string;
  firstSpottedDate: string;
  featured: boolean;
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchAnimals();
  }, [speciesFilter, sortBy]);

  async function fetchAnimals() {
    setLoading(true);
    const params = new URLSearchParams();
    if (speciesFilter !== "all") {
      params.append("species", speciesFilter);
    }
    params.append("sort", sortBy);

    const res = await fetch(`/api/animals?${params.toString()}`);
    const data = await res.json();
    setAnimals(data);
    setLoading(false);
  }

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      DOG: "🐕",
      CAT: "🐱",
      COW: "🐄",
      PIGEON: "🕊️",
      BULL: "🐂",
    };
    return emojis[species] || "🐾";
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold mb-4 text-black">Meet Our Animals</h1>
        <p className="text-base text-[#212121] max-w-2xl mx-auto">
          Each animal has a story. Each story deserves to be told. Meet the animals you'll help feed
          and care for.
        </p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#212121]" />
            <span className="font-semibold text-[#212121]">Filter:</span>
          </div>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="border border-[#E5E5E5] rounded-lg px-4 py-2 bg-white text-[#212121] focus:outline-none focus:border-[#212121]"
          >
            <option value="all">All Species</option>
            <option value="DOG">Dogs</option>
            <option value="CAT">Cats</option>
            <option value="COW">Cows</option>
            <option value="PIGEON">Pigeons</option>
            <option value="BULL">Bulls</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SortAsc size={20} className="text-[#212121]" />
            <span className="font-semibold text-[#212121]">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#E5E5E5] rounded-lg px-4 py-2 bg-white text-[#212121] focus:outline-none focus:border-[#212121]"
          >
            <option value="newest">Newest First</option>
            <option value="most-urgent">Most Urgent</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#212121]">Loading animals...</p>
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#212121]">No animals found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              getSpeciesEmoji={getSpeciesEmoji}
              getStatusLabel={getStatusLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
