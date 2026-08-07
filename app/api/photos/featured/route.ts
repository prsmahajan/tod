import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS, Query } from '@/lib/appwrite/server';
import { respondWithPublicData } from '@/lib/public-data/availability';

interface FeaturedPhotoRecord {
  id: string;
  imageUrl: string;
  description: string;
  userName: string;
  location?: string;
  feedDate: string;
  animalCount?: number;
  source: 'user';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function loadUserPhotos(): Promise<FeaturedPhotoRecord[]> {
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

  return response.documents.flatMap((doc: any): FeaturedPhotoRecord[] => {
    if (
      !Array.isArray(doc.imageIds)
      || doc.imageIds.length === 0
      || !isNonEmptyString(doc.imageIds[0])
      || !isNonEmptyString(doc.$id)
      || !isNonEmptyString(doc.description)
      || !isNonEmptyString(doc.userName)
      || !isNonEmptyString(doc.feedDate)
      || Number.isNaN(Date.parse(doc.feedDate))
    ) {
      return [];
    }

    const imageUrl = storage.getFilePreview(
      BUCKETS.USER_UPLOADS,
      doc.imageIds[0],
      400,
      300,
    ).toString();

    return [{
      id: doc.$id.trim(),
      imageUrl,
      description: doc.description.trim(),
      userName: doc.userName.trim(),
      location: isNonEmptyString(doc.location) ? doc.location.trim() : undefined,
      feedDate: doc.feedDate.trim(),
      animalCount: Number.isInteger(doc.animalCount) && doc.animalCount > 0
        ? doc.animalCount
        : undefined,
      source: 'user' as const,
    }];
  });
}

export async function GET() {
  return respondWithPublicData(
    async () => {
      const items = await loadUserPhotos();

      const uniquePhotos = items.reduce<FeaturedPhotoRecord[]>((photos, photo) => {
        if (!photos.some((existing) => existing.imageUrl === photo.imageUrl)) {
          photos.push(photo);
        }
        return photos;
      }, []);

      return { photos: uniquePhotos };
    },
    'Featured feeding records are unavailable right now.',
    (error) => console.error('Error fetching featured photos:', error),
  );
}
