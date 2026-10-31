"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSiteTabs } from "@/lib/site-tabs";

/**
 * Facet katalog yang relatif statis (daftar kategori + daftar kanal).
 *
 * Kanal konten (E-Book, Berita Terkini, YouTube, TikTok, Blog, UMKM,
 * Dokumentasi) sekarang bersifat STATIS — tidak lagi tabel `ContentTab`.
 * Daftar kategori masih dari database.
 *
 * Cache di-invalidate lewat `updateTag("content")` dari admin CRUD.
 */
export async function getCatalogTabs() {
  return getSiteTabs().map((tab) => ({
    id: tab.slug,
    label: tab.label,
    slug: tab.slug,
  }));
}

export async function getCatalogCategories() {
  cacheTag("content");
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });
}
