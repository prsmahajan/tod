"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/appwrite/auth";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    emailFrom: "",
    contactEmail: "",
    twitterHandle: "",
    linkedinUrl: "",
    githubUrl: "",
    newsletterEnabled: "true",
    commentsEnabled: "false",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "x-user-email": user?.email || "",
  }), [user?.email]);

  const fetchSettings = useCallback(async () => {
    if (!user?.email) return;

    try {
      // Fetch site settings
      const settingsRes = await fetch("/api/settings", {
        headers: { "x-user-email": user.email },
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }

      // Fetch user profile
      const profileRes = await fetch("/api/user/profile", {
        headers: { "x-user-email": user.email },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Fallback to Appwrite prefs if PostgreSQL doesn't have avatar
        const avatarUrl = profileData.avatar || user.prefs?.avatar || null;
        setUserProfile({ ...profileData, avatar: avatarUrl });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#888]">Manage your site configuration and preferences</p>
      </div>

      {/* Profile Section - Read Only */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Profile</h2>

        <div className="flex items-start gap-6">
          {/* Avatar Display */}
          <div className="flex-shrink-0">
            {userProfile?.avatar ? (
              <Image
                src={userProfile.avatar}
                alt={userProfile.name || "Profile"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#3a3a3a]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#000000] border-2 border-[#3a3a3a]"></div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-3">
              <p className="text-sm font-medium text-white mb-1">{userProfile?.name || user?.name || "User"}</p>
              <p className="text-sm text-[#666]">{userProfile?.email || user?.email}</p>
            </div>

            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3">
              <p className="text-xs text-[#888]">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                To update your profile picture, go to <a href="/app/profile" className="text-[#a5b4fc] hover:underline">Profile Settings</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="The Open Draft"
            />
            <p className="text-xs text-[#666] mt-1.5">The name of your publication</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              placeholder="Helping you understand the technology that runs your systems."
            />
            <p className="text-xs text-[#666] mt-1.5">A brief description of your site</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="https://yourdomain.com"
            />
            <p className="text-xs text-[#666] mt-1.5">Your site's primary URL</p>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white mb-4">Email Settings</h2>

          <div>
            <label className="block text-sm font-medium text-white mb-2">From Email Address</label>
            <input
              type="email"
              value={settings.emailFrom}
              onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="newsletter@yourdomain.com"
            />
            <p className="text-xs text-[#666] mt-1.5">Email address used for sending newsletters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="contact@yourdomain.com"
            />
            <p className="text-xs text-[#666] mt-1.5">Public email address for contact inquiries</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white mb-4">Social Media</h2>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Twitter/X Handle</label>
            <input
              type="text"
              value={settings.twitterHandle}
              onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="@yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={settings.linkedinUrl}
              onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">GitHub URL</label>
            <input
              type="url"
              value={settings.githubUrl}
              onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white mb-4">Features</h2>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white">Newsletter</label>
              <p className="text-xs text-[#666] mt-1">Enable or disable newsletter subscriptions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newsletterEnabled === "true"}
                onChange={(e) =>
                  setSettings({ ...settings, newsletterEnabled: e.target.checked ? "true" : "false" })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#3a3a3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white">Comments</label>
              <p className="text-xs text-[#666] mt-1">Enable comments on posts (coming soon)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.commentsEnabled === "true"}
                onChange={(e) =>
                  setSettings({ ...settings, commentsEnabled: e.target.checked ? "true" : "false" })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#3a3a3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
            </label>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-[#fff] px-6 py-3 rounded-lg hover:bg-[#333] disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
