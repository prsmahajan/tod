import { NextResponse } from 'next/server';
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKETS, Query } from '@/lib/appwrite/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Fetch featured photos from user_photos (Appwrite)
    let userPhotos: any[] = [];
    try {
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

      userPhotos = response.documents.map((doc: any) => {
        const imageUrl = doc.imageIds && doc.imageIds.length > 0
          ? storage.getFilePreview(BUCKETS.USER_UPLOADS, doc.imageIds[0], 400, 300).href
          : null;

        return {
          id: doc.$id,
          imageUrl,
          description: doc.description,
          userName: doc.userName,
          location: doc.location,
          feedDate: doc.feedDate,
          animalCount: doc.animalCount,
          source: 'user',
        };
      }).filter((photo: any) => photo.imageUrl);
    } catch (error) {
      console.error('Error fetching user photos from Appwrite:', error);
    }

    // Fetch active photos from admin uploads (Prisma)
    let adminPhotos: any[] = [];
    try {
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

      adminPhotos = adminPhotosData.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        description: photo.caption,
        userName: photo.uploader.name,
        source: 'admin',
      }));
    } catch (error) {
      console.error('Error fetching admin photos from Prisma:', error);
    }

    // Combine both sources
    const allPhotos = [...adminPhotos, ...userPhotos];

    return NextResponse.json({ photos: allPhotos });
  } catch (error: any) {
    console.error('Error fetching featured photos:', error);
    return NextResponse.json({ photos: [] });
  }
}
