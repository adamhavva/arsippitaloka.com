import { prisma } from "@/lib/prisma";

const SOCIAL_SELECT = {
  id: true, title: true, platform: true, videoId: true,
  embedUrl: true, coverUrl: true, caption: true, author: true,
} as const;

export async function getBookRelations(bookId: string) {
  const socialMedia = await prisma.socialMedia.findMany({
    where: { bookId, published: true },
    orderBy: { order: "asc" },
    select: SOCIAL_SELECT,
  });
  return { socialMedia };
}

export async function getDocumentationRelations(documentationId: string) {
  const socialMedia = await prisma.socialMedia.findMany({
    where: { documentationId, published: true },
    orderBy: { order: "asc" },
    select: SOCIAL_SELECT,
  });
  return { socialMedia };
}

export async function getTabRelations(contentTabId: string) {
  const socialMedia = await prisma.socialMedia.findMany({
    where: { contentTabId, published: true },
    orderBy: { order: "asc" },
    select: SOCIAL_SELECT,
  });
  return { socialMedia };
}
