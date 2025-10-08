"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Filter, X, Trash2, ExternalLink, Plus, Grid3x3, List, Calendar, Edit2, Copy, Check, ChevronDown, SortAsc, Star, StarOff, Archive, Download, Share2, Eye, EyeOff } from 'lucide-react';

interface Link {
  id: number;
  url: string;
  title: string;
  source: string;
  category: string;
  tags: string;
  description: string;
  createdAt: string;
  visibility?: string;
  groupId?: number;
}

export default function ImprovedLinksPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'category'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    category: "",
    source: "",
    search: "",
    visibility: "",
    favorites: false
  });

  // Fetch functions
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

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Initial data fetch
  useEffect(() => {
    if (status === "authenticated") {
      fetchLinks();
      fetchCategories();
      fetchSources();
    }
  }, [status]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, links, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...links];

    if (filters.category) {
      filtered = filtered.filter((link) => link.category === filters.category);
    }

    if (filters.source) {
      filtered = filtered.filter((link) => link.source === filters.source);
    }

    if (filters.visibility) {
      filtered = filtered.filter((link) => link.visibility === filters.visibility);
    }

    if (filters.favorites) {
      filtered = filtered.filter((link) => favorites.has(link.id));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.title?.toLowerCase().includes(searchLower) ||
          link.description?.toLowerCase().includes(searchLower) ||
          link.tags?.toLowerCase().includes(searchLower) ||
          link.url?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredLinks(filtered);
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
        setSelectedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        alert("Failed to delete link");
      }
    } catch (err) {
      alert("An error occurred while deleting the link");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLinks.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLinks.size} link(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedLinks).map(id =>
        fetch(`/api/links?id=${id}`, { method: "DELETE" })
      );
      
      await Promise.all(deletePromises);
      
      setLinks(links.filter((link) => !selectedLinks.has(link.id)));
      setSelectedLinks(new Set());
    } catch (err) {
      alert("An error occurred while deleting links");
    }
  };

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectLink = (id: number) => {
    const newSelected = new Set(selectedLinks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLinks(newSelected);
  };

  const clearFilters = () => {
    setFilters({ category: "", source: "", search: "", visibility: "", favorites: false });
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      youtube: "🎥", facebook: "👥", linkedin: "💼", twitter: "🦤",
      instagram: "📷", github: "💻", medium: "📝", reddit: "🤖", other: "🔗"
    };
    return icons[source.toLowerCase()] || "🔗";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      education: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      music: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      movies: "bg-red-500/20 text-red-300 border-red-500/30",
      documents: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      tech: "bg-green-500/20 text-green-300 border-green-500/30",
      news: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      other: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getVisibilityIcon = (visibility?: string) => {
    if (visibility === 'public') return <Eye className="w-3 h-3" />;
    if (visibility === 'group') return <Share2 className="w-3 h-3" />;
    return <EyeOff className="w-3 h-3" />;
  };

  const activeFiltersCount = [
    filters.category,
    filters.source,
    filters.search,
    filters.visibility,
    filters.favorites && 'favorites'
  ].filter(Boolean).length;

  const exportLinks = () => {
    const dataStr = JSON.stringify(filteredLinks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `links-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading links...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Stats */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Link Library
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {filteredLinks.length} of {links.length} links
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {favorites.size} favorites
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                } ${activeFiltersCount > 0 ? 'ring-2 ring-purple-400' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={exportLinks}
                className="bg-white/10 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                title="Export links"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-6 animate-slideDown">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                  placeholder="Search..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="" className="bg-slate-800">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="" className="bg-slate-800">All Sources</option>
                  {sources.map((src) => (
                    <option key={src} value={src} className="bg-slate-800">
                      {src.charAt(0).toUpperCase() + src.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Visibility</label>
                <select
                  value={filters.visibility}
                  onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="" className="bg-slate-800">All</option>
                  <option value="private" className="bg-slate-800">Private</option>
                  <option value="public" className="bg-slate-800">Public</option>
                  <option value="group" className="bg-slate-800">Group</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="newest" className="bg-slate-800">Newest First</option>
                  <option value="oldest" className="bg-slate-800">Oldest First</option>
                  <option value="title" className="bg-slate-800">Title (A-Z)</option>
                  <option value="category" className="bg-slate-800">Category</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.favorites}
                  onChange={(e) => setFilters({ ...filters, favorites: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <Star className="w-4 h-4 text-yellow-400" />
                Show Favorites Only
              </label>

              <button
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
                className="bg-white/10 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 animate-shake">
            {error}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedLinks.size > 0 && (
          <div className="bg-purple-500/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-4 mb-6 flex items-center justify-between">
            <span className="text-white font-semibold">
              {selectedLinks.size} link{selectedLinks.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedLinks(new Set())}
                className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Links Display */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-4">
                <ExternalLink className="w-10 h-10 text-purple-300" />
              </div>
              <p className="text-gray-300 text-lg mb-2">
                {links.length === 0 ? "No links saved yet" : "No links match your filters"}
              </p>
              <p className="text-gray-400 text-sm">
                {links.length === 0 ? "Add your first link to get started!" : "Try adjusting your filters"}
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
                  className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 ${
                    viewMode === 'list' ? 'flex gap-4' : ''
                  } ${selectedLinks.has(link.id) ? 'ring-2 ring-purple-500' : ''}`}
                  style={{animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`}}
                >
                  {/* Selection Checkbox */}
                  <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedLinks.has(link.id)}
                      onChange={() => toggleSelectLink(link.id)}
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xl">{getSourceIcon(link.source)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(link.category)}`}>
                            {link.category}
                          </span>
                          <span className="text-gray-400" title={link.visibility}>
                            {getVisibilityIcon(link.visibility)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(link.id)}
                            className={`p-2 rounded-lg transition-all ${
                              favorites.has(link.id)
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                            title={favorites.has(link.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {favorites.has(link.id) ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
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
                        className="text-purple-300 hover:text-purple-200 text-sm font-medium break-all flex items-center gap-1 hover:underline mb-3"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        {link.url.length > 40 ? link.url.substring(0, 40) + '...' : link.url}
                      </a>

                      {/* Tags */}
                      {link.tags && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {link.tags.split(",").slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded-lg text-xs border border-purple-500/30">
                              #{tag.trim()}
                            </span>
                          ))}
                          {link.tags.split(",").length > 3 && (
                            <span className="text-gray-400 text-xs py-1">
                              +{link.tags.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(link.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(link.url, link.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Copy link"
                          >
                            {copiedId === link.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}