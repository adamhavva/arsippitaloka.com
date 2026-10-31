-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT,
    "coverUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'berita-terkini',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_type_idx" ON "Article"("type");

-- AlterTable
ALTER TABLE "SocialMedia" ADD COLUMN "articleId" TEXT;

-- CreateIndex
CREATE INDEX "SocialMedia_articleId_idx" ON "SocialMedia"("articleId");

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "tabId";

-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "contentTabId";

-- DropTable
DROP TABLE "ContentTab";
