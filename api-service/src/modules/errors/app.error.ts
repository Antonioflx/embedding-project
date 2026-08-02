export class AppError extends Error {
  readonly status: number;
  readonly isOperational: boolean;

  constructor(message: string, status: number, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
