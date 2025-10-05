// src/app/(routes)/groups/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Plus, Trash2, UserPlus, X, Crown, Mail, Calendar, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  isOwner: boolean;
  memberCount: number;
  members: GroupMember[];
  createdAt: string;
}

interface GroupMember {
  id: number;
  email: string;
  addedAt: string;
}

interface GroupLink {
  id: number;
  url: string;
  title: string;
  source: string;
  category: string;
  tags: string;
  description: string;
  userName: string;
  createdAt: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showGroupLinksModal, setShowGroupLinksModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([]);
  
  const [newGroupData, setNewGroupData] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/groups");
      const data = await response.json();

      if (response.ok) {
        setGroups(data.groups);
      } else {
        setError(data.error || "Failed to fetch groups");
      }
    } catch (err) {
      setError("An error occurred while fetching groups");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupLinks = async (groupId: number) => {
    try {
      const response = await fetch(`/api/links`);
      const data = await response.json();
      
      if (response.ok) {
        const filtered = data.links.filter((link: any) => link.groupId === groupId);
        setGroupLinks(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch group links:", err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroupData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Group created successfully!");
        setShowCreateModal(false);
        setNewGroupData({ name: "", description: "" });
        fetchGroups();
      } else {
        setError(data.error || "Failed to create group");
      }
    } catch (err) {
      setError("An error occurred while creating the group");
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group? All links will be deleted.")) return;

    try {
      const response = await fetch(`/api/groups?id=${groupId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Group deleted successfully");
        fetchGroups();
      } else {
        alert("Failed to delete group");
      }
    } catch (err) {
      alert("An error occurred while deleting the group");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup.id, email: memberEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Member added successfully!");
        setMemberEmail("");
        setShowAddMemberModal(false);
        fetchGroups();
      } else {
        setError(data.error || "Failed to add member");
      }
    } catch (err) {
      setError("An error occurred while adding the member");
    }
  };

  const handleRemoveMember = async (groupId: number, memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(`/api/groups/members?memberId=${memberId}&groupId=${groupId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Member removed successfully");
        fetchGroups();
        if (selectedGroup) {
          setSelectedGroup({
            ...selectedGroup,
            members: selectedGroup.members.filter(m => m.id !== memberId),
            memberCount: selectedGroup.memberCount - 1
          });
        }
      } else {
        alert("Failed to remove member");
      }
    } catch (err) {
      alert("An error occurred while removing the member");
    }
  };

  const openGroupLinks = (group: Group) => {
    setSelectedGroup(group);
    fetchGroupLinks(group.id);
    setShowGroupLinksModal(true);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Groups</h1>
              <p className="text-gray-300 text-sm sm:text-base">{groups.length} groups</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-200 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">No groups yet</p>
              <p className="text-gray-400 text-sm">Create your first group to start collaborating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-purple-300" />
                      {/* {group.isOwner && <Crown className="w-5 h-5 text-yellow-400" title="You are the owner" />} */}
                      {group.isOwner && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                    {group.isOwner && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                  {group.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{group.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount} members</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openGroupLinks(group)}
                      className="flex-1 bg-purple-500/20 text-purple-200 py-2 px-4 rounded-lg hover:bg-purple-500/30 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Links
                    </button>
                    {group.isOwner && (
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowAddMemberModal(true);
                        }}
                        className="bg-pink-500/20 text-pink-200 py-2 px-4 rounded-lg hover:bg-pink-500/30 transition-all"
                        title="Add member"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Members Preview */}
                  {group.members.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Members:</p>
                      <div className="space-y-1">
                        {group.members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 truncate">{member.email}</span>
                            {group.isOwner && (
                              <button
                                onClick={() => handleRemoveMember(group.id, member.id)}
                                className="text-red-400 hover:text-red-300 ml-2"
                                title="Remove member"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {group.members.length > 3 && (
                          <p className="text-xs text-gray-500">+{group.members.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Create New Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Group Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/10 text-white py-2.5 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Add Member to {selectedGroup.name}</h2>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Member Email <span className="text-pink-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400"
                  placeholder="member@example.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  User must have an account with this email
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 bg-white/10 text-white py-2.5 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Links Modal */}
      {showGroupLinksModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedGroup.name} - Links</h2>
              <button onClick={() => setShowGroupLinksModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {groupLinks.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300">No links in this group yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupLinks.map((link) => (
                  <div key={link.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                    <h3 className="text-lg font-bold text-white mb-2">{link.title || "Untitled"}</h3>
                    {link.description && (
                      <p className="text-gray-300 text-sm mb-2">{link.description}</p>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1 mb-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.url}
                    </a>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>By: {link.userName}</span>
                      <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}