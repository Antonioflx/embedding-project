import "dotenv/config";
import { EnvDto } from "@dto/env.dto.js";

class EnvConfig {
  readonly PORT: number;
  readonly NODE_ENV: string;
  readonly REDIS_URL: string;
  readonly EMBEDDING_SERVICE_URL: string;
  readonly EMBEDDING_SERVICE_API_KEY: string;

  constructor() {
    this.PORT = this.requiredNumber("PORT", "3000");
    this.NODE_ENV = this.optional("NODE_ENV", "development");
    this.REDIS_URL = this.optional("REDIS_URL", "redis://localhost:6379");
    this.EMBEDDING_SERVICE_URL = this.required("EMBEDDING_SERVICE_URL");
    this.EMBEDDING_SERVICE_API_KEY = this.required("EMBEDDING_SERVICE_API_KEY");
  }

  get isProduction(): boolean {
    return this.NODE_ENV === "production";
  }

  private optional(name: string, fallback: string): string {
    return process.env[name] ?? fallback;
  }

  private required(name: string): string {
    return EnvDto.string(name, process.env[name]).value;
  }

  private requiredNumber(name: string, fallback: string): number {
    const raw = this.optional(name, fallback);
    return EnvDto.number(name, raw).value;
  }
}

export const env = new EnvConfig();
