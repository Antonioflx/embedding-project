import { ErrorUtils } from "@/utils/error.utils.js";

export class EmbeddingServiceError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static forRequest(cause: unknown): EmbeddingServiceError {
    const message = ErrorUtils.getMessage(cause);
    return new EmbeddingServiceError(
      `embedding-service request failed: ${message}`,
    );
  }
}
