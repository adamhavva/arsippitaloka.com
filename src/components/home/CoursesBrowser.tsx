"use client";

import { useState } from "react";
import Link from "next/link";
import BookCard, { type BookCardData } from "@/components/books/BookCard";

export type CourseTab = { id: string; label: string; slug: string };

/**
 * Baris tab konten + daftar buku di beranda. Tabnya bisa diklik: buku yang
 * ditampilkan mengikuti tab yang dipilih. Kelola tabnya di admin → Tab Konten.
 */
export default function CoursesBrowser({
  tabs,
  booksByTab,
  eyebrow,
  title,
  buttonLabel,
}: {
  tabs: CourseTab[];
  booksByTab: Record<string, BookCardData[]>;
  eyebrow: string;
  title: string;
  buttonLabel: string;
}) {
  const [activeSlug, setActiveSlug] = useState(tabs[0]?.slug ?? "");
  const active = tabs.find((tab) => tab.slug === activeSlug);
  const books = booksByTab[activeSlug] ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 lg:pb-20">
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
        <div>
          <p className="text-xs font-medium text-maroon sm:text-sm">{eyebrow}</p>
          <h2 className="font-heading mt-1 text-xl font-bold text-black sm:text-2xl md:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          href={active ? `/buku/${active.slug}` : "/buku"}
          className="shrink-0 rounded-full bg-maroon-dark px-4 py-2 text-sm font-medium text-white sm:px-5 sm:py-2"
        >
          {buttonLabel}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSlug(tab.slug)}
            aria-pressed={tab.slug === activeSlug}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              tab.slug === activeSlug
                ? "bg-maroon-dark text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="font-medium text-black">
            Belum ada buku di tab {active?.label ?? "ini"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Tambahkan buku di admin → Buku, lalu pilih tab ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
