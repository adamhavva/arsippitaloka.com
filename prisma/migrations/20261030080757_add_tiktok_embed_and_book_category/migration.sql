-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "tiktokEmbed" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TiktokPost" ADD COLUMN     "embedUrl" TEXT;

-- CreateIndex
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
