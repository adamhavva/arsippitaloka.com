-- Tambah kolom slug ke Documentation dengan aman untuk baris yang sudah ada:
-- 1) tambah nullable, 2) backfill slug dari title, 3) jadikan NOT NULL + unik.

ALTER TABLE "Documentation" ADD COLUMN "slug" TEXT;

-- Backfill: slug dari title (huruf kecil, non-alfanumerik jadi '-', trim '-').
-- Baris tanpa title yang bisa di-slug memakai fallback dari id supaya tetap unik.
UPDATE "Documentation"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')), ''),
  'dokumentasi-' || substr("id", 1, 8)
);

-- Jaga keunikan bila ada tabrakan slug hasil backfill: tambahkan potongan id.
UPDATE "Documentation" d
SET "slug" = d."slug" || '-' || substr(d."id", 1, 6)
WHERE EXISTS (
  SELECT 1 FROM "Documentation" o
  WHERE o."slug" = d."slug" AND o."id" <> d."id"
);

ALTER TABLE "Documentation" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Documentation_slug_key" ON "Documentation"("slug");
