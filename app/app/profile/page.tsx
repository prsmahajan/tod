"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, account } from '@/lib/appwrite/auth';
import { toast } from 'sonner';
import { Upload, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Update user preferences with avatar URL directly using Appwrite
      await account.updatePrefs({
        ...user.prefs,
        avatar: data.url,
      });

      // Refresh user data
      await refreshUser();

      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const currentAvatar = previewUrl || user?.prefs?.avatar;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }

    setSavingName(true);
    try {
      // Update name in Appwrite auth profile
      await account.updateName(trimmed);

      // Update name in PostgreSQL profile (used in admin dashboard, uploads, etc.)
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      await refreshUser();
      toast.success('Name updated successfully');
    } catch (error: any) {
      console.error('Name update error:', error);
      toast.error(error.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Profile Settings
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-8">
        {/* Profile Picture Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Profile Picture
          </h2>

          <div className="flex items-start gap-6">
            {/* Avatar Display */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--color-bg)] border-2 border-[var(--color-border)] flex items-center justify-center">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-[var(--color-text-secondary)]" />
                )}
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>

              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Account Information
          </h2>

          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Contact support to change your email address
              </p>
            </div>
            <button
              type="submit"
              disabled={savingName}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {savingName ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
