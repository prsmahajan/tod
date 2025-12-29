import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { generateSEO } from "@/components/SEOHead";
import { ShareAnimalButton } from "@/components/ShareAnimalButton";
import { AnimalCard } from "@/components/AnimalCard";

export const revalidate = 60;

async function getAnimal(slug: string) {
  const animal = await prisma.animal.findUnique({
    where: { slug },
  });

  if (!animal) {
    return null;
  }

  // Get related animals (same species, excluding current)
  const relatedAnimals = await prisma.animal.findMany({
    where: {
      species: animal.species,
      id: { not: animal.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return { animal, relatedAnimals };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getAnimal(params.slug);

  if (!data) {
    return {
      title: "Animal Not Found",
    };
  }

  return generateSEO({
    title: `${data.animal.name} - Meet Our Animals`,
    description: data.animal.shortStory,
    url: `/animals/${params.slug}`,
  });
}

export default async function AnimalPage({ params }: { params: { slug: string } }) {
  const data = await getAnimal(params.slug);

  if (!data) {
    notFound();
  }

  const { animal, relatedAnimals } = data;

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
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      <Link
        href="/animals"
        className="inline-flex items-center gap-2 text-[#212121] hover:opacity-70 transition-opacity mb-8"
      >
        <ArrowLeft size={20} />
        Back to All Animals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Photo Section */}
        <div className="relative">
          {animal.photoUrl ? (
            <div className="relative overflow-hidden border border-[#E5E5E5]">
              <img
                src={animal.photoUrl}
                alt={animal.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-[500px] bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-9xl">
              {getSpeciesEmoji(animal.species)}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{getSpeciesEmoji(animal.species)}</span>
            <h1 className="text-4xl font-semibold text-black">{animal.name}</h1>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-2 bg-[#FAFAFA] text-[#212121] border border-[#E5E5E5] text-sm font-semibold">
              {getStatusLabel(animal.status)}
            </span>
            <span className="px-4 py-2 bg-[#FAFAFA] text-[#212121] border border-[#E5E5E5] text-sm font-semibold">
              {animal.species}
            </span>
          </div>

          <div className="space-y-4 mb-8 text-[#212121]">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{animal.location}, Pune</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                First spotted:{" "}
                {new Date(animal.firstSpottedDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border-l-4 border-[#DC2626] p-6 mb-8">
            <h2 className="text-xl font-semibold text-black mb-2">This is who you'll help feed</h2>
            <p className="text-[#212121] leading-relaxed mb-4">{animal.shortStory}</p>
            <ShareAnimalButton 
              animal={{
                id: animal.id,
                name: animal.name,
                slug: animal.slug,
                shortStory: animal.shortStory,
                photoUrl: animal.photoUrl,
                species: animal.species,
              }}
              variant="default"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-black">Full Story</h2>
            <div className="text-[#212121] leading-relaxed whitespace-pre-wrap">{animal.description}</div>
          </div>
        </div>
      </div>

      {/* Related Animals */}
      {relatedAnimals.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-semibold mb-8 text-black">More {animal.species.toLowerCase()}s</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedAnimals.map((related) => (
              <AnimalCard
                key={related.id}
                animal={related}
                getSpeciesEmoji={getSpeciesEmoji}
                getStatusLabel={getStatusLabel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
