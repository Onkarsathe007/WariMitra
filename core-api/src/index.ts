import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { initSocketIO } from "./config/socket";
import { logger } from "./utils/logger";
import { requestLogger, requestId } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();
const httpServer = createServer(app);

initSocketIO(httpServer);

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS.split(","),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(requestId);
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/v1", routes);

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabase();

  httpServer.listen(env.PORT, () => {
    logger.info(`Core API running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

start().catch((error) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
