import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  CORE_API_URL: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(4000),
  WS_PORT: z.coerce.number().default(4001),
  PUBLIC_URL: z.string().default("wss://localhost:4001"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  INTERNAL_API_KEY: z.string().default("dev-internal-api-key"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
