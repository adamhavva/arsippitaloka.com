import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import { Download, BookOpen } from "lucide-react";
import { requireUser, getPurchasedItems } from "@/lib/library";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

export const metadata = {
  title: "Pustaka Saya — Arsip Pitaloka",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function AccountLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AccountLibraryPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountLibraryPageContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();

  const user = await requireUser();
  const items = await getPurchasedItems(user.id);

  // Satu buku bisa muncul di beberapa order — ambil satu entri terbaru.
  const books = new Map<
    string,
    { book: (typeof items)[number]["book"]; orderId: string; createdAt: Date }
  >();
  for (const item of items) {
    if (!books.has(item.book.id)) {
      books.set(item.book.id, {
        book: item.book,
        orderId: item.order.id,
        createdAt: item.order.createdAt,
      });
    }
  }

  const sp = await searchParams;
  const perPage = parsePerPage(sp.per);
  const allBooks = [...books.values()];
  const total = allBooks.length;
  const page = clampPage(parsePage(sp.page), total, perPage);
  const visibleBooks = allBooks.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">
          Pustaka Saya
        </h1>
        <p className="text-sm text-neutral-500">
          Buku yang sudah Anda beli. Bisa dibaca online dan diunduh.
        </p>
      </header>

      {books.size === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="font-medium text-black">Belum ada buku di pustaka Anda</p>
          <p className="mt-1 text-sm text-neutral-500">
            Buku yang Anda beli akan muncul di sini beserta tombol baca dan
            unduh.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBooks.map(({ book, createdAt }) => {
            const adaFile = Boolean(book.fileUrl);
            const bolehUnduh = adaFile && (book.isDownloadable || book.isFree);

            return (
              <article
                key={book.id}
                className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <div className="relative flex h-40 items-end bg-[#3d2b2e] p-3">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                  <div className="relative z-10 flex gap-2">
                    {book.isFree ? (
                      <span className="rounded-full bg-green-500/80 px-2.5 py-1 text-[11px] font-medium text-white">
                        GRATIS
                      </span>
                    ) : null}
                    {book.archived ? (
                      <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white">
                        Diarsipkan
                      </span>
                    ) : null}
                    <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                      {book.pages} Halaman
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-semibold text-black">{book.title}</h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    by {book.author}
                  </p>
                  <p className="mt-2 text-[11px] text-neutral-400">
                    Diperoleh {createdAt.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {adaFile ? (
                      <a
                        href={`/api/read/${book.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-maroon-dark px-4 py-1.5 text-xs font-medium text-white"
                      >
                        <BookOpen size={14} /> Baca
                      </a>
                    ) : null}

                    {bolehUnduh ? (
                      <a
                        href={`/api/download/${book.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-700"
                      >
                        <Download size={14} /> Unduh
                        {book.fileSize ? (
                          <span className="text-neutral-400">
                            {formatBytes(book.fileSize)}
                          </span>
                        ) : null}
                      </a>
                    ) : null}

                    {!adaFile ? (
                      <p className="text-xs text-neutral-500">
                        File e-book belum tersedia.
                      </p>
                    ) : !bolehUnduh ? (
                      <p className="text-xs text-neutral-500">
                        Buku ini belum bisa diunduh.
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        basePath="/akun"
        page={page}
        perPage={perPage}
        total={total}
        label="buku"
      />
    </div>
  );
}
