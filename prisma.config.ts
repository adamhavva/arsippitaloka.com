import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Migrate butuh koneksi session/direct (port 5432), bukan pooler transaction (6543).
    url: process.env.DIRECT_URL,
  },
});
