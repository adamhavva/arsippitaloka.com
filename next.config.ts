import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Upload PDF e-book (maks 500 MB) lewat route di bawah matcher proxy.ts.
    // Default 10 MB membuat body ter-truncate → FormData gagal di-parse.
    proxyClientMaxBodySize: 512 * 1024 * 1024, // 512 MB
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Thumbnail YouTube (disimpan dari field YouTube di admin).
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
