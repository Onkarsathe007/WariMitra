import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  logger.error({ err, requestId: req.headers["x-request-id"] }, "Unhandled error");

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
