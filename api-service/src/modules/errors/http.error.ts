import { AppError } from "./app.error.js";

export { AppError };

export class HttpError extends AppError {
  private constructor(message: string, status: number) {
    super(message, status);
  }

  static NotFoundError(message: string = "Resource not found."): HttpError {
    return new HttpError(message, 404);
  }

  static UnauthorizedError(message: string = "Unauthorized."): HttpError {
    return new HttpError(message, 401);
  }

  static BadRequestError(message: string = "Invalid request."): HttpError {
    return new HttpError(message, 400);
  }

  static TooManyRequestsError(
    message: string = "Too many requests. Please try again later.",
  ): HttpError {
    return new HttpError(message, 429);
  }
}
