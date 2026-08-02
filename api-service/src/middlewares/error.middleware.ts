import { AppError } from "@modules/errors/http.error.js";
import { logger } from "@modules/logger/logger.js";
import type { NextFunction, Request, Response } from "express";
import { env } from "@/config/env.js";
import { ErrorUtils } from "@/utils/error.utils.js";
import { NumberUtils } from "@/utils/number.utils.js";

const GENERIC_MESSAGE = "Internal server error.";

function hasHttpStatus(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    NumberUtils.isPositive((err as { status: unknown }).status)
  );
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const status = isAppError
    ? err.status
    : hasHttpStatus(err)
      ? err.status
      : 500;
  const message = ErrorUtils.getMessage(err);

  logger.error(message, {
    status,
    path: req.path,
    method: req.method,
    stack: err instanceof Error ? err.stack : undefined,
  });

  const isSafeToExpose =
    (isAppError && err.isOperational) || (hasHttpStatus(err) && status < 500);
  const publicMessage = isSafeToExpose
    ? message
    : env.isProduction
      ? GENERIC_MESSAGE
      : message;

  res.status(status).json({ error: publicMessage });
}
