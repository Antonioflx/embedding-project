import { describe, expect, it } from "vitest";

abstract class Base {
  readonly captured: unknown;

  constructor() {
    // Simulates BaseRoutes calling this.registerRoutes() from its own constructor.
    this.captured = this.setup();
  }

  protected abstract setup(): unknown;
}

class DerivedWithField extends Base {
  // Class field initializer: runs AFTER super() returns.
  private readonly handler = () => "real handler";

  protected setup(): unknown {
    return this.handler;
  }
}

class DerivedWithMethod extends Base {
  protected setup(): unknown {
    return this.handler;
  }

  // Prototype method: exists on the class before any instance is constructed.
  private handler(): string {
    return "real handler";
  }
}

describe("calling an overridable method from a base class constructor", () => {
  it("sees an undefined class-field handler (timing hazard)", () => {
    const instance = new DerivedWithField();
    expect(instance.captured).toBeUndefined();
  });

  it("sees a real prototype-method handler (no hazard)", () => {
    const instance = new DerivedWithMethod();
    expect(typeof instance.captured).toBe("function");
  });
});
