"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
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

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your site configuration and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="The Open Draft"
            />
            <p className="text-xs text-gray-500 mt-1">The name of your publication</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full border rounded-lg p-3"
              placeholder="Helping you understand the technology that runs your systems."
            />
            <p className="text-xs text-gray-500 mt-1">A brief description of your site</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="https://yourdomain.com"
            />
            <p className="text-xs text-gray-500 mt-1">Your site's primary URL</p>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Email Settings</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">From Email Address</label>
            <input
              type="email"
              value={settings.emailFrom}
              onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="newsletter@yourdomain.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address used for sending newsletters (configured in environment variables)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="contact@yourdomain.com"
            />
            <p className="text-xs text-gray-500 mt-1">Public email address for contact inquiries</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Social Media</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Twitter/X Handle</label>
            <input
              type="text"
              value={settings.twitterHandle}
              onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="@yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={settings.linkedinUrl}
              onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">GitHub URL</label>
            <input
              type="url"
              value={settings.githubUrl}
              onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
              className="w-full border rounded-lg p-3"
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Features</h2>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">Newsletter</label>
              <p className="text-xs text-gray-500 mt-1">
                Enable or disable newsletter subscriptions
              </p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">Comments</label>
              <p className="text-xs text-gray-500 mt-1">
                Enable comments on posts (feature coming soon)
              </p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
