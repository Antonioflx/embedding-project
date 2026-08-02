import { Router } from "express";

export abstract class BaseRoutes {
  protected readonly _router: Router;

  constructor() {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  protected abstract registerRoutes(): void;
}
