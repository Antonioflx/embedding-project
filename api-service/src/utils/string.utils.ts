import { BaseTypeUtils } from "./base-type.utils.js";

export class StringUtils extends BaseTypeUtils {
  private constructor() {
    super();
  }

  static isString(value: unknown): value is string {
    return StringUtils.isOfType(value, "string");
  }

  static isEmpty(value: unknown): boolean {
    return !StringUtils.isString(value) || value.trim().length === 0;
  }

  static isNotEmpty(value: unknown): value is string {
    return !StringUtils.isEmpty(value);
  }

  static isWithinLength(value: unknown, maxLength: number): boolean {
    return StringUtils.isString(value) && value.length <= maxLength;
  }
}
