"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/appwrite/auth';
import { storage, databases, DATABASE_ID, COLLECTIONS, BUCKETS } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview: string;
  id?: string;
}

export default function UploadPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [feedDate, setFeedDate] = useState(new Date().toISOString().split('T')[0]);
  const [animalCount, setAnimalCount] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || files.length === 0) {
      toast.error('Please select at least one photo.');
      return;
    }

    setUploading(true);

    try {
      // Upload all files to Appwrite storage
      const uploadedFileIds: string[] = [];

      for (const uploadedFile of files) {
        const response = await storage.createFile(
          BUCKETS.USER_UPLOADS,
          ID.unique(),
          uploadedFile.file
        );
        uploadedFileIds.push(response.$id);
      }

      // Create document in user_photos collection
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PHOTOS,
        ID.unique(),
        {
          userId: user.$id,
          userEmail: user.email || '',
          userName: user.name || '',
          imageIds: uploadedFileIds,
          description,
          location: location || null,
          status: 'pending',
          feedDate: new Date(feedDate).toISOString(),
          animalCount: animalCount || null,
          featured: false,
        }
      );

      setSuccess(true);
      setFiles([]);
      setDescription('');
      setLocation('');
      setAnimalCount('');

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
        Upload Photos
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Share your animal feeding moments with the community. Approved photos may be featured on our site.
      </p>

      {success && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-600 font-medium">Photos uploaded successfully!</p>
          <p className="text-sm text-green-600/80 mt-1">
            Your submission is pending review. We&apos;ll notify you once it&apos;s approved.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Photos (max 5)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-text-secondary)] transition-colors"
          >
            <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              Click to select photos or drag and drop
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              JPG, PNG up to 10MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell us about this feeding moment..."
            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-text-secondary)]"
            required
          />
        </div>

        {/* Location and Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lucknow, UP"
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-text-secondary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Feeding Date
            </label>
            <input
              type="date"
              value={feedDate}
              onChange={(e) => setFeedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-secondary)]"
              required
            />
          </div>
        </div>

        {/* Animal Count */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Number of Animals Fed (optional)
          </label>
          <input
            type="number"
            value={animalCount}
            onChange={(e) => setAnimalCount(e.target.value ? parseInt(e.target.value) : '')}
            min="1"
            placeholder="e.g., 5"
            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-text-secondary)]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || files.length === 0}
          className="w-full py-3 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Submit for Review'}
        </button>
      </form>

      {/* Guidelines */}
      <div className="mt-8 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
        <h3 className="font-medium text-[var(--color-text-primary)]">Photo Guidelines</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
          <li>• Photos should clearly show animals being fed or helped</li>
          <li>• Avoid blurry or low-quality images</li>
          <li>• Do not include personal information in photos</li>
          <li>• Photos may take 24-48 hours to be reviewed</li>
          <li>• Approved photos may be featured in our gallery</li>
        </ul>
      </div>
    </div>
  );
}
