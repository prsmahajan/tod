"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS } from '@/lib/appwrite/config';
import { Query, ID } from 'appwrite';
import type { UserPhoto } from '@/lib/appwrite/types';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const queries = [Query.orderDesc('$createdAt')];

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

  const getImageUrl = (imageId: string) => {
    return storage.getFilePreview(BUCKETS.USER_UPLOADS, imageId, 800, 600).href;
  };

  const handleApprove = async (photo: UserPhoto, featured: boolean = false) => {
    setProcessing(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PHOTOS,
        photo.$id,
        {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          featured,
        }
      );

      // If featured, also create an animals_fed entry
      if (featured && photo.imageIds && photo.imageIds.length > 0) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ANIMALS_FED,
          ID.unique(),
          {
            photoId: photo.$id,
            userId: photo.userId,
            userName: photo.userName,
            feedDate: photo.feedDate,
            animalCount: photo.animalCount || null,
            location: photo.location || '',
            imageUrl: getImageUrl(photo.imageIds[0]),
            featured: true,
          }
        );
      }

      setSelectedPhoto(null);
      fetchPhotos();
      toast.success('Photo approved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve photo');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (photo: UserPhoto) => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason.');
      return;
    }

    setProcessing(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PHOTOS,
        photo.$id,
        {
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
        }
      );

      setSelectedPhoto(null);
      setRejectionReason('');
      fetchPhotos();
      toast.success('Photo rejected.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject photo');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: UserPhoto['status']) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-600 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Photo Moderation</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Review and moderate user-submitted photos</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
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
              {f === 'pending' && photos.filter(p => p.status === 'pending').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {photos.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[var(--color-text-secondary)]">Loading photos...</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.$id}
              className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden"
            >
              {photo.imageIds && photo.imageIds.length > 0 && (
                <div className="relative cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  <img
                    src={getImageUrl(photo.imageIds[0])}
                    alt={photo.description}
                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
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

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{photo.userName}</p>
                  {getStatusBadge(photo.status)}
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{photo.description}</p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                  <span>{new Date(photo.feedDate).toLocaleDateString()}</span>
                  {photo.location && <span>• {photo.location}</span>}
                  {photo.animalCount && <span>• {photo.animalCount} animals</span>}
                </div>

                {photo.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="flex-1 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                )}

                {photo.status === 'rejected' && photo.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-500">
                    <strong>Reason:</strong> {photo.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <p className="text-[var(--color-text-secondary)]">
            {filter === 'pending' ? 'No photos pending review' : `No ${filter} photos`}
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Review Photo</h2>
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    setRejectionReason('');
                  }}
                  className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Images */}
              {selectedPhoto.imageIds && selectedPhoto.imageIds.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedPhoto.imageIds.map((imageId, index) => (
                    <img
                      key={imageId}
                      src={getImageUrl(imageId)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Submitted by</p>
                  <p className="text-[var(--color-text-primary)]">{selectedPhoto.userName} ({selectedPhoto.userEmail})</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Description</p>
                  <p className="text-[var(--color-text-primary)]">{selectedPhoto.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Feed Date</p>
                    <p className="text-[var(--color-text-primary)]">{new Date(selectedPhoto.feedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Location</p>
                    <p className="text-[var(--color-text-primary)]">{selectedPhoto.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Animals Fed</p>
                    <p className="text-[var(--color-text-primary)]">{selectedPhoto.animalCount || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {selectedPhoto.status === 'pending' ? (
                <>
                  {/* Rejection Reason Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      placeholder="e.g., Image is blurry, No animals visible..."
                      className="w-full px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedPhoto, false)}
                      disabled={processing}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPhoto, true)}
                      disabled={processing}
                      className="flex-1 py-3 bg-[var(--color-accent)] text-[var(--color-bg)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      Approve & Feature
                    </button>
                    <button
                      onClick={() => handleReject(selectedPhoto)}
                      disabled={processing || !rejectionReason.trim()}
                      className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--color-text-secondary)]">
                    This photo has already been {selectedPhoto.status}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
