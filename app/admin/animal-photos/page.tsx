"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import Image from "next/image";

interface AnimalPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AnimalPhotosPage() {
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    const res = await fetch("/api/animal-photos?includeInactive=true");
    const data = await res.json();
    setPhotos(data);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function clearSelection() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (caption) formData.append("caption", caption);

    const res = await fetch("/api/animal-photos", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      clearSelection();
      setShowUploadForm(false);
      fetchPhotos();
    } else {
      const error = await res.json();
      alert(error.error || "Upload failed");
    }

    setUploading(false);
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const res = await fetch(`/api/animal-photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });

    if (res.ok) {
      fetchPhotos();
    }
  }

  async function deletePhoto(id: string) {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const res = await fetch(`/api/animal-photos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchPhotos();
    }
  }

  async function updateOrder(id: string, newOrder: number) {
    const res = await fetch(`/api/animal-photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    });

    if (res.ok) {
      fetchPhotos();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Animal Photos</h1>
          <p className="text-gray-600 mt-1">
            Manage photos displayed in the mission page carousel
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Upload Photo
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload New Photo</h2>
            <button
              onClick={() => {
                setShowUploadForm(false);
                clearSelection();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-64">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={40} />
                    <p className="text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="e.g., Feeding stray dogs in Mumbai"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  clearSelection();
                }}
                className="border px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : photos.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No photos yet. Upload your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`border rounded-lg overflow-hidden ${
                  photo.isActive ? "border-green-300" : "border-gray-300"
                }`}
              >
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Animal photo"}
                    fill
                    className="object-cover"
                  />
                  {!photo.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        INACTIVE
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {photo.caption && (
                    <p className="text-sm text-gray-700">{photo.caption}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Order:</label>
                    <input
                      type="number"
                      value={photo.order}
                      onChange={(e) =>
                        updateOrder(photo.id, parseInt(e.target.value))
                      }
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(photo.id, photo.isActive)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        photo.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {photo.isActive ? (
                        <>
                          <Eye size={16} /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} /> Inactive
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Uploaded by {photo.uploader.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
