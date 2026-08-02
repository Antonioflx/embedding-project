export class ConfigError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static missingVariable(name: string): ConfigError {
    return new ConfigError(`Missing required environment variable: ${name}`);
  }

  static invalidVariable(name: string, reason: string): ConfigError {
    return new ConfigError(
      `Environment variable ${name} is invalid: ${reason}`,
    );
  }
}
