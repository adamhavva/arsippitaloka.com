/**
 * Lihat daftar postingan TikTok yang tersimpan (tanpa membocorkan data sensitif).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const posts = await prisma.tiktokPost.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      videoId: true,
      title: true,
      author: true,
      published: true,
      order: true,
    },
  });

  console.log(`postingan TikTok: ${posts.length}`);
  for (const post of posts) {
    console.log(
      `- ${post.videoId} | ${post.title} | @${post.author ?? "-"} | tayang: ${post.published} | order: ${post.order}`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
