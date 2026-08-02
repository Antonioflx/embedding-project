import { logger } from "@modules/logger/logger.js";
import express from "express";
import helmet from "helmet";
import { env } from "@/config/env.js";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
import askRouter from "@/routes/ask.routes.js";
import healthRouter from "@/routes/health.routes.js";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use(healthRouter);
app.use(askRouter);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  logger.info(`api-service running at http://localhost:${env.PORT}`);
});
