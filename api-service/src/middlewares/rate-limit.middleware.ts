import { HttpError } from "@modules/errors/http.error.js";
import rateLimit from "express-rate-limit";

export const askRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(HttpError.TooManyRequestsError());
  },
});
