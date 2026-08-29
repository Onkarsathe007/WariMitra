import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (_req) => uuidv4(),
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (_req, res) => {
    return `request completed`;
  },
  customErrorMessage: (_req, res, err) => {
    return `request error: ${err.message}`;
  },
});

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  const requestId = req.headers["x-request-id"] as string || uuidv4();
  req.headers["x-request-id"] = requestId;
  next();
}
