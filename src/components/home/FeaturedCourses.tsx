import Image from "next/image";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function FeaturedCourses() {
  "use cache";
  const [tabs, books] = await Promise.all([
    prisma.contentTab.findMany({ orderBy: { order: "asc" } }),
    prisma.book.findMany({
      where: { tabSlug: "e-book" },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-maroon">Featured Courses</p>
          <h2 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
            Berkembang dan Update bersama Pitaloka
          </h2>
        </div>
        <button className="shrink-0 rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white">
          View More
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              i === 0
                ? "bg-maroon-dark text-white"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="overflow-hidden rounded-xl border border-neutral-100 bg-white"
          >
            <div className="relative flex h-44 items-end bg-[#3d2b2e] p-3">
              {book.coverUrl && (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
              <div className="relative z-10 flex gap-2">
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                  {book.language}
                </span>
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                  {book.pages} Halaman
                </span>
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                  {book.readCount} Di Baca
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-black">{book.title}</h3>
                <span className="flex items-center gap-1 text-sm font-medium text-black">
                  {String(book.rating)}{" "}
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">by {book.author}</p>
              <div className="mt-3 flex items-center gap-2">
                {book.isNew && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    New
                  </span>
                )}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                  SU
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                  ${String(book.priceUsd)}{" "}
                  <span className="font-normal text-neutral-500">/lifetime</span>
                </span>
                <button className="rounded-full bg-maroon-dark px-4 py-1.5 text-xs font-medium text-white">
                  Read Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
