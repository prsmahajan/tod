"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import { toast } from "sonner";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR" | "SUBSCRIBER";
  emailVerified: string | null;
  createdAt: string;
  avatar: string | null;
  bio: string | null;
  subscriptionStatus: string | null;
  animalsFed: number;
  _count: {
    posts: number;
    auditLogs: number;
    approvalsMade: number;
  };
}

interface InviteFormData {
  email: string;
  name: string;
  role: string;
  message: string;
}

interface Stats {
  totalVolunteers: number;
  activeThisMonth: number;
  totalPostsCreated: number;
  totalAnimalsFed: number;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/10 text-purple-600",
  EDITOR: "bg-blue-500/10 text-blue-600",
  AUTHOR: "bg-green-500/10 text-green-600",
  SUBSCRIBER: "bg-[var(--color-border)] text-[var(--color-text-secondary)]",
};

const ROLE_OPTIONS = [
  { value: "AUTHOR", label: "Author", description: "Can create and manage their own articles" },
  { value: "EDITOR", label: "Editor", description: "Can edit and publish all articles" },
  { value: "ADMIN", label: "Admin", description: "Full access to all features" },
];

export default function VolunteersPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "authors" | "editors">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: "",
    name: "",
    role: "AUTHOR",
    message: "",
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchVolunteers = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/volunteers?filter=${filter}&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch volunteers");
      const data = await res.json();
      setVolunteers(data.volunteers);
      setStats(data.stats);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery, user?.email]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setSendingInvite(true);

    try {
      const res = await fetch("/api/admin/volunteers/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Invitation sent successfully!");
        setShowInviteModal(false);
        setInviteForm({ email: "", name: "", role: "AUTHOR", message: "" });
        fetchVolunteers();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRoleChange = async (volunteerId: string, newRole: string) => {
    if (!user?.email) return;

    try {
      const res = await fetch(`/api/admin/volunteers/${volunteerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success("Role updated successfully");
        fetchVolunteers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveVolunteer = async (volunteer: Volunteer) => {
    if (!confirm(`Are you sure you want to remove ${volunteer.name} as a volunteer? They will become a regular subscriber.`)) {
      return;
    }

    if (!user?.email) return;

    try {
      const res = await fetch(`/api/admin/volunteers/${volunteer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ role: "SUBSCRIBER" }),
      });

      if (res.ok) {
        toast.success("Volunteer removed successfully");
        fetchVolunteers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove volunteer");
      }
    } catch (error) {
      toast.error("Failed to remove volunteer");
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Volunteer Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage volunteers who help create and publish content
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-black text-[#fff] px-4 py-2 border-2 border-black hover:bg-white hover:text-[#000] text-sm font-medium hover:opacity-90 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Invite Volunteer
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Volunteers</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalVolunteers}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Active This Month</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeThisMonth}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Posts Created</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPostsCreated}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Animals Fed</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAnimalsFed}</p>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "authors", label: "Authors" },
            { key: "editors", label: "Editors" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === tab.key
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                  : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-sm px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Volunteers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[var(--color-text-primary)]/30 border-t-[var(--color-text-primary)] rounded-full animate-spin" />
        </div>
      ) : filteredVolunteers.length > 0 ? (
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {volunteer.avatar ? (
                        <img
                          src={volunteer.avatar}
                          alt={volunteer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#000000]"></div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{volunteer.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{volunteer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={volunteer.role}
                      onChange={(e) => handleRoleChange(volunteer.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${ROLE_COLORS[volunteer.role]}`}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                      <option value="SUBSCRIBER">Remove Volunteer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-[var(--color-text-primary)]">{volunteer._count.posts} posts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-[var(--color-text-primary)]">{volunteer._count.approvalsMade} reviews</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="font-medium text-[var(--color-text-primary)]">{volunteer.animalsFed}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">animals fed</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {new Date(volunteer.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedVolunteer(volunteer)}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveVolunteer(volunteer)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove volunteer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">No volunteers found</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="mt-4 px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            Invite Your First Volunteer
          </button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Invite Volunteer</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="volunteer@example.com"
                    className="w-full px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Role *
                  </label>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((role) => (
                      <label
                        key={role.value}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          inviteForm.role === role.value
                            ? "border-[var(--color-text-primary)] bg-[var(--color-text-primary)]/5"
                            : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={inviteForm.role === role.value}
                          onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">{role.label}</p>
                          <p className="text-sm text-[var(--color-text-secondary)]">{role.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Personal Message
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal note to the invitation..."
                    rows={3}
                    className="w-full px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg text-sm font-medium hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="flex-1 py-2.5 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {sendingInvite ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Detail Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Volunteer Profile</h2>
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center text-2xl font-bold">
                  {selectedVolunteer.avatar ? (
                    <img src={selectedVolunteer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedVolunteer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{selectedVolunteer.name}</h3>
                  <p className="text-[var(--color-text-secondary)]">{selectedVolunteer.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[selectedVolunteer.role]}`}>
                      {selectedVolunteer.role}
                    </span>
                    {selectedVolunteer.emailVerified && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-xs">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedVolunteer.bio && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">About</h4>
                  <p className="text-[var(--color-text-primary)]">{selectedVolunteer.bio}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedVolunteer._count.posts}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Posts Created</p>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedVolunteer._count.approvalsMade}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Reviews Made</p>
                </div>
                <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedVolunteer.animalsFed}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Animals Fed</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Member Since</p>
                  <p className="text-[var(--color-text-primary)]">
                    {new Date(selectedVolunteer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Subscription Status</p>
                  <p className="text-[var(--color-text-primary)]">
                    {selectedVolunteer.subscriptionStatus || "No Subscription"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
