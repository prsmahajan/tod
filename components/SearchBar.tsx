"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import Link from "next/link";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

interface SearchResult {
  posts: Post[];
  count: number;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPosts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data: SearchResult = await res.json();
        setResults(data.posts);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-12 pr-12 py-3 border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent)] focus:outline-none bg-[var(--color-card-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-[var(--color-card-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] max-h-[500px] overflow-y-auto z-50">
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  onClick={() => setShowResults(false)}
                  className="block px-4 py-3 hover:bg-[var(--color-bg)] border-b border-[var(--color-border)] last:border-b-0 transition-colors"
                >
                  <div className="flex gap-3">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        {post.categories.length > 0 && (
                          <span className="px-2 py-0.5 bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-full border border-[var(--color-border)]">
                            {post.categories[0].category.name}
                          </span>
                        )}
                        {post.publishedAt && (
                          <time>
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
