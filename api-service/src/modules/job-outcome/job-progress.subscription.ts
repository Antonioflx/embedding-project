import type { QueueEvents } from "bullmq";

export class JobProgressSubscription<TProgress> {
  private readonly listener: (args: { jobId: string; data: unknown }) => void;
  private disposed = false;

  constructor(
    private readonly queueEvents: QueueEvents,
    private readonly jobId: string,
    onProgress: (progress: TProgress) => void,
  ) {
    this.listener = (args) => {
      if (this.disposed) return;
      if (args.jobId !== this.jobId) return;
      onProgress(args.data as TProgress);
    };
    this.queueEvents.on("progress", this.listener);
  }

  dispose(): void {
    this.disposed = true;
    this.queueEvents.off("progress", this.listener);
  }
}
