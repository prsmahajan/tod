-- Delete all animal photos with local file paths (not http URLs)
-- Run this in your database console or via Prisma Studio

DELETE FROM "AnimalPhoto"
WHERE "imageUrl" NOT LIKE 'http%';

-- This will remove all photos that start with "/" (local filesystem paths)
-- Only keeps photos with full HTTP URLs (Vercel Blob storage)
