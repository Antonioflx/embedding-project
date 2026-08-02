import type { IHealthResponse } from "@interface/health.interface.js";
import type { Request, Response } from "express";
import { BaseRoutes } from "./base.routes.js";

export class HealthRouter extends BaseRoutes {
  constructor() {
    super();
    this.registerRoutes();
  }

  protected registerRoutes(): void {
    this._router.get("/health", this.handleHealth);
  }

  private handleHealth = (
    _req: Request,
    res: Response<IHealthResponse>,
  ): void => {
    res.json({ status: "ok" });
  };
}

export default new HealthRouter().router;
