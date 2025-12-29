-- CreateEnum
CREATE TYPE "AnimalSpecies" AS ENUM ('DOG', 'CAT', 'COW', 'PIGEON', 'BULL');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('HUNGRY', 'FED_TODAY', 'RESCUED', 'ADOPTED');

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "species" "AnimalSpecies" NOT NULL,
    "photoUrl" TEXT,
    "shortStory" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AnimalStatus" NOT NULL,
    "location" TEXT NOT NULL,
    "firstSpottedDate" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Animal_slug_key" ON "Animal"("slug");

-- CreateIndex
CREATE INDEX "Animal_slug_idx" ON "Animal"("slug");

-- CreateIndex
CREATE INDEX "Animal_species_idx" ON "Animal"("species");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Animal_featured_idx" ON "Animal"("featured");

-- CreateIndex
CREATE INDEX "Animal_firstSpottedDate_idx" ON "Animal"("firstSpottedDate");
