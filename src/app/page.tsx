// // src/app/page.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import { Link2, Sparkles, Tag, FileText, Zap, Check, AlertCircle, ExternalLink, Lock, Globe, Users } from 'lucide-react';

// const defaultCategories = ["education", "music", "movies", "documents", "tech", "news", "social", "other"];
// const defaultSources = ["youtube", "facebook", "linkedin", "twitter", "instagram", "github", "medium", "reddit", "other"];

// interface Group {
//   id: number;
//   name: string;
//   isOwner: boolean;
// }

// export default function HomePage() {
//   const router = useRouter();
//   const { status } = useSession();
//   const [formData, setFormData] = useState({
//     url: "", 
//     title: "", 
//     source: "", 
//     category: "", 
//     tags: "", 
//     description: "", 
//     visibility: "private", 
//     groupId: null as number | null
//   });

//   useEffect(() => {
//     const disableScrollOnLargeScreen = () => {
//       if (window.innerWidth >= 1024) {
//         document.body.style.overflow = 'hidden';
//       } else {
//         document.body.style.overflow = 'unset';
//       }
//     };

//     disableScrollOnLargeScreen();
//     window.addEventListener('resize', disableScrollOnLargeScreen);

//     return () => {
//       document.body.style.overflow = 'unset';
//       window.removeEventListener('resize', disableScrollOnLargeScreen);
//     };
//   }, []);
  
//   const [categories, setCategories] = useState<string[]>(defaultCategories);
//   const [sources, setSources] = useState<string[]>(defaultSources);
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [categoryInput, setCategoryInput] = useState("");
//   const [sourceInput, setSourceInput] = useState("");
//   const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
//   const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
//   const [filteredSources, setFilteredSources] = useState<string[]>([]);
  
//   const categoryInputRef = useRef<HTMLDivElement>(null);
//   const sourceInputRef = useRef<HTMLDivElement>(null);
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAutoDetecting, setIsAutoDetecting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [sourceMessage, setSourceMessage] = useState("");

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch("/api/categories");
//       if (response.ok) {
//         const data = await response.json();
//         setCategories(data.categories);
//       }
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//     }
//   };

//   const fetchSources = async () => {
//     try {
//       const response = await fetch("/api/sources");
//       if (response.ok) {
//         const data = await response.json();
//         setSources(data.sources);
//       }
//     } catch (err) {
//       console.error("Failed to fetch sources:", err);
//     }
//   };

//   const fetchGroups = async () => {
//     try {
//       const response = await fetch("/api/groups");
//       if (response.ok) {
//         const data = await response.json();
//         setGroups(data.groups);
//       }
//     } catch (err) {
//       console.error("Failed to fetch groups:", err);
//     }
//   };

//   const detectSourceFromUrl = (url: string): string | null => {
//     try {
//       const urlObj = new URL(url);
//       const hostname = urlObj.hostname.toLowerCase();
      
//       for (const source of sources) {
//         if (hostname.includes(source.toLowerCase())) {
//           return source;
//         }
//       }
      
//       if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
//       if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
//       if (hostname.includes('linkedin.com')) return 'linkedin';
//       if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
//       if (hostname.includes('instagram.com')) return 'instagram';
//       if (hostname.includes('github.com')) return 'github';
//       if (hostname.includes('medium.com')) return 'medium';
//       if (hostname.includes('reddit.com')) return 'reddit';
      
//       return null;
//     } catch {
//       return null;
//     }
//   };

//   const autoDetectSourceAndFetchTitle = async () => {
//     if (!formData.url) return;

//     setIsAutoDetecting(true);
//     setError("");

//     try {
//       const detectedSource = detectSourceFromUrl(formData.url);
      
//       if (detectedSource) {
//         setSourceInput(detectedSource);
//         setFormData(prev => ({ ...prev, source: detectedSource }));
//         setSourceMessage(`Source detected: ${detectedSource}`);
//       } else {
//         setSourceInput("");
//         setFormData(prev => ({ ...prev, source: "" }));
//         setSourceMessage("Could not detect source. Please type manually.");
//       }

//       const response = await fetch("/api/fetch-title", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url: formData.url }),
//       });

//       const data = await response.json();

//       if (response.ok && data.title) {
//         setFormData(prev => ({ ...prev, title: data.title }));
//       }
//     } catch (err) {
//       console.error("Auto-detection error:", err);
//     } finally {
//       setIsAutoDetecting(false);
//     }
//   };

//   const addCustomCategory = async (name: string) => {
//     try {
//       const response = await fetch("/api/categories", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name }),
//       });

//       if (response.ok) {
//         await fetchCategories();
//       }
//     } catch (err) {
//       console.error("Failed to add custom category:", err);
//     }
//   };

//   const addCustomSource = async (name: string) => {
//     try {
//       const response = await fetch("/api/sources", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name }),
//       });

//       if (response.ok) {
//         await fetchSources();
//       }
//     } catch (err) {
//       console.error("Failed to add custom source:", err);
//     }
//   };

//   const handleCategorySelect = (category: string) => {
//     setCategoryInput(category);
//     setFormData({ ...formData, category });
//     setShowCategorySuggestions(false);
//   };

//   const handleSourceSelect = (source: string) => {
//     setSourceInput(source);
//     setFormData({ ...formData, source });
//     setShowSourceSuggestions(false);
//     setSourceMessage("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     setSuccess("");

//     // Validate group selection for group visibility
//     if (formData.visibility === "group" && !formData.groupId) {
//       setError("Please select a group for group visibility");
//       setIsLoading(false);
//       return;
//     }

//     if (formData.category && !categories.includes(formData.category.toLowerCase())) {
//       await addCustomCategory(formData.category);
//     }

//     if (formData.source && !sources.includes(formData.source.toLowerCase())) {
//       await addCustomSource(formData.source);
//     }

//     try {
//       const response = await fetch("/api/links", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSuccess("Link saved successfully!");
        
//         setFormData({ 
//           url: "", 
//           title: "", 
//           source: "", 
//           category: "", 
//           tags: "", 
//           description: "",
//           visibility: "private", 
//           groupId: null
//         });
//         setCategoryInput("");
//         setSourceInput("");
//         setSourceMessage("");
        
//         setTimeout(() => {
//           if (formData.visibility === "public") {
//             router.push("/public");
//           } else if (formData.visibility === "group") {
//             router.push("/groups");
//           } else {
//             router.push("/links");
//           }
//         }, 1500);
//       } else {
//         setError(data.error || "Failed to save link");
//       }
//     } catch (err) {
//       setError("An error occurred while saving the link");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchSources();
//     fetchGroups();
//   }, []);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/signin");
//     }
//   }, [status, router]);

//   useEffect(() => {
//     if (formData.url) {
//       const timeoutId = setTimeout(() => {
//         autoDetectSourceAndFetchTitle();
//       }, 500);
//       return () => clearTimeout(timeoutId);
//     } else {
//       setSourceInput("");
//       setFormData(prev => ({ ...prev, source: "", title: "" }));
//       setSourceMessage("");
//     }
//   }, [formData.url]);

//   useEffect(() => {
//     if (categoryInput) {
//       setFilteredCategories(categories.filter(cat =>
//         cat.toLowerCase().includes(categoryInput.toLowerCase())
//       ));
//     } else {
//       setFilteredCategories(categories);
//     }
//   }, [categoryInput, categories]);

//   useEffect(() => {
//     if (sourceInput) {
//       setFilteredSources(sources.filter(src =>
//         src.toLowerCase().includes(sourceInput.toLowerCase())
//       ));
//     } else {
//       setFilteredSources(sources);
//     }
//   }, [sourceInput, sources]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (categoryInputRef.current && !categoryInputRef.current.contains(event.target as Node)) {
//         setShowCategorySuggestions(false);
//       }
//       if (sourceInputRef.current && !sourceInputRef.current.contains(event.target as Node)) {
//         setShowSourceSuggestions(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Reset groupId when visibility changes
//   useEffect(() => {
//     if (formData.visibility !== "group") {
//       setFormData(prev => ({ ...prev, groupId: null }));
//     }
//   }, [formData.visibility]);

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         <div className="animate-pulse">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!status || status === "unauthenticated") {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//       {/* Animated background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//         <div className="absolute top-3/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s'}}></div>
//         <div className="absolute bottom-1/4 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
//       </div>

//       <div className="max-w-4xl mx-auto relative z-10">
//         <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-purple-500/20 animate-fadeIn">
//           {/* Header */}
//           <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3">
//             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent mb-2">
//               Save Your Link
//             </h1>
//             <p className="text-gray-300 text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2 flex-wrap">
//               <Sparkles className="w-4 h-4" />
//               Organize and manage your favorite links in one place
//             </p>
//           </div>

//           {/* Alerts */}
//           {error && (
//             <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-shake">
//               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <p className="text-sm sm:text-base">{error}</p>
//             </div>
//           )}

//           {success && (
//             <div className="mb-6 bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-slideDown">
//               <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <p className="text-sm sm:text-base">{success}</p>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
//             {/* URL Field */}
//             <div className="group transform transition-all duration-300 hover:scale-[1.01]">
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
//                 <Link2 className="w-4 h-4" />
//                 URL <span className="text-pink-400">*</span>
//                 {isAutoDetecting && (
//                   <span className="text-xs text-purple-300 flex items-center gap-1 ml-2">
//                     <Zap className="w-3 h-3 animate-spin" />
//                     Auto-detecting...
//                   </span>
//                 )}
//               </label>
//               <input
//                 type="url"
//                 required
//                 value={formData.url}
//                 onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                 placeholder="https://example.com"
//               />
//             </div>

//             {/* Title Field */}
//             <div className="group transform transition-all duration-300 hover:scale-[1.01]">
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
//                 <FileText className="w-4 h-4" />
//                 Title <span className="text-gray-400 text-xs font-normal">(auto-fetched)</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                 placeholder="Title will be fetched automatically"
//               />
//             </div>

//             {/* Source and Category Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
//               {/* Source Field */}
//               <div className="group relative" ref={sourceInputRef}>
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
//                   <Sparkles className="w-4 h-4" />
//                   Source <span className="text-pink-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={sourceInput}
//                   onChange={(e) => {
//                     setSourceInput(e.target.value);
//                     setFormData({ ...formData, source: e.target.value });
//                     setShowSourceSuggestions(true);
//                     setSourceMessage("");
//                   }}
//                   onFocus={() => setShowSourceSuggestions(true)}
//                   className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                   placeholder="Auto-detected or type"
//                 />
                
//                 {sourceMessage && (
//                   <p className={`text-xs mt-1 ${sourceMessage.includes('detected') ? 'text-green-300' : 'text-yellow-300'}`}>
//                     {sourceMessage}
//                   </p>
//                 )}
                
//                 {showSourceSuggestions && filteredSources.length > 0 && (
//                   <div 
//                     className="absolute z-[9999] w-full mt-2 bg-slate-800/98 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
//                     onMouseDown={(e) => e.preventDefault()}
//                   >
//                     {filteredSources.map((source) => (
//                       <div
//                         key={source}
//                         onMouseDown={(e) => {
//                           e.preventDefault();
//                           handleSourceSelect(source);
//                         }}
//                         className="px-4 py-2.5 hover:bg-purple-500/40 cursor-pointer text-white transition-colors duration-150 text-sm sm:text-base first:rounded-t-xl last:rounded-b-xl"
//                       >
//                         {source.charAt(0).toUpperCase() + source.slice(1)}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Category Field */}
//               <div className="group relative" ref={categoryInputRef}>
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
//                   <Tag className="w-4 h-4" />
//                   Category <span className="text-pink-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={categoryInput}
//                   onChange={(e) => {
//                     setCategoryInput(e.target.value);
//                     setFormData({ ...formData, category: e.target.value });
//                     setShowCategorySuggestions(true);
//                   }}
//                   onFocus={() => setShowCategorySuggestions(true)}
//                   className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                   placeholder="Type or select"
//                 />
                
//                 {showCategorySuggestions && filteredCategories.length > 0 && (
//                   <div 
//                     className="absolute z-[9999] w-full mt-2 bg-slate-800/98 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
//                     onMouseDown={(e) => e.preventDefault()}
//                   >
//                     {filteredCategories.map((category) => (
//                       <div
//                         key={category}
//                         onMouseDown={(e) => {
//                           e.preventDefault();
//                           handleCategorySelect(category);
//                         }}
//                         className="px-4 py-2.5 hover:bg-purple-500/40 cursor-pointer text-white transition-colors duration-150 text-sm sm:text-base first:rounded-t-xl last:rounded-b-xl"
//                       >
//                         {category.charAt(0).toUpperCase() + category.slice(1)}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Visibility Selection */}
//             <div className="group">
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
//                 <Lock className="w-4 h-4" />
//                 Visibility <span className="text-pink-400">*</span>
//               </label>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, visibility: "private" })}
//                   className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                     formData.visibility === "private"
//                       ? "border-purple-500 bg-purple-500/20"
//                       : "border-white/20 bg-white/5 hover:border-white/40"
//                   }`}
//                 >
//                   <Lock className="w-6 h-6 mx-auto mb-2 text-purple-300" />
//                   <div className="text-white font-semibold text-sm">Private</div>
//                   <div className="text-gray-400 text-xs mt-1">Only you can see</div>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, visibility: "public" })}
//                   className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                     formData.visibility === "public"
//                       ? "border-blue-500 bg-blue-500/20"
//                       : "border-white/20 bg-white/5 hover:border-white/40"
//                   }`}
//                 >
//                   <Globe className="w-6 h-6 mx-auto mb-2 text-blue-300" />
//                   <div className="text-white font-semibold text-sm">Public</div>
//                   <div className="text-gray-400 text-xs mt-1">Everyone can see</div>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, visibility: "group" })}
//                   className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                     formData.visibility === "group"
//                       ? "border-pink-500 bg-pink-500/20"
//                       : "border-white/20 bg-white/5 hover:border-white/40"
//                   }`}
//                 >
//                   <Users className="w-6 h-6 mx-auto mb-2 text-pink-300" />
//                   <div className="text-white font-semibold text-sm">Group</div>
//                   <div className="text-gray-400 text-xs mt-1">Group members only</div>
//                 </button>
//               </div>
//             </div>

//             {/* Group Selection (shown only when visibility is group) */}
//             {formData.visibility === "group" && (
//               <div className="group animate-slideDown">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
//                   <Users className="w-4 h-4" />
//                   Select Group <span className="text-pink-400">*</span>
//                 </label>
//                 <select
//                   value={formData.groupId || ""}
//                   onChange={(e) => setFormData({ ...formData, groupId: parseInt(e.target.value) || null })}
//                   className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                   required={formData.visibility === "group"}
//                 >
//                   <option value="" className="bg-slate-800">Select a group</option>
//                   {groups.map((group) => (
//                     <option key={group.id} value={group.id} className="bg-slate-800">
//                       {group.name} {group.isOwner ? "(Owner)" : "(Member)"}
//                     </option>
//                   ))}
//                 </select>
//                 {groups.length === 0 && (
//                   <p className="text-xs text-yellow-300 mt-1">
//                     You don't have any groups yet. Create one first!
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Tags Field */}
//             <div className="group transform transition-all duration-300 hover:scale-[1.01]">
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
//                 <Tag className="w-4 h-4" />
//                 Tags <span className="text-gray-400 text-xs font-normal">(comma-separated)</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.tags}
//                 onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//                 className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
//                 placeholder="tutorial, javascript, react"
//               />
//             </div>

//             {/* Description Field */}
//             <div className="group transform transition-all duration-300 hover:scale-[1.01]">
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
//                 <FileText className="w-4 h-4" />
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 rows={2}
//                 className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 resize-none text-sm sm:text-base"
//                 placeholder="Optional description"
//               />
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <>
//                     <Zap className="w-5 h-5 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles className="w-5 h-5" />
//                     Save Link
//                   </>
//                 )}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => router.push("/links")}
//                 className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 text-sm sm:text-base flex items-center justify-center gap-2"
//               >
//                 <ExternalLink className="w-5 h-5" />
//                 View All Links
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-5px); }
//           75% { transform: translateX(5px); }
//         }

//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }

//         .animate-shake {
//           animation: shake 0.3s ease-in-out;
//         }

//         .animate-slideDown {
//           animation: slideDown 0.4s ease-out;
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }










// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Link2, Sparkles, Tag, FileText, Zap, Check, AlertCircle, ExternalLink, Lock, Globe, Users } from 'lucide-react';

const defaultCategories = ["education", "music", "movies", "documents", "tech", "news", "social", "other"];
const defaultSources = ["youtube", "facebook", "linkedin", "twitter", "instagram", "github", "medium", "reddit", "other"];

interface Group {
  id: number;
  name: string;
  isOwner: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    url: "", 
    title: "", 
    source: "", 
    category: "", 
    tags: "", 
    description: "", 
    visibility: "private", 
    groupId: null as number | null
  });
  
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [sources, setSources] = useState<string[]>(defaultSources);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [sourceInput, setSourceInput] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [filteredSources, setFilteredSources] = useState<string[]>([]);
  
  const categoryInputRef = useRef<HTMLDivElement>(null);
  const sourceInputRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sourceMessage, setSourceMessage] = useState("");

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

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const detectSourceFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      for (const source of sources) {
        if (hostname.includes(source.toLowerCase())) {
          return source;
        }
      }
      
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('github.com')) return 'github';
      if (hostname.includes('medium.com')) return 'medium';
      if (hostname.includes('reddit.com')) return 'reddit';
      
      return null;
    } catch {
      return null;
    }
  };

  const autoDetectSourceAndFetchTitle = async () => {
    if (!formData.url) return;

    setIsAutoDetecting(true);
    setError("");

    try {
      const detectedSource = detectSourceFromUrl(formData.url);
      
      if (detectedSource) {
        setSourceInput(detectedSource);
        setFormData(prev => ({ ...prev, source: detectedSource }));
        setSourceMessage(`Source detected: ${detectedSource}`);
      } else {
        setSourceInput("");
        setFormData(prev => ({ ...prev, source: "" }));
        setSourceMessage("Could not detect source. Please type manually.");
      }

      const response = await fetch("/api/fetch-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.url }),
      });

      const data = await response.json();

      if (response.ok && data.title) {
        setFormData(prev => ({ ...prev, title: data.title }));
      }
    } catch (err) {
      console.error("Auto-detection error:", err);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const addCustomCategory = async (name: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (err) {
      console.error("Failed to add custom category:", err);
    }
  };

  const addCustomSource = async (name: string) => {
    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        await fetchSources();
      }
    } catch (err) {
      console.error("Failed to add custom source:", err);
    }
  };

  const handleCategorySelect = (category: string) => {
    setCategoryInput(category);
    setFormData({ ...formData, category });
    setShowCategorySuggestions(false);
  };

  const handleSourceSelect = (source: string) => {
    setSourceInput(source);
    setFormData({ ...formData, source });
    setShowSourceSuggestions(false);
    setSourceMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate group selection for group visibility
    if (formData.visibility === "group" && !formData.groupId) {
      setError("Please select a group for group visibility");
      setIsLoading(false);
      return;
    }

    if (formData.category && !categories.includes(formData.category.toLowerCase())) {
      await addCustomCategory(formData.category);
    }

    if (formData.source && !sources.includes(formData.source.toLowerCase())) {
      await addCustomSource(formData.source);
    }

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Link saved successfully!");
        
        setFormData({ 
          url: "", 
          title: "", 
          source: "", 
          category: "", 
          tags: "", 
          description: "",
          visibility: "private", 
          groupId: null
        });
        setCategoryInput("");
        setSourceInput("");
        setSourceMessage("");
        
        setTimeout(() => {
          if (formData.visibility === "public") {
            router.push("/public");
          } else if (formData.visibility === "group") {
            router.push("/groups");
          } else {
            router.push("/links");
          }
        }, 1500);
      } else {
        setError(data.error || "Failed to save link");
      }
    } catch (err) {
      setError("An error occurred while saving the link");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSources();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (formData.url) {
      const timeoutId = setTimeout(() => {
        autoDetectSourceAndFetchTitle();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSourceInput("");
      setFormData(prev => ({ ...prev, source: "", title: "" }));
      setSourceMessage("");
    }
  }, [formData.url]);

  useEffect(() => {
    if (categoryInput) {
      setFilteredCategories(categories.filter(cat =>
        cat.toLowerCase().includes(categoryInput.toLowerCase())
      ));
    } else {
      setFilteredCategories(categories);
    }
  }, [categoryInput, categories]);

  useEffect(() => {
    if (sourceInput) {
      setFilteredSources(sources.filter(src =>
        src.toLowerCase().includes(sourceInput.toLowerCase())
      ));
    } else {
      setFilteredSources(sources);
    }
  }, [sourceInput, sources]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryInputRef.current && !categoryInputRef.current.contains(event.target as Node)) {
        setShowCategorySuggestions(false);
      }
      if (sourceInputRef.current && !sourceInputRef.current.contains(event.target as Node)) {
        setShowSourceSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset groupId when visibility changes
  useEffect(() => {
    if (formData.visibility !== "group") {
      setFormData(prev => ({ ...prev, groupId: null }));
    }
  }, [formData.visibility]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!status || status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-purple-500/20 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent mb-2">
              Save Your Link
            </h1>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4" />
              Organize and manage your favorite links in one place
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-200 px-4 py-3 rounded-xl flex items-start gap-3 animate-slideDown">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* URL Field */}
            <div className="group transform transition-all duration-300 hover:scale-[1.01]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
                <Link2 className="w-4 h-4" />
                URL <span className="text-pink-400">*</span>
                {isAutoDetecting && (
                  <span className="text-xs text-purple-300 flex items-center gap-1 ml-2">
                    <Zap className="w-3 h-3 animate-spin" />
                    Auto-detecting...
                  </span>
                )}
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                placeholder="https://example.com"
              />
            </div>

            {/* Title Field */}
            <div className="group transform transition-all duration-300 hover:scale-[1.01]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
                <FileText className="w-4 h-4" />
                Title <span className="text-gray-400 text-xs font-normal">(auto-fetched)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                placeholder="Title will be fetched automatically"
              />
            </div>

            {/* Source and Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Source Field */}
              <div className="group relative" ref={sourceInputRef}>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Source <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sourceInput}
                  onChange={(e) => {
                    setSourceInput(e.target.value);
                    setFormData({ ...formData, source: e.target.value });
                    setShowSourceSuggestions(true);
                    setSourceMessage("");
                  }}
                  onFocus={() => setShowSourceSuggestions(true)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  placeholder="Auto-detected or type"
                />
                
                {sourceMessage && (
                  <p className={`text-xs mt-1 ${sourceMessage.includes('detected') ? 'text-green-300' : 'text-yellow-300'}`}>
                    {sourceMessage}
                  </p>
                )}
                
                {showSourceSuggestions && filteredSources.length > 0 && (
                  <div 
                    className="absolute z-[9999] w-full mt-2 bg-slate-800/98 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredSources.map((source) => (
                      <div
                        key={source}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSourceSelect(source);
                        }}
                        className="px-4 py-2.5 hover:bg-purple-500/40 cursor-pointer text-white transition-colors duration-150 text-sm sm:text-base first:rounded-t-xl last:rounded-b-xl"
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Field */}
              <div className="group relative" ref={categoryInputRef}>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
                  <Tag className="w-4 h-4" />
                  Category <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setFormData({ ...formData, category: e.target.value });
                    setShowCategorySuggestions(true);
                  }}
                  onFocus={() => setShowCategorySuggestions(true)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  placeholder="Type or select"
                />
                
                {showCategorySuggestions && filteredCategories.length > 0 && (
                  <div 
                    className="absolute z-[9999] w-full mt-2 bg-slate-800/98 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredCategories.map((category) => (
                      <div
                        key={category}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCategorySelect(category);
                        }}
                        className="px-4 py-2.5 hover:bg-purple-500/40 cursor-pointer text-white transition-colors duration-150 text-sm sm:text-base first:rounded-t-xl last:rounded-b-xl"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visibility Selection */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                <Lock className="w-4 h-4" />
                Visibility <span className="text-pink-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "private" })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.visibility === "private"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <Lock className="w-6 h-6 mx-auto mb-2 text-purple-300" />
                  <div className="text-white font-semibold text-sm">Private</div>
                  <div className="text-gray-400 text-xs mt-1">Only you can see</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "public" })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.visibility === "public"
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <Globe className="w-6 h-6 mx-auto mb-2 text-blue-300" />
                  <div className="text-white font-semibold text-sm">Public</div>
                  <div className="text-gray-400 text-xs mt-1">Everyone can see</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "group" })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.visibility === "group"
                      ? "border-pink-500 bg-pink-500/20"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <Users className="w-6 h-6 mx-auto mb-2 text-pink-300" />
                  <div className="text-white font-semibold text-sm">Group</div>
                  <div className="text-gray-400 text-xs mt-1">Group members only</div>
                </button>
              </div>
            </div>

            {/* Group Selection (shown only when visibility is group) */}
            {formData.visibility === "group" && (
              <div className="group animate-slideDown">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
                  <Users className="w-4 h-4" />
                  Select Group <span className="text-pink-400">*</span>
                </label>
                <select
                  value={formData.groupId || ""}
                  onChange={(e) => setFormData({ ...formData, groupId: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                  required={formData.visibility === "group"}
                >
                  <option value="" className="bg-slate-800">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id} className="bg-slate-800">
                      {group.name} {group.isOwner ? "(Owner)" : "(Member)"}
                    </option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p className="text-xs text-yellow-300 mt-1">
                    You don't have any groups yet. Create one first!
                  </p>
                )}
              </div>
            )}

            {/* Tags Field */}
            <div className="group transform transition-all duration-300 hover:scale-[1.01]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
                <Tag className="w-4 h-4" />
                Tags <span className="text-gray-400 text-xs font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 text-sm sm:text-base"
                placeholder="tutorial, javascript, react"
              />
            </div>

            {/* Description Field */}
            <div className="group transform transition-all duration-300 hover:scale-[1.01]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-1.5">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 resize-none text-sm sm:text-base"
                placeholder="Optional description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Save Link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/links")}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                View All Links
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}