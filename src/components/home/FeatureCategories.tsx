import { BookOpen, User, Monitor, Building2, Wifi } from "lucide-react";

const features = [
  { label: "E-Book", icon: BookOpen },
  { label: "Penulis", icon: User },
  { label: "Biografi", icon: Monitor },
  { label: "Blog", icon: Building2 },
  { label: "Social Media", icon: Wifi },
];

export default function FeatureCategories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-maroon">Featured Categories</p>
          <h2 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
            Feature of Pitaloka
          </h2>
        </div>
        <button className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white">
          View More
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {features.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-3 rounded-xl bg-neutral-50 py-8"
          >
            <Icon size={28} className="text-maroon-dark" strokeWidth={1.5} />
            <span className="text-sm font-medium text-black">{label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-maroon-dark py-8 text-center">
          <span className="text-lg font-black leading-none text-yellow-400">
            #VIRAL
            <br />
            FOR
            <br />
            JUSTICE
          </span>
          <span className="text-sm font-medium text-white">
            #ViralForJustice
          </span>
        </div>
      </div>
    </section>
  );
}
