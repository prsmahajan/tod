"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Tag, Trash2, Edit2, X, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    posts: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        toast.success("Category created successfully");
        setName("");
        setDescription("");
        setShowForm(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create category");
      }
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        toast.success("Category updated successfully");
        setEditingId(null);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Tag className="w-7 h-7 text-[#888]" />
            Categories
          </h1>
          <p className="text-[#666] mt-1">Organize your content with categories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setName("");
            setDescription("");
          }}
          className="flex items-center gap-2 bg-white text-[#1a1a1a] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f0f0f0] transition-colors"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                placeholder="e.g., Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none"
                placeholder="Brief description of this category..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-white text-[#1a1a1a] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Creating..." : "Create Category"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-[#3a3a3a] mx-auto mb-4" />
            <p className="text-[#666]">No categories yet</p>
            <p className="text-[#555] text-sm mt-1">Create your first category to organize content</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">Description</th>
                <th className="text-center px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">Posts</th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#252525] transition-colors">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                      </td>
                      <td className="px-6 py-4 text-[#666] text-sm">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="Description..."
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2a2a2a] rounded-full text-sm text-[#888]">
                          {cat._count.posts}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={saving}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-[#666] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#666] text-sm font-mono">{cat.slug}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#888] text-sm">{cat.description || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2a2a2a] rounded-full text-sm text-[#888]">
                          {cat._count.posts}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-2 text-[#888] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-[#888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
