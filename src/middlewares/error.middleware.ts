import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";

export const notFoundHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};
