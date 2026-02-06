"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import { toast } from "sonner";
import { User, Mail, Calendar, FileText, Trash2, Check, X, Send } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR" | "SUBSCRIBER";
  emailVerified: string | null;
  createdAt: string;
  avatar: string | null;
  bio: string | null;
  _count: {
    posts: number;
  };
}

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-800",
  EDITOR: "bg-blue-100 text-blue-800",
  AUTHOR: "bg-green-100 text-green-800",
  SUBSCRIBER: "bg-gray-100 text-gray-800",
};

const ROLE_OPTIONS = ["ADMIN", "EDITOR", "AUTHOR", "SUBSCRIBER"] as const;

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchUsers();
    }
  }, [user?.email]);

  async function fetchUsers() {
    if (!user?.email) return;

    try {
      const res = await fetch("/api/users", {
        headers: { "x-user-email": user.email },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleUpdate(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({ role: editRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: updatedUser.role } : u)));
      setEditingUserId(null);
      setEditRole("");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "x-user-email": user?.email || "" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function startEdit(user: UserData) {
    setEditingUserId(user.id);
    setEditRole(user.role);
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditRole("");
  }

  async function handleSendBulkVerification() {
    const unverifiedCount = users.filter(u => !u.emailVerified).length;
    
    if (unverifiedCount === 0) {
      toast.info('All users are already verified!');
      return;
    }

    if (!confirm(`Send verification emails to ${unverifiedCount} unverified users?`)) {
      return;
    }

    setSendingVerification(true);
    
    try {
      const res = await fetch('/api/admin/send-bulk-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification emails');
      }

      toast.success(`Sent ${data.sent} verification emails`, {
        description: data.failed > 0 ? `${data.failed} failed to send` : undefined,
      });

    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification emails');
    } finally {
      setSendingVerification(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const unverifiedCount = users.filter(u => !u.emailVerified).length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        {unverifiedCount > 0 && (
          <button
            onClick={handleSendBulkVerification}
            disabled={sendingVerification}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {sendingVerification ? 'Sending...' : `Send Verification (${unverifiedCount})`}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const getInitials = (name: string) => {
                  return name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                };

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-700">
                              {getInitials(user.name)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRoleUpdate(user.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(user)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ROLE_COLORS[user.role]
                        } hover:opacity-80 transition`}
                      >
                        {user.role}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FileText size={14} />
                      {user._count.posts}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <Check size={14} />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                        <X size={14} />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found</div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Role Permissions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>ADMIN:</strong> Full access to all features and settings</li>
          <li><strong>EDITOR:</strong> Can create, edit, and delete all posts and categories</li>
          <li><strong>AUTHOR:</strong> Can create and edit their own posts</li>
          <li><strong>SUBSCRIBER:</strong> Basic user with no admin access</li>
        </ul>
      </div>
    </div>
  );
}
