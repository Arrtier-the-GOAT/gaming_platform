import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./server/migrations/schema.ts",
  out: "./server/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
