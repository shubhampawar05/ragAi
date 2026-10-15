import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
dotenv.config({ path: path.join(backendRoot, ".env") });

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  LOCAL_STORAGE_DIR: z.string().default("storage/uploads"),
});

function printEnvHelp(missing) {
  console.error("\n❌ Backend environment is not configured.\n");
  if (missing.length) {
    console.error("Missing or empty variables:");
    missing.forEach((name) => console.error(`  - ${name}`));
    console.error("");
  }
  console.error("Setup:");
  console.error(`  1. cd ${backendRoot}`);
  console.error("  2. cp .env.example .env");
  console.error("  3. Set DATABASE_URL (Postgres connection string)");
  console.error("     Supabase: Project Settings → Database → Connection string → URI");
  console.error("     Use pooler (port 6543) for production-style server apps.");
  console.error("  4. Set OPENAI_API_KEY\n");
}

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .filter((i) => i.code === "invalid_type" && i.received === "undefined")
    .map((i) => i.path.join("."));
  const empty = parsed.error.issues
    .filter((i) => i.code === "too_small" || i.message?.includes("required"))
    .map((i) => i.path.join("."));
  printEnvHelp([...new Set([...missing, ...empty])]);
  process.exit(1);
}

export const env = parsed.data;
