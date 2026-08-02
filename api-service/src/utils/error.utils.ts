export class ErrorUtils {
  private constructor() {}

  static getMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown error.";
  }
}
