import type { ILogMeta, TLogLevel } from "@interface/log.interface.js";

export class Logger {
  debug(message: string, meta?: ILogMeta): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: ILogMeta): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: ILogMeta): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: ILogMeta): void {
    this.write("error", message, meta);
  }

  private write(level: TLogLevel, message: string, meta?: ILogMeta): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta ? { meta } : {}),
    };

    const serialized = JSON.stringify(entry);

    if (level === "error") {
      console.error(serialized);
      return;
    }

    if (level === "warn") {
      console.warn(serialized);
      return;
    }

    console.log(serialized);
  }
}

export const logger = new Logger();
