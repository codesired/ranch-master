
import { defineConfig } from "drizzle-kit";

const dbFile = process.env.DATABASE_URL || process.env.SQLITE_FILE || 'ranch_manager.db';

export default defineConfig({
  out: "./migrations/sqlite",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFile,
  },
});
