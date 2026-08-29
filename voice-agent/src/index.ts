import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { handleVapiTools } from "./controllers/vapiToolController";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(","), credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "voice-agent",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/v1/voice/tools", handleVapiTools);

export default app;
