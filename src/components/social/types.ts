/**
 * Tipe data bersama untuk komponen media sosial.
 * Dipakai supaya server component (kartu) dan client component (player)
 * memakai bentuk data yang sama.
 */
export type SocialPostData = {
  id: string;
  title: string;
  platform: string;
  videoId: string;
  embedUrl: string | null;
  coverUrl: string | null;
  caption: string | null;
  author: string | null;
};

export type SocialBookLink = {
  id: string;
  title: string;
  slug: string;
  tabSlug: string | null;
};

export type SocialDocLink = {
  id: string;
  title: string;
};

export type SocialArticleLink = {
  id: string;
  title: string;
  slug: string;
};
