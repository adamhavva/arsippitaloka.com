/*
  Warnings:

  - You are about to drop the `TikTokPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TikTokPost";

-- CreateTable
CREATE TABLE "TiktokPost" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "author" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiktokPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiktokPost_videoId_key" ON "TiktokPost"("videoId");
