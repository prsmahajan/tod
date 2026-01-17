"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EnhancedEditor } from "@/components/editor/EnhancedEditor";
import { toast } from "sonner";
import {
  ArrowLeft,
  History,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  Search,
  Eye,
  Save,
} from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  scheduledFor: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
}

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  changeNote: string | null;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface VersionDetails {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  changeNote: string | null;
  createdAt: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  // Post state
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [scheduledFor, setScheduledFor] = useState("");
  const [changeNote, setChangeNote] = useState("");

  // SEO state
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionDetails | null>(null);
  const [showVersionPreview, setShowVersionPreview] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Post not found");

      const data = await res.json();
      setPost(data);
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || "");
      setContent(data.content);
      setCoverImage(data.coverImage || "");
      setStatus(data.status);
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
      setKeywords(data.keywords || []);
      setOgImage(data.ogImage || "");
      setCanonicalUrl(data.canonicalUrl || "");
      setNoIndex(data.noIndex || false);

      if (data.scheduledFor) {
        const date = new Date(data.scheduledFor);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setScheduledFor(localDateTime);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchVersions() {
    if (versions.length > 0) return; // Already loaded

    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/posts/${postId}/versions`);
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      toast.error("Failed to load version history");
    } finally {
      setLoadingVersions(false);
    }
  }

  async function fetchVersionDetails(versionId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = await res.json();
      setSelectedVersion(data);
      setShowVersionPreview(true);
    } catch (error) {
      toast.error("Failed to load version details");
    }
  }

  async function restoreVersion(versionId: string) {
    if (!confirm("Are you sure you want to restore this version? Current changes will be saved as a new version.")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/versions/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      if (!res.ok) throw new Error("Failed to restore version");

      toast.success("Version restored successfully");
      setShowVersionPreview(false);
      setSelectedVersion(null);
      setVersions([]); // Clear to force refresh
      await fetchPost();
    } catch (error) {
      toast.error("Failed to restore version");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          coverImage,
          status,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          changeNote: changeNote || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          keywords,
          ogImage: ogImage || undefined,
          canonicalUrl: canonicalUrl || undefined,
          noIndex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update post");
      }

      toast.success("Post saved successfully");
      setChangeNote("");
      setVersions([]); // Clear to force refresh on next open
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addKeyword() {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  }

  function removeKeyword(keyword: string) {
    setKeywords(keywords.filter((k) => k !== keyword));
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Link href="/admin/posts" className="text-blue-600 mt-4 inline-block">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/posts" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Posts
        </Link>
        <button
          onClick={() => {
            setShowVersionHistory(!showVersionHistory);
            if (!showVersionHistory) fetchVersions();
          }}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <History size={18} />
          Version History
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main Editor */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border rounded-lg p-3 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Content *</label>
              <EnhancedEditor content={content} onChange={setContent} />
            </div>

            {/* SEO Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSEO(!showSEO)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search size={18} />
                  <span className="font-semibold">SEO Settings</span>
                </div>
                {showSEO ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showSEO && (
                <div className="p-4 space-y-4 border-t">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title}
                      maxLength={60}
                      className="w-full border rounded-lg p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Brief description for search results..."
                      maxLength={160}
                      rows={2}
                      className="w-full border rounded-lg p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                        placeholder="Add keyword..."
                        className="flex-1 border rounded-lg p-2"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-blue-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">OG Image URL</label>
                    <input
                      type="url"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Social media preview image URL"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Canonical URL</label>
                    <input
                      type="url"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="noIndex"
                      checked={noIndex}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="noIndex" className="text-sm">
                      Exclude from search engines (noindex)
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {status === "SCHEDULED" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Schedule For *</label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    required={status === "SCHEDULED"}
                    className="w-full border rounded-lg p-3"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Change Note (Optional)</label>
              <input
                type="text"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Brief description of changes..."
                className="w-full border rounded-lg p-3"
              />
              <p className="text-xs text-gray-500 mt-1">This will be recorded in the version history</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href="/admin/posts"
                className="border px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="w-80 shrink-0">
            <div className="bg-white border rounded-lg sticky top-4">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <History size={18} />
                  Version History
                </h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {loadingVersions ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : versions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No previous versions
                  </div>
                ) : (
                  <div className="divide-y">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => fetchVersionDetails(version.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            Version {version.versionNumber}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreVersion(version.id);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Restore this version"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{version.title}</p>
                        {version.changeNote && (
                          <p className="text-xs text-gray-500 mt-1 italic truncate">
                            "{version.changeNote}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatDate(version.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <User size={12} />
                          <span>{version.createdBy?.name || "Unknown"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Version Preview Modal */}
      {showVersionPreview && selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowVersionPreview(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-semibold">Version {selectedVersion.versionNumber}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedVersion.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => restoreVersion(selectedVersion.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RotateCcw size={16} />
                  Restore This Version
                </button>
                <button
                  onClick={() => setShowVersionPreview(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <h2 className="text-2xl font-bold mb-4">{selectedVersion.title}</h2>
              {selectedVersion.excerpt && (
                <p className="text-gray-600 mb-4 italic">{selectedVersion.excerpt}</p>
              )}
              {selectedVersion.coverImage && (
                <img
                  src={selectedVersion.coverImage}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
