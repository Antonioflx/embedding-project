type TJobOutcomeKind = "ok" | "failed" | "aborted";

export class JobOutcome<TResult> {
  private constructor(
    private readonly kind: TJobOutcomeKind,
    private readonly result?: TResult,
    private readonly message?: string,
  ) {}

  static ok<TResult>(result: TResult): JobOutcome<TResult> {
    return new JobOutcome<TResult>("ok", result);
  }

  static failed<TResult>(message: string): JobOutcome<TResult> {
    return new JobOutcome<TResult>("failed", undefined, message);
  }

  static aborted<TResult>(): JobOutcome<TResult> {
    return new JobOutcome<TResult>("aborted");
  }

  isOk(): boolean {
    return this.kind === "ok";
  }

  isFailed(): boolean {
    return this.kind === "failed";
  }

  isAborted(): boolean {
    return this.kind === "aborted";
  }

  getResult(): TResult {
    return this.ensureDefined(this.result, "JobOutcome has no result to read.");
  }

  getMessage(): string {
    return this.ensureDefined(
      this.message,
      "JobOutcome has no message to read.",
    );
  }

  private ensureDefined<TValue>(
    value: TValue | undefined,
    message: string,
  ): TValue {
    if (value === undefined) {
      throw new Error(message);
    }
    return value;
  }
}
