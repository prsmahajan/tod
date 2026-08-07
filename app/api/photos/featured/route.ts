import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS, Query } from '@/lib/appwrite/server';
import { createFeaturedFeedingResponse } from '@/lib/public-data/featured-feeding';

async function loadUserPhotoDocuments(): Promise<unknown[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.USER_PHOTOS,
    [
      Query.equal('status', 'approved'),
      Query.equal('featured', true),
      Query.orderDesc('$createdAt'),
      Query.limit(20),
    ]
  );

  return response.documents;
}

export async function GET() {
  return createFeaturedFeedingResponse(
    {
      loadDocuments: loadUserPhotoDocuments,
      getImageUrl: (imageId) => storage.getFilePreview(
        BUCKETS.USER_UPLOADS,
        imageId,
        400,
        300,
      ).toString(),
    },
    (error) => console.error('Error fetching featured photos:', error),
  );
}
