// src/app/(routes)/public/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ExternalLink, Calendar, User, Grid3x3, List, Globe, TrendingUp, Clock, Star, Share2, Eye, ChevronDown, SortAsc } from 'lucide-react';

interface PublicLink {
  id: number;
  url: string;
  title: string;
  source: string;
  category: string;
  tags: string;
  description: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export default function PublicLinksPage() {
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<PublicLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    source: "",
    search: "",
  });

  const [stats, setStats] = useState({
    totalLinks: 0,
    totalCategories: 0,
    totalContributors: 0,
    recentLinks: 0
  });

  const fetchPublicLinks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public-links");
      const data = await response.json();

      if (response.ok) {
        setLinks(data.links);
        setFilteredLinks(data.links);
        
        const uniqueCategories = [...new Set(data.links.map((link: PublicLink) => link.category))];
        const uniqueSources = [...new Set(data.links.map((link: PublicLink) => link.source))];
        const uniqueContributors = [...new Set(data.links.map((link: PublicLink) => link.userEmail))];
        
        const tags = data.links
          .filter((link: PublicLink) => link.tags)
          .flatMap((link: PublicLink) => link.tags.split(",").map(t => t.trim()))
          .filter((tag: string) => tag);
        const uniqueTags = [...new Set(tags)];
        
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recentCount = data.links.filter((link: PublicLink) => 
          new Date(link.createdAt) > last7Days
        ).length;

        setCategories(uniqueCategories as string[]);
        setSources(uniqueSources as string[]);
        setAllTags(uniqueTags as string[]);
        
        setStats({
          totalLinks: data.links.length,
          totalCategories: uniqueCategories.length,
          totalContributors: uniqueContributors.length,
          recentLinks: recentCount
        });
      } else {
        setError(data.error || "Failed to fetch public links");
      }
    } catch (err) {
      setError("An error occurred while fetching public links");
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
          link.tags?.toLowerCase().includes(searchLower) ||
          link.userName?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((link) => {
        if (!link.tags) return false;
        const linkTags = link.tags.split(",").map(t => t.trim().toLowerCase());
        return selectedTags.some(tag => linkTags.includes(tag.toLowerCase()));
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    setFilteredLinks(filtered);
  };

  const clearFilters = () => {
    setFilters({ category: "", source: "", search: "" });
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      youtube: "🎥",
      facebook: "👥",
      linkedin: "💼",
      twitter: "🦋",
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
      education: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      music: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      movies: "bg-red-500/20 text-red-300 border-red-500/30",
      documents: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      tech: "bg-green-500/20 text-green-300 border-green-500/30",
      news: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      other: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    };
    return colors[category.toLowerCase()] || "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchPublicLinks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, links, selectedTags, sortBy]);

  const activeFiltersCount = [
    filters.category, 
    filters.source, 
    filters.search, 
    ...selectedTags
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl text-white font-semibold">Loading Public Links...</div>
          <p className="text-gray-400 mt-2">Discovering amazing content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Public Link Library
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover and explore curated links shared by our community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalLinks}</div>
                <div className="text-xs text-gray-400">Total Links</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
                <div className="text-xs text-gray-400">Categories</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalContributors}</div>
                <div className="text-xs text-gray-400">Contributors</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.recentLinks}</div>
                <div className="text-xs text-gray-400">This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-all border border-white/20"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">
                  <span className="font-bold text-blue-400">{filteredLinks.length}</span>
                  <span className="text-gray-400"> of {links.length}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="oldest" className="bg-slate-900">Oldest First</option>
                <option value="title" className="bg-slate-900">Title A-Z</option>
              </select>

              <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all text-sm"
                    placeholder="Search titles, tags, users..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all text-sm"
                  >
                    <option value="" className="bg-slate-900">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-slate-900">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Source Platform
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all text-sm"
                  >
                    <option value="" className="bg-slate-900">All Sources</option>
                    {sources.map((source) => (
                      <option key={source} value={source} className="bg-slate-900">
                        {getSourceIcon(source)} {source.charAt(0).toUpperCase() + source.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    disabled={activeFiltersCount === 0}
                    className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Popular Tags */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    <Star className="w-4 h-4 inline mr-1" />
                    Popular Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 12).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links Display */}
          {filteredLinks.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
                <Globe className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {links.length === 0 ? "No Public Links Yet" : "No Matches Found"}
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                {links.length === 0
                  ? "Be the first to share something amazing with the community!"
                  : "Try adjusting your filters or search terms"}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredLinks.map((link, index) => (
                <div
                  key={link.id}
                  className={`group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 animate-fadeIn ${
                    viewMode === 'list' ? 'flex gap-6' : ''
                  }`}
                  style={{animationDelay: `${index * 0.03}s`}}
                >
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-3xl">{getSourceIcon(link.source)}</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(link.category)}`}>
                          {link.category.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => copyLink(link.url)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all"
                        title="Copy link"
                      >
                        <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {link.title || "Untitled Link"}
                    </h3>

                    {/* Description */}
                    {link.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {link.description}
                      </p>
                    )}

                    {/* URL */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:text-blue-200 text-sm font-medium transition-all mb-4"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                      <span className="truncate max-w-[200px]">
                        {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </a>

                    {/* Tags */}
                    {link.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {link.tags.split(",").slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={() => toggleTag(tag.trim())}
                            className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-lg text-xs border border-purple-500/30 hover:bg-purple-500/20 cursor-pointer transition-all"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                        {link.tags.split(",").length > 4 && (
                          <span className="text-gray-500 text-xs py-1 px-2">
                            +{link.tags.split(",").length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                          {link.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-300">{link.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getRelativeTime(link.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <p>Showing publicly shared links from our community members</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}