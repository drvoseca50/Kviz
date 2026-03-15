import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

try {
  loadEnvFile(path.resolve(".env.local"));
} catch {
  // .env.local may not exist in CI
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
