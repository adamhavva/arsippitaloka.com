"use client";

import Image from "next/image";

/**
 * Section CTA di halaman `/about`.
 *
 * Potongan PDF `references/layouts/split/MENU ABOUT.pdf` y = 2868,5 pt
 * (judul "Dont Miss Out - Millions Have Joined PITALOKA!" + subjudul +
 * kolom subscribe) dirender jadi `public/images/about-cta.jpg`
 * (2400 × 666 px = 1920 × 532,8 pt, jadi 1 px = 0,8 pt).
 *
 * Semua koordinat di bawah diukur dari piksel gambarnya lalu dikonversi
 * ke pt kanvas PDF:
 *   - pil putih (kotak input) : px 672–1374, 444–565  → pt 537,4–1099,2, 355,2–452
 *   - tombol maroon "Submit"  : px 1374–1702, 459–553 → pt 1099,2–1361,6, 367,2–442,4
 *   - teks "Your email address" yang sudah menyatu di gambar: px 710–1143, 487–521
 *
 * Judul & subjudul CTA TIDAK dirender ulang (sudah menyatu di gambar),
 * hanya input email dan tombolnya yang jadi elemen HTML asli.
 *
 * Di layar kecil (< 640px) baris form terlalu pendek untuk diketik, jadi
 * gambar dipotong pada bagian form (lihat `.media-frame`) dan form email
 * dirender sebagai elemen HTML biasa di bawah gambar.
 */

/** Kanvas PDF potongan CTA: 1920 pt × 532,8 pt (= 666 px / 1,25). */
const PT_W = 1920;
const PT_H = 532.8;

/** Tinggi gambar yang tetap terlihat di layar kecil (px gambar). */
const MOBILE_CROP_PX = 400;

export default function AboutCta() {
  return (
    <section id="cta" className="relative w-full">
      <div
        className="media-frame relative w-full"
        style={
          {
            "--frame-w": "2400",
            "--frame-h": "666",
            "--frame-h-sm": String(MOBILE_CROP_PX),
          } as React.CSSProperties
        }
      >
        <Image
          src="/images/about-cta.jpg"
          alt="Ayo bergabung dengan PITALOKA — daemon email untuk pembaruan PITALOKA"
          width={2400}
          height={666}
          sizes="100vw"
          className="block h-auto w-full"
        />
        <form
          onSubmit={(e) => e.preventDefault()}
          className="absolute inset-0 hidden sm:block"
          style={{ containerType: "inline-size" }}
        >
          {/*
            Placeholder "Your email address" sudah tercetak di dalam pil putih
            pada gambar. Area itu ditutup dengan patch putih supaya teksnya
            tidak dobel dengan placeholder milik input HTML.
          */}
          <div
            aria-hidden
            className="absolute bg-white"
            style={{
              left: `${(560 / PT_W) * 100}%`,
              top: `${(382.4 / PT_H) * 100}%`,
              width: `${((976 - 560) / PT_W) * 100}%`,
              height: `${((425.6 - 382.4) / PT_H) * 100}%`,
            }}
          />
          <input
            type="email"
            name="email"
            required
            aria-label="Your email address"
            placeholder="Your email address"
            className="absolute appearance-none border-0 bg-transparent font-sans outline-none placeholder:text-[#201c1d]/70 focus:outline-none"
            style={{
              left: `${(537.4 / PT_W) * 100}%`,
              top: `${(355.2 / PT_H) * 100}%`,
              width: `${((1098.5 - 537.4) / PT_W) * 100}%`,
              height: `${((452 - 355.2) / PT_H) * 100}%`,
              paddingLeft: "1.594cqw",
              fontSize: "1.9cqw",
              color: "#201c1d",
            }}
          />
          <button
            type="submit"
            className="absolute cursor-pointer font-sans font-medium text-white"
            style={{
              left: `${(1098.5 / PT_W) * 100}%`,
              top: `${(366.1 / PT_H) * 100}%`,
              width: `${((1361.6 - 1098.5) / PT_W) * 100}%`,
              height: `${((442.4 - 366.1) / PT_H) * 100}%`,
              background: "#3e2a2c",
              fontSize: "2.2cqw",
            }}
          >
            Submit
          </button>
        </form>
      </div>

      {/* Form email versi mobile — target ketik & tinggi tombol normal. */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-6 sm:hidden"
      >
        <label htmlFor="cta-email-mobile" className="sr-only">
          Your email address
        </label>
        <input
          id="cta-email-mobile"
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="h-12 w-full rounded-full border border-neutral-300 bg-white px-5 font-sans text-base text-[#201c1d] outline-none placeholder:text-[#201c1d]/60 focus:border-[#3e2a2c]"
        />
        <button
          type="submit"
          className="h-12 w-full rounded-full bg-[#3e2a2c] font-sans text-base font-medium text-white"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
