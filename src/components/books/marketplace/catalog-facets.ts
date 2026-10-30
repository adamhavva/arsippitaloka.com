"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Facet katalog yang relatif statis (daftar tab & kategori).
 *
 * Dipisah dari `CatalogView` supaya bisa di-cache: daftar ini jarang
 * berubah, sementara query buku di `CatalogView` selalu bergantung pada
 * filter/searchParams (jadi tidak boleh di-cache).
 *
 * Cache di-invalidate lewat `updateTag("content")` dari admin CRUD.
 */
export async function getCatalogTabs() {
  cacheTag("content");
  return prisma.contentTab.findMany({
    orderBy: { order: "asc" },
    select: { id: true, label: true, slug: true },
  });
}

export async function getCatalogCategories() {
  cacheTag("content");
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });
}
