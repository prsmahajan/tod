"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditAnimalPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    species: "DOG",
    photoUrl: "",
    shortStory: "",
    description: "",
    status: "HUNGRY",
    location: "",
    firstSpottedDate: "",
    featured: false,
  });

  useEffect(() => {
    fetchAnimal();
  }, [slug]);

  async function fetchAnimal() {
    setLoading(true);
    try {
      const res = await fetch(`/api/animals/${slug}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch animal");
      }

      const animal = data.animal;
      setFormData({
        name: animal.name,
        slug: animal.slug,
        species: animal.species,
        photoUrl: animal.photoUrl || "",
        shortStory: animal.shortStory,
        description: animal.description,
        status: animal.status,
        location: animal.location,
        firstSpottedDate: new Date(animal.firstSpottedDate).toISOString().split("T")[0],
        featured: animal.featured,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFormData({ ...formData, photoUrl: data.url });
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/animals/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          firstSpottedDate: new Date(formData.firstSpottedDate).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update animal");
      }

      router.push("/admin/animals");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <p className="text-center text-gray-500">Loading animal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/animals" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Animals
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit Animal</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly version</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Species *</label>
            <select
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            >
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="COW">Cow</option>
              <option value="PIGEON">Pigeon</option>
              <option value="BULL">Bull</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            >
              <option value="HUNGRY">Hungry</option>
              <option value="FED_TODAY">Fed Today</option>
              <option value="RESCUED">Rescued</option>
              <option value="ADOPTED">Adopted</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Photo</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full border rounded-lg p-3"
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {formData.photoUrl && (
              <div className="mt-2">
                <img src={formData.photoUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photoUrl: "" })}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove photo
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Short Story (200 chars max) *</label>
          <textarea
            value={formData.shortStory}
            onChange={(e) => setFormData({ ...formData, shortStory: e.target.value })}
            required
            maxLength={200}
            rows={3}
            className="w-full border rounded-lg p-3"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.shortStory.length}/200 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Full Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={6}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Location (Pune area) *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Date First Spotted *</label>
            <input
              type="date"
              value={formData.firstSpottedDate}
              onChange={(e) => setFormData({ ...formData, firstSpottedDate: e.target.value })}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Feature on homepage</span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/animals"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}







