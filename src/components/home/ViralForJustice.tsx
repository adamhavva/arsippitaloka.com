import Image from "next/image";

export default function ViralForJustice() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="text-sm font-medium text-maroon">Now in 2026</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-black md:text-4xl">
            #ViralForJustice
            <br />
            Rieke Diah Pitaloka
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            Fenomena viral for justice kini menjadi alternatif utama
            masyarakat dalam memperjuangkan keadilan ketika jalur hukum formal
            terasa lambat dan tidak berpihak. Kekuatan suara netizen di media
            sosial terbukti mampu menekan pihak berwenang untuk mengusut
            tuntas berbagai kasus kejahatan maupun ketidakadilan yang
            sebelumnya terabaikan. Namun, di balik efektivitasnya sebagai
            kontrol sosial, gerakan ini juga menyimpan risiko besar seperti
            sanksi sosial yang salah sasaran hingga penggiringan opini tanpa
            bukti sah. Oleh karena itu, kesadaran dan etika masyarakat dalam
            menyaring informasi tetap menjadi kunci agar keadilan yang
            diperjuangkan tidak berubah menjadi aksi main hakim sendiri di
            dunia maya.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm font-medium text-black">
            <span>TikTok</span>
            <span>YouTube</span>
            <span>Instagram</span>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-sm">
          <div className="absolute left-0 top-4 h-[300px] w-[70%] -rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg">
            <Image
              src="/images/viral-justice-poster.jpg"
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="absolute right-0 top-4 h-[300px] w-[70%] rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg">
            <Image
              src="/images/viral-justice-poster.jpg"
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-x-8 top-0 h-[360px] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/viral-justice-poster.jpg"
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="h-1.5 w-4 rounded-full bg-maroon-dark" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
