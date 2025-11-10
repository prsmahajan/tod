// Run this script to clear photos uploaded in development
// Usage: npx tsx scripts/clear-local-photos.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearLocalPhotos() {
  try {
    // First, let's see what we have
    const allPhotos = await prisma.animalPhoto.findMany({
      select: { id: true, imageUrl: true },
    });

    console.log(`📊 Total photos in database: ${allPhotos.length}`);

    const localPhotos = allPhotos.filter(p => !p.imageUrl.startsWith('http'));
    console.log(`🗑️  Local photos to delete: ${localPhotos.length}`);

    if (localPhotos.length > 0) {
      console.log("Local photos:");
      localPhotos.forEach(p => console.log(`  - ${p.imageUrl}`));
    }

    // Delete all photos with local URLs (not starting with http)
    const result = await prisma.animalPhoto.deleteMany({
      where: {
        imageUrl: {
          not: {
            startsWith: "http",
          },
        },
      },
    });

    console.log(`\n✅ Deleted ${result.count} local-only photos from database`);
    console.log("You can now upload photos again in production - they'll use Vercel Blob storage");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLocalPhotos();
