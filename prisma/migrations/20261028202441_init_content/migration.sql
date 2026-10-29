-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTab" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ContentTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'Indonesia',
    "pages" INTEGER NOT NULL,
    "readCount" INTEGER NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "priceUsd" DECIMAL(10,2) NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tabSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "checklist" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContentTab_slug_key" ON "ContentTab"("slug");

-- CreateIndex
CREATE INDEX "Book_tabSlug_idx" ON "Book"("tabSlug");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_tabSlug_fkey" FOREIGN KEY ("tabSlug") REFERENCES "ContentTab"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
