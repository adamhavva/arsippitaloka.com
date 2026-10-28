import Image from "next/image";

const browseLinks = [
  "E- Book",
  "Social Media",
  "Dokumentasi",
  "Biografi",
  "Berita Terkini",
  "Perpustakaan Digital",
  "Subscription",
];

const platformLinks = ["Contact", "Help", "About"];

export default function Footer() {
  return (
    <footer className="bg-maroon-dark px-6 pt-16 pb-6 text-white md:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/images/logo-pitaloka.png"
            alt="Pitaloka"
            width={160}
            height={60}
            className="h-9 w-auto"
          />
          <div className="mt-6 flex max-w-sm overflow-hidden rounded-full bg-white p-1.5">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-4 text-sm text-black outline-none placeholder:text-neutral-400"
            />
            <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white">
              Search
            </button>
          </div>
          <p className="mt-3 max-w-sm text-xs text-white/60">
            By subscribing, you agree to our Privacy Policy and consent to
            receive updates from our company.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Browse</p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/70">
            {browseLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Platform</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            {platformLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-white/15 pt-6">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/70 md:flex-row">
          <span>@2026 Pitaloka. All Rights Reserved.</span>
          <div className="flex gap-6">
            <span className="underline">Privacy Policy</span>
            <span className="underline">Terms of Service</span>
            <span className="underline">Cookies Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
