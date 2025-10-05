// src/app/(routes)/links/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Filter, X, Trash2, ExternalLink, Plus, Grid3x3, List, Calendar } from 'lucide-react';

interface Link {
  id: number;
  url: string;
  title: string;
  source: string;
  category: string;
  tags: string;
  description: string;
  createdAt: string;
}

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  const { data: session, status } = useSession();

  const [filters, setFilters] = useState({
    category: "",
    source: "",
    search: "",
  });

  // Define functions BEFORE useEffect
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/sources");
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    }
  };

  const fetchLinks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/links");
      const data = await response.json();

      if (response.ok) {
        setLinks(data.links);
        setFilteredLinks(data.links);
      } else {
        setError(data.error || "Failed to fetch links");
      }
    } catch (err) {
      setError("An error occurred while fetching links");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...links];

    if (filters.category) {
      filtered = filtered.filter((link) => link.category === filters.category);
    }

    if (filters.source) {
      filtered = filtered.filter((link) => link.source === filters.source);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.title?.toLowerCase().includes(searchLower) ||
          link.description?.toLowerCase().includes(searchLower) ||
          link.tags?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLinks(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
      } else {
        alert("Failed to delete link");
      }
    } catch (err) {
      alert("An error occurred while deleting the link");
    }
  };

  const clearFilters = () => {
    setFilters({ category: "", source: "", search: "" });
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      youtube: "🎥",
      facebook: "👥",
      linkedin: "💼",
      twitter: "🐦",
      instagram: "📷",
      github: "💻",
      medium: "📝",
      reddit: "🤖",
      other: "🔗",
    };
    return icons[source.toLowerCase()] || "🔗";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      education: "bg-blue-100 text-blue-800 border-blue-200",
      music: "bg-purple-100 text-purple-800 border-purple-200",
      movies: "bg-red-100 text-red-800 border-red-200",
      documents: "bg-gray-100 text-gray-800 border-gray-200",
      tech: "bg-green-100 text-green-800 border-green-200",
      news: "bg-yellow-100 text-yellow-800 border-yellow-200",
      social: "bg-pink-100 text-pink-800 border-pink-200",
      other: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return colors[category.toLowerCase()] || "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  // useEffect hooks AFTER function definitions
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchLinks();
    fetchCategories();
    fetchSources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, links]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeFiltersCount = [filters.category, filters.source, filters.search].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl text-white">Loading links...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                My Links
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                {filteredLinks.length} of {links.length} links
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-purple-500/30 rounded-full text-xs">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'} transition-all`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'} transition-all`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => router.push("/")}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 sm:px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-105 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Link
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl animate-shake">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-300" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all text-sm"
                  placeholder="Search by title, tags..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all text-sm"
                >
                  <option value="" className="bg-slate-800">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) =>
                    setFilters({ ...filters, source: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all text-sm"
                >
                  <option value="" className="bg-slate-800">All Sources</option>
                  {sources.map((source) => (
                    <option key={source} value={source} className="bg-slate-800">
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2 px-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Links Display */}
          {filteredLinks.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-4">
                <ExternalLink className="w-10 h-10 text-purple-300" />
              </div>
              <p className="text-gray-300 text-lg mb-2">
                {links.length === 0
                  ? "No links saved yet"
                  : "No links match your filters"}
              </p>
              <p className="text-gray-400 text-sm">
                {links.length === 0
                  ? "Add your first link to get started!"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredLinks.map((link, index) => (
                <div
                  key={link.id}
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 animate-fadeIn ${
                    viewMode === 'list' ? 'flex gap-4' : ''
                  }`}
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">{getSourceIcon(link.source)}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                            link.category
                          )}`}
                        >
                          {link.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-400 hover:text-red-300 font-semibold transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {link.title || "Untitled Link"}
                    </h3>

                    {link.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {link.description}
                      </p>
                    )}

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 text-sm font-medium break-all inline-flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                    </a>

                    {link.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {link.tags.split(",").slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded-lg text-xs border border-purple-500/30"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                        {link.tags.split(",").length > 3 && (
                          <span className="text-gray-400 text-xs py-1">
                            +{link.tags.split(",").length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Added {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}