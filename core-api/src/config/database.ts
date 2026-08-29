import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDatabase(): Promise<void> {
  try {
    // Timeout quickly if IP is blocked (10s instead of 30s)
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    logger.info("Connected to MongoDB");
    (global as any).MOCK_DB_MODE = false;
  } catch (error) {
    logger.warn({ err: error }, "Failed to connect to MongoDB. Falling back to Mock DB Mode.");
    (global as any).MOCK_DB_MODE = true;
  }

  mongoose.connection.on("error", (error) => {
    logger.error({ err: error }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
