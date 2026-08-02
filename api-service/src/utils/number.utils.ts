import { BaseTypeUtils } from "./base-type.utils.js";

export class NumberUtils extends BaseTypeUtils {
  private constructor() {
    super();
  }

  static isNumber(value: unknown): value is number {
    return NumberUtils.isOfType(value, "number") && !Number.isNaN(value);
  }

  static isPositive(value: unknown): boolean {
    return NumberUtils.isNumber(value) && value > 0;
  }
}
