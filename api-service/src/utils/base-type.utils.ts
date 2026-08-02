type TTypeofResult =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export abstract class BaseTypeUtils {
  protected static isOfType(value: unknown, type: TTypeofResult): boolean {
    return typeof value === type;
  }

  protected static isInstanceOf<T>(
    value: unknown,
    ctor: new (...args: never[]) => T,
  ): value is T {
    return value instanceof ctor;
  }
}
