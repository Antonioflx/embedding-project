import { ConfigError } from "@modules/errors/config.error.js";
import { NumberUtils } from "@/utils/number.utils.js";
import { StringUtils } from "@/utils/string.utils.js";

class EnvStringDto {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static from(name: string, raw: string | undefined): EnvStringDto {
    if (!StringUtils.isNotEmpty(raw)) {
      throw ConfigError.missingVariable(name);
    }

    return new EnvStringDto(raw);
  }
}

class EnvNumberDto {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static from(name: string, raw: string): EnvNumberDto {
    const value = Number(raw);
    if (!NumberUtils.isPositive(value)) {
      throw ConfigError.invalidVariable(
        name,
        `must be a positive number, received: "${raw}"`,
      );
    }

    return new EnvNumberDto(value);
  }
}

export class EnvDto {
  private constructor() {}

  static string(name: string, raw: string | undefined): EnvStringDto {
    return EnvStringDto.from(name, raw);
  }

  static number(name: string, raw: string): EnvNumberDto {
    return EnvNumberDto.from(name, raw);
  }
}
