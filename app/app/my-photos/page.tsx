"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/appwrite/auth';
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import type { UserPhoto } from '@/lib/appwrite/types';

export default function MyPhotosPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    async function fetchPhotos() {
      if (!user?.$id) return;

      try {
        const queries = [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
        ];

        if (filter !== 'all') {
          queries.push(Query.equal('status', filter));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USER_PHOTOS,
          queries
        );

        setPhotos(response.documents as unknown as UserPhoto[]);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [user?.$id, filter]);

  const getImageUrl = (imageId: string) => {
    return storage.getFilePreview(BUCKETS.USER_UPLOADS, imageId, 400, 300).href;
  };

  const getStatusBadge = (status: UserPhoto['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-600 rounded-full">
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Loading your photos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            My Photos
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            View and track your submitted photos.
          </p>
        </div>
        <Link
          href="/app/upload"
          className="px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Upload New
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
          <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            {photos.length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
          <p className="font-heading text-2xl font-bold text-green-600">
            {photos.filter((p) => p.status === 'approved').length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Approved</p>
        </div>
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
          <p className="font-heading text-2xl font-bold text-yellow-600">
            {photos.filter((p) => p.status === 'pending').length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Pending</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-8 flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              filter === f
                ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)]'
                : 'bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.$id}
              className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden"
            >
              {/* Image Preview */}
              {photo.imageIds && photo.imageIds.length > 0 && (
                <div className="relative">
                  <img
                    src={getImageUrl(photo.imageIds[0])}
                    alt={photo.description}
                    className="w-full h-48 object-cover"
                  />
                  {photo.imageIds.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      +{photo.imageIds.length - 1} more
                    </div>
                  )}
                  {photo.featured && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--color-accent)] text-[var(--color-bg)] text-xs font-medium rounded">
                      Featured
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text-primary)] line-clamp-2">
                      {photo.description}
                    </p>
                  </div>
                  {getStatusBadge(photo.status)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                  <span>
                    {new Date(photo.feedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {photo.location && (
                    <>
                      <span>•</span>
                      <span>{photo.location}</span>
                    </>
                  )}
                  {photo.animalCount && (
                    <>
                      <span>•</span>
                      <span>{photo.animalCount} animals</span>
                    </>
                  )}
                </div>

                {/* Rejection Reason */}
                {photo.status === 'rejected' && photo.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-500">
                    <strong>Reason:</strong> {photo.rejectionReason}
                  </div>
                )}

                {/* Submitted Date */}
                <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                  Submitted: {new Date(photo.$createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            {filter !== 'all' ? `No ${filter} photos` : 'No photos uploaded yet'}
          </p>
          <Link
            href="/app/upload"
            className="mt-4 inline-block px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Upload Your First Photo
          </Link>
        </div>
      )}
    </div>
  );
}
