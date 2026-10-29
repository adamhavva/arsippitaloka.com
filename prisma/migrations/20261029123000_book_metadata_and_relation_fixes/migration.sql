-- Metadata buku lengkap + perbaikan relasi (lihat plan-webadmin-lengkap.md §14)

-- AlterTable: Book — kolom metadata baru (semua nullable / ada default)
ALTER TABLE "Book" ADD COLUMN "slug" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "translator" TEXT,
ADD COLUMN "editor" TEXT,
ADD COLUMN "illustrator" TEXT,
ADD COLUMN "publisher" TEXT,
ADD COLUMN "publishedYear" INTEGER,
ADD COLUMN "edition" TEXT,
ADD COLUMN "isbn" TEXT,
ADD COLUMN "wordCount" INTEGER,
ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fileFormat" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "copyrightHolder" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "tabId" TEXT;

-- Backfill slug unik dari judul (+ id sebagai suffix supaya pasti unik)
UPDATE "Book"
SET "slug" = lower(trim(both '-' FROM regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'))) || '-' || "id";

ALTER TABLE "Book" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- Backfill tabId dari tabSlug lama (FK lama ke ContentTab.slug)
UPDATE "Book" b SET "tabId" = ct."id" FROM "ContentTab" ct WHERE ct."slug" = b."tabSlug";
ALTER TABLE "Book" ALTER COLUMN "tabId" SET NOT NULL;

-- Lepas relasi lama ke slug
ALTER TABLE "Book" DROP CONSTRAINT "Book_tabSlug_fkey";
DROP INDEX "Book_tabSlug_idx";
ALTER TABLE "Book" DROP COLUMN "tabSlug";

-- Relasi baru ke ContentTab.id: slug tab bebas diubah, hapus tab diblokir selama ada buku
CREATE INDEX "Book_tabId_idx" ON "Book"("tabId");
ALTER TABLE "Book" ADD CONSTRAINT "Book_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ContentTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: User — admin bisa menonaktifkan user, bukan hanya menghapus
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Order — paymentRef jadi unik (idempotency webhook), user tidak ikut terhapus
DROP INDEX "Order_paymentRef_idx";
CREATE UNIQUE INDEX "Order_paymentRef_key" ON "Order"("paymentRef");
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: OrderItem — satu buku hanya boleh satu baris per order
DROP INDEX "OrderItem_orderId_idx";
CREATE UNIQUE INDEX "OrderItem_orderId_bookId_key" ON "OrderItem"("orderId", "bookId");
