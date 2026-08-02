import { BaseTypeUtils } from "./base-type.utils.js";

export class DateUtils extends BaseTypeUtils {
  private constructor() {
    super();
  }

  static isDate(value: unknown): value is Date {
    return DateUtils.isInstanceOf(value, Date);
  }

  static isValidDate(value: unknown): value is Date {
    return DateUtils.isDate(value) && !Number.isNaN(value.getTime());
  }
}
