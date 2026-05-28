import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";

export const notFoundHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  if (statusCode === 500) {
    logger.error("Unhandled request error", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};
