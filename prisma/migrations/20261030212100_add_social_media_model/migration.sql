-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "author" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'tiktok',
    "videoId" TEXT NOT NULL,
    "embedUrl" TEXT,
    "coverUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "bookId" TEXT,
    "documentationId" TEXT,
    "contentTabId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMedia_bookId_idx" ON "SocialMedia"("bookId");

-- CreateIndex
CREATE INDEX "SocialMedia_documentationId_idx" ON "SocialMedia"("documentationId");

-- CreateIndex
CREATE INDEX "SocialMedia_contentTabId_idx" ON "SocialMedia"("contentTabId");

-- CreateIndex
CREATE INDEX "SocialMedia_platform_idx" ON "SocialMedia"("platform");

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_contentTabId_fkey" FOREIGN KEY ("contentTabId") REFERENCES "ContentTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;
