import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.socialMedia.upsert({
    where: { id: "seed-social-0" },
    update: {},
    create: {
      id: "seed-social-0",
      title: "Pitaloka di TikTok",
      platform: "tiktok",
      videoId: "7669105916377173269",
      embedUrl: "https://www.tiktok.com/player/v1/7669105916377173269?embed_from=webapp_share&music_info=1&description=1&autoplay=1&muted=1",
      published: true,
      order: 0,
    },
  });
  console.log("Social fixture seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
