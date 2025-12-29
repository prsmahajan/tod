"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Animal {
  id: string;
  name: string;
  slug: string;
  species: string;
  photoUrl: string | null;
  shortStory: string;
  status: string;
  location: string;
  featured: boolean;
  createdAt: string;
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimals();
  }, []);

  async function fetchAnimals() {
    setLoading(true);
    const res = await fetch("/api/animals");
    const data = await res.json();
    setAnimals(data);
    setLoading(false);
  }

  async function deleteAnimal(slug: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const res = await fetch(`/api/animals/${slug}`, { method: "DELETE" });
    if (res.ok) {
      fetchAnimals();
    } else {
      alert("Failed to delete animal");
    }
  }

  const getSpeciesBadge = (species: string) => {
    const colors: Record<string, string> = {
      DOG: "bg-blue-200 text-blue-800",
      CAT: "bg-purple-200 text-purple-800",
      COW: "bg-brown-200 text-brown-800",
      PIGEON: "bg-gray-200 text-gray-800",
      BULL: "bg-red-200 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[species] || "bg-gray-200"}`}>
        {species}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      HUNGRY: "bg-red-200 text-red-800",
      FED_TODAY: "bg-green-200 text-green-800",
      RESCUED: "bg-blue-200 text-blue-800",
      ADOPTED: "bg-purple-200 text-purple-800",
    };
    const displayStatus = status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || "bg-gray-200"}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Animals</h1>
        <Link
          href="/admin/animals/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Animal
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading animals...</p>
        ) : animals.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No animals found. Add your first animal!</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Photo</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Species</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Location</th>
                <th className="text-left p-4 font-semibold">Featured</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((animal) => (
                <tr key={animal.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {animal.photoUrl ? (
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No photo
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/animals/${animal.slug}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {animal.name}
                    </Link>
                  </td>
                  <td className="p-4">{getSpeciesBadge(animal.species)}</td>
                  <td className="p-4">{getStatusBadge(animal.status)}</td>
                  <td className="p-4 text-gray-600">{animal.location}</td>
                  <td className="p-4">
                    {animal.featured ? (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/animals/${animal.slug}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => deleteAnimal(animal.slug, animal.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}







