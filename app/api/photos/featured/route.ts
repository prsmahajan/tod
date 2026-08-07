import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS, Query } from '@/lib/appwrite/server';
import { prisma } from '@/lib/db';
import {
  collectAvailableSourceItems,
  respondWithPublicData,
} from '@/lib/public-data/availability';

interface FeaturedPhotoRecord {
  id: string;
  imageUrl: string;
  description: string | null;
  userName: string;
  location?: string;
  feedDate?: string;
  animalCount?: number;
  source: 'user' | 'admin';
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
    if (!doc.imageIds || doc.imageIds.length === 0) return [];

    const imageUrl = storage.getFilePreview(
      BUCKETS.USER_UPLOADS,
      doc.imageIds[0],
      400,
      300,
    ).toString();

    return [{
      id: doc.$id,
      imageUrl,
      description: doc.description,
      userName: doc.userName,
      location: doc.location,
      feedDate: doc.feedDate,
      animalCount: doc.animalCount,
      source: 'user' as const,
    }];
  });
}

async function loadAdminPhotos(): Promise<FeaturedPhotoRecord[]> {
  const adminPhotosData = await prisma.animalPhoto.findMany({
    where: {
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
    take: 20,
  });

  return adminPhotosData.map((photo) => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    description: photo.caption,
    userName: photo.uploader.name,
    source: 'admin' as const,
  }));
}

export async function GET() {
  return respondWithPublicData(
    async () => {
      const { items, failedSources } = await collectAvailableSourceItems([
        { name: 'appwrite', load: loadUserPhotos },
        { name: 'prisma', load: loadAdminPhotos },
      ]);

      if (failedSources.length > 0) {
        console.error('Some featured photo sources are unavailable:', failedSources.join(', '));
      }

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
