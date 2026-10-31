import { prisma } from "@/lib/prisma";
import { clampPage, parsePage } from "@/lib/pagination";
import MarketPagination from "@/components/books/marketplace/MarketPagination";
import { parseMarketPer } from "@/components/books/marketplace/market-utils";
import ArticleCard from "./ArticleCard";

/**
 * Katalog artikel (Berita Terkini / Blog / UMKM).
 *
 * Artikel BUKAN produk: tidak ada harga, keranjang, atau checkout — hanya
 * dibaca. Paginasi server-side (skip/take + count). Membaca `page`/`per` dari
 * URL, jadi dipakai di dalam boundary `<Suspense>` + `connection()`.
 */
export default async function ArticleCatalog({
  type,
  heading,
  basePath,
  page: pageParam,
  per: perParam,
}: {
  type: "berita-terkini" | "blog" | "umkm";
  heading: string;
  basePath: string;
  page?: string;
  per?: string;
}) {
  const perPage = parseMarketPer(perParam);
  const page = parsePage(pageParam);

  const where = { type, published: true } as const;
  const total = await prisma.article.count({ where });
  const currentPage = clampPage(page, total, perPage);

  const articles = await prisma.article.findMany({
    where,
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    skip: (currentPage - 1) * perPage,
    take: perPage,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverUrl: true,
      type: true,
      publishedAt: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-sm font-medium text-maroon">Kanal</p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {total} artikel.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">
          Belum ada artikel pada kanal ini.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8">
            <MarketPagination
              basePath={basePath}
              page={currentPage}
              perPage={perPage}
              total={total}
              params={{ per: String(perPage) }}
              label="artikel"
            />
          </div>
        </>
      )}
    </div>
  );
}
