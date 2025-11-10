// Run this script to clear photos uploaded in development
// Usage: npx tsx scripts/clear-local-photos.ts

import { prisma } from "../lib/db";

async function clearLocalPhotos() {
  try {
    // Delete all photos with local URLs (not starting with http)
    const result = await prisma.animalPhoto.deleteMany({
      where: {
        imageUrl: {
          startsWith: "/",
        },
      },
    });

    console.log(`✅ Deleted ${result.count} local-only photos from database`);
    console.log("You can now upload photos again in production - they'll use Vercel Blob storage");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLocalPhotos();
