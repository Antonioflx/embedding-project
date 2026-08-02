import { AskRequestDto } from "@dto/ask.dto.js";
import type { IAskJobResponse } from "@interface/job.interface.js";
import { AskJobStreamUseCase } from "@use-case/ask-job-stream.use-case.js";
import { CreateAskJobUseCase } from "@use-case/create-ask-job.use-case.js";
import type { Request, Response } from "express";
import { askRateLimit } from "@/middlewares/rate-limit.middleware.js";
import { BaseRoutes } from "./base.routes.js";

export class AskRouter extends BaseRoutes {
  private readonly createAskJobUseCase = new CreateAskJobUseCase();
  private readonly askJobStreamUseCase = new AskJobStreamUseCase();

  constructor() {
    super();
    this.registerRoutes();
  }

  protected registerRoutes(): void {
    this._router.post("/ask", askRateLimit, this.handleAsk);
    this._router.get("/ask/:jobId/stream", this.handleAskStream);
  }

  private handleAsk = async (
    req: Request<
      unknown,
      unknown,
      Partial<Pick<AskRequestDto, "question" | "config">>
    >,
    res: Response<IAskJobResponse>,
  ): Promise<void> => {
    const { question, config } = AskRequestDto.from(req.body ?? {});
    const jobResponse = await this.createAskJobUseCase.execute(
      question,
      config,
    );
    res.status(202).json(jobResponse);
  };

  private handleAskStream = async (
    req: Request<{ jobId: string }>,
    res: Response,
  ): Promise<void> => {
    const { jobId } = req.params;
    const controller = new AbortController();
    req.on("close", () => controller.abort());

    await this.askJobStreamUseCase.execute(
      jobId,
      (event) => {
        if (!res.headersSent) {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          res.flushHeaders();
        }
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
      controller.signal,
    );

    res.end();
  };
}

export default new AskRouter().router;
