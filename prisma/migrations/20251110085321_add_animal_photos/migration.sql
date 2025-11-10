-- CreateTable
CREATE TABLE "AnimalPhoto" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimalPhoto_uploadedBy_idx" ON "AnimalPhoto"("uploadedBy");

-- CreateIndex
CREATE INDEX "AnimalPhoto_isActive_idx" ON "AnimalPhoto"("isActive");

-- CreateIndex
CREATE INDEX "AnimalPhoto_order_idx" ON "AnimalPhoto"("order");

-- AddForeignKey
ALTER TABLE "AnimalPhoto" ADD CONSTRAINT "AnimalPhoto_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
