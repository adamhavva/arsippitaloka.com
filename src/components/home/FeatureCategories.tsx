import { BookOpen, User, Monitor, Building2, Wifi, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";

const icons = { BookOpen, User, Monitor, Building2, Wifi, Flame } as const;

export default async function FeatureCategories() {
  "use cache";
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

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
        {categories.map((category) => {
          const Icon = icons[category.icon as keyof typeof icons] ?? BookOpen;

          if (category.highlight) {
            return (
              <div
                key={category.id}
                className="flex flex-col items-center justify-center gap-3 rounded-xl bg-maroon-dark py-8 text-center"
              >
                <span className="text-lg font-black leading-none text-yellow-400">
                  #VIRAL
                  <br />
                  FOR
                  <br />
                  JUSTICE
                </span>
                <span className="text-sm font-medium text-white">
                  {category.name}
                </span>
              </div>
            );
          }

          return (
            <div
              key={category.id}
              className="flex flex-col items-center justify-center gap-3 rounded-xl bg-neutral-50 py-8"
            >
              <Icon size={28} className="text-maroon-dark" strokeWidth={1.5} />
              <span className="text-sm font-medium text-black">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
