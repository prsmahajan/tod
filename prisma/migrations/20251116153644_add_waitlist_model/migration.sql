-- CreateEnum
CREATE TYPE "SharePlatform" AS ENUM ('TWITTER', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'LINKEDIN', 'COPY_LINK', 'NATIVE');

-- CreateTable
CREATE TABLE "AnimalShare" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "platform" "SharePlatform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimalShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimalShare_animalId_idx" ON "AnimalShare"("animalId");

-- CreateIndex
CREATE INDEX "AnimalShare_platform_idx" ON "AnimalShare"("platform");

-- CreateIndex
CREATE INDEX "AnimalShare_createdAt_idx" ON "AnimalShare"("createdAt");

-- AddForeignKey
ALTER TABLE "AnimalShare" ADD CONSTRAINT "AnimalShare_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "referredBy" TEXT,
    "source" TEXT,
    "position" INTEGER NOT NULL,
    "referralCode" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_referralCode_key" ON "Waitlist"("referralCode");

-- CreateIndex
CREATE INDEX "Waitlist_email_idx" ON "Waitlist"("email");

-- CreateIndex
CREATE INDEX "Waitlist_referralCode_idx" ON "Waitlist"("referralCode");

-- CreateIndex
CREATE INDEX "Waitlist_referredBy_idx" ON "Waitlist"("referredBy");

-- CreateIndex
CREATE INDEX "Waitlist_position_idx" ON "Waitlist"("position");

-- CreateIndex
CREATE INDEX "Waitlist_joinedAt_idx" ON "Waitlist"("joinedAt");
