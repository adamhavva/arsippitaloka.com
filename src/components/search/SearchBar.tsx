"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Suggestion = {
  id: string;
  slug: string;
  title: string;
  author: string;
  tabSlug?: string | null;
};

/**
 * Form pencarian global.
 *
 * Submit → `/cari?q=<kata kunci>` (atau `basePath` lain). Saran diambil
 * dari `GET /api/search?q=` dengan debounce, dimunculkan sebagai dropdown.
 *
 * Dipakai di navbar/footer/hero beranda, halaman katalog, dan area admin.
 */
export default function SearchBar({
  defaultValue = "",
  placeholder = "Cari buku…",
  size = "md",
  autoFocus = false,
  className = "",
  basePath = "/cari",
  withSuggestions = true,
  inputClassName = "",
  buttonClassName = "",
}: {
  defaultValue?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  className?: string;
  /** Halaman tujuan hasil pencarian. */
  basePath?: string;
  /** Tampilkan dropdown saran dari `/api/search`. */
  withSuggestions?: boolean;
  inputClassName?: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: { wrap: "h-9", input: "text-sm", pad: "px-3" },
    md: { wrap: "h-11", input: "text-sm", pad: "px-4" },
    lg: { wrap: "h-14", input: "text-base", pad: "px-5" },
  }[size];

  // Saran: debounce 250 ms, batalkan bila ketikan berikutnya.
  useEffect(() => {
    if (!withSuggestions) return;
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { results?: Suggestion[] };
        setSuggestions((data.results ?? []).slice(0, 8));
        setOpen(true);
      } catch {
        // Gagal fetch saran diabaikan — kolom pencarian tetap bisa dipakai.
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, withSuggestions]);

  // Tutup dropdown saat klik di luar atau tekan Escape.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    setOpen(false);
    if (!query) {
      router.push(basePath);
      return;
    }
    router.push(`${basePath}?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={submit}
        className={`flex w-full items-center overflow-hidden rounded-full border border-neutral-300 bg-white ${sizes.wrap}`}
      >
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <input
          id={inputId}
          type="search"
          name="q"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent ${sizes.pad} ${sizes.input} text-neutral-900 outline-none placeholder:text-neutral-400 ${inputClassName}`}
        />
        <button
          type="submit"
          aria-label="Cari"
          className={`flex h-full shrink-0 items-center justify-center bg-maroon-dark px-4 text-white transition hover:bg-maroon ${buttonClassName}`}
        >
          <Search size={size === "lg" ? 22 : 18} />
        </button>
      </form>

      {open && suggestions.length > 0 ? (
        <ul
          role="listbox"
          aria-label="Saran pencarian"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          {suggestions.map((item) => (
            <li key={item.id} role="option" aria-selected={false}>
              <Link
                href={
                  item.tabSlug
                    ? `/buku/${item.tabSlug}/${item.slug}`
                    : `/buku/${item.slug}`
                }
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 hover:bg-neutral-50"
              >
                <span className="block truncate text-sm font-medium text-neutral-900">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-neutral-500">
                  {item.author}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
