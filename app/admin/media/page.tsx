"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Trash2,
  Search,
  Grid,
  List,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Media {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TYPE_ICONS: Record<string, any> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  AUDIO: Music,
};

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
  });
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; mediaId: string | null }>({ show: false, mediaId: null });
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [page, filters]);

  async function fetchMedia() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "24");
      if (filters.type) params.set("type", filters.type);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      setMedia(data.media || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file(s) successfully`);
      fetchMedia();
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} file(s)`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function showDeleteModal(id: string) {
    setDeleteModal({ show: true, mediaId: id });
  }

  function closeDeleteModal() {
    setDeleteModal({ show: false, mediaId: null });
  }

  async function confirmDelete() {
    if (!deleteModal.mediaId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media?id=${deleteModal.mediaId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("File deleted");
      setMedia((prev) => prev.filter((m) => m.id !== deleteModal.mediaId));
      setSelectedMedia(null);
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
    }
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const TypeIcon = ({ type }: { type: string }) => {
    const Icon = TYPE_ICONS[type] || FileText;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-gray-600 mt-1">
            Manage your images, videos, and documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className={`flex items-center gap-2 px-4 py-2 bg-[#fff] border-2 border-black cursor-pointer ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Files"}
          </label>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, search: e.target.value }));
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters((f) => ({ ...f, type: e.target.value }));
                setPage(1);
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="IMAGE">Images</option>
              <option value="VIDEO">Videos</option>
              <option value="AUDIO">Audio</option>
              <option value="DOCUMENT">Documents</option>
            </select>
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded ${
                view === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded ${
                view === "list" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No media found</h2>
          <p className="text-gray-600 mt-2">
            Upload files to get started
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedMedia?.id === item.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {item.type === "IMAGE" ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TypeIcon type={item.type} />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.originalName}</p>
                <p className="text-xs text-gray-500">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">File</th>
                <th className="text-left p-4 font-semibold">Type</th>
                <th className="text-left p-4 font-semibold">Size</th>
                <th className="text-left p-4 font-semibold">Uploaded</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.type === "IMAGE" ? (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <TypeIcon type={item.type} />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-xs">
                        {item.originalName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.type}</td>
                  <td className="p-4 text-gray-600">{formatSize(item.size)}</td>
                  <td className="p-4 text-gray-600">{formatDate(item.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(item.url, item.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteModal(item.id);
                        }}
                        className="p-2 hover:bg-red-50 text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} files
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Media Details Sidebar */}
      {selectedMedia && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">File Details</h3>
            <button
              onClick={() => setSelectedMedia(null)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {selectedMedia.type === "IMAGE" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || selectedMedia.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedMedia.type === "VIDEO" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-full"
                />
              ) : (
                <TypeIcon type={selectedMedia.type} />
              )}
            </div>

            {/* File Info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Filename
                </label>
                <p className="font-medium break-all">{selectedMedia.originalName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Type
                  </label>
                  <p>{selectedMedia.type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Size
                  </label>
                  <p>{formatSize(selectedMedia.size)}</p>
                </div>
              </div>

              {selectedMedia.width && selectedMedia.height && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Dimensions
                  </label>
                  <p>
                    {selectedMedia.width} × {selectedMedia.height}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Uploaded by
                </label>
                <p>{selectedMedia.uploader?.name || "Unknown"}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Date
                </label>
                <p>{formatDate(selectedMedia.createdAt)}</p>
              </div>

              {/* URL Copy */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  URL
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={selectedMedia.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border rounded text-sm truncate"
                  />
                  <button
                    onClick={() => copyUrl(selectedMedia.url, selectedMedia.id)}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    {copiedId === selectedMedia.id ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={() => showDeleteModal(selectedMedia.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={18} />
              Delete File
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-[#1e1e1e] border-2 border-[#2a2a2a] w-full max-w-md mx-4">
            <div className="p-6 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white">Delete File</h3>
            </div>

            <div className="p-6">
              <p className="text-[#888]">
                Are you sure you want to delete this file? This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-[#2a2a2a] flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-white text-black border-2 border-black hover:bg-[#f5f5f5] disabled:opacity-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
