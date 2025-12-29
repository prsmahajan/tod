import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimalCard } from "./AnimalCard";

export async function FeaturedAnimals() {
  try {
    const animals = await prisma.animal.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    if (animals.length === 0) {
      return null;
    }

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

    const getStatusLabel = (status: string) => {
      return status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-semibold mb-2 text-black">
                Meet Our Animals
              </h2>
              <p className="text-base text-[#212121]">These are the animals you'll help feed and care for</p>
            </div>
            <Link
              href="/animals"
              className="text-[#212121] hover:opacity-70 font-semibold flex items-center gap-2 transition-opacity"
            >
              Meet Them All
              <ArrowRight size={20} />
            </Link>
          </div>

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
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching featured animals:", error);
    return null;
  }
}

export default FeaturedAnimals;
