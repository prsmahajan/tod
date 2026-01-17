"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Shield, Users, Edit2, Save, X, Check } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

const ROLES = [
  {
    id: "ADMIN",
    name: "Administrator",
    color: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    description: "Full access to all features, can manage users and settings",
  },
  {
    id: "EDITOR",
    name: "Editor",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    description: "Can create, edit, and publish all content",
  },
  {
    id: "AUTHOR",
    name: "Author",
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    description: "Can create and manage their own content",
  },
  {
    id: "SUBSCRIBER",
    name: "Subscriber",
    color: "bg-[#3a3a3a] text-[#999] border border-[#444]",
    description: "Basic user with read access only",
  },
];

const PERMISSIONS: Permission[] = [
  { id: "posts.create", name: "Create Posts", description: "Create new posts", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { id: "posts.edit_own", name: "Edit Own Posts", description: "Edit posts created by self", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { id: "posts.edit_all", name: "Edit All Posts", description: "Edit posts by any author", roles: ["ADMIN", "EDITOR"] },
  { id: "posts.delete", name: "Delete Posts", description: "Delete any posts", roles: ["ADMIN", "EDITOR"] },
  { id: "posts.publish", name: "Publish Posts", description: "Publish posts to live site", roles: ["ADMIN", "EDITOR"] },
  { id: "categories.manage", name: "Manage Categories", description: "Create, edit, delete categories", roles: ["ADMIN", "EDITOR"] },
  { id: "media.upload", name: "Upload Media", description: "Upload images and files", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { id: "media.delete", name: "Delete Media", description: "Delete media files", roles: ["ADMIN", "EDITOR"] },
  { id: "users.view", name: "View Users", description: "View user list", roles: ["ADMIN"] },
  { id: "users.manage", name: "Manage Users", description: "Change user roles", roles: ["ADMIN"] },
  { id: "settings.view", name: "View Settings", description: "View site settings", roles: ["ADMIN", "EDITOR"] },
  { id: "settings.edit", name: "Edit Settings", description: "Modify site settings", roles: ["ADMIN"] },
  { id: "analytics.view", name: "View Analytics", description: "Access analytics dashboard", roles: ["ADMIN", "EDITOR"] },
  { id: "moderation.photos", name: "Moderate Photos", description: "Approve/reject user photos", roles: ["ADMIN", "EDITOR"] },
  { id: "newsletter.send", name: "Send Newsletter", description: "Send newsletter emails", roles: ["ADMIN"] },
];

export default function RolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });

      if (res.ok) {
        toast.success("Role updated successfully");
        setEditingUser(null);
        setEditRole("");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find((r) => r.id === role);
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig?.color || "bg-[#3a3a3a] text-[#999]"}`}>
        {roleConfig?.name || role}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-purple-400" />
          Role-Based Access Control
        </h1>
        <p className="text-[#888] mt-1">Manage user roles and permissions across the platform</p>
      </div>

      {/* Roles Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role.id).length;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
              className={`p-4 bg-[#1e1e1e] rounded-xl border-2 transition-all text-left ${
                selectedRole === role.id
                  ? "border-purple-500 shadow-lg shadow-purple-500/10"
                  : "border-[#2a2a2a] hover:border-[#3a3a3a]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {role.name}
                </span>
                <span className="text-2xl font-bold text-white">{count}</span>
              </div>
              <p className="text-xs text-[#666] line-clamp-2">{role.description}</p>
            </button>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#2a2a2a]">
          <h2 className="font-semibold text-white">Permissions Matrix</h2>
          <p className="text-sm text-[#666]">Overview of what each role can do</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider">Permission</th>
                {ROLES.map((role) => (
                  <th key={role.id} className="px-4 py-3 text-center text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {PERMISSIONS.map((permission) => (
                <tr key={permission.id} className="hover:bg-[#252525] transition-colors">
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{permission.name}</p>
                      <p className="text-xs text-[#666]">{permission.description}</p>
                    </div>
                  </td>
                  {ROLES.map((role) => (
                    <td key={role.id} className="px-4 py-3 text-center">
                      {permission.roles.includes(role.id) ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500/20 rounded-full">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-[#2a2a2a] rounded-full">
                          <X className="w-4 h-4 text-[#555]" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#888]" />
              User Roles
            </h2>
            <p className="text-sm text-[#666]">{filteredUsers.length} users</p>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-purple-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#666]">No users found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider">Current Role</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-[#888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#252525] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-medium">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-[#666]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="px-3 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {ROLES.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#888]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingUser === user.id ? (
                        <>
                          <button
                            onClick={() => handleRoleChange(user.id)}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setEditRole("");
                            }}
                            className="p-2 text-[#666] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditRole(user.role);
                          }}
                          className="p-2 text-[#888] hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Edit role"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
