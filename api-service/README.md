# api-service

Public HTTP + SSE layer of the RAG pipeline. Node.js / TypeScript, Express 5, BullMQ + Redis for async job processing.

It does **not** know about embeddings, vector search, or Gemini — it creates a job, hands the question off to [`embedding-service`](../embedding-service/) over HTTP, and streams the result back to the client via SSE.

## Stack

- **Runtime**: Node 22, TypeScript (strict), ESM (`NodeNext`)
- **HTTP**: Express 5
- **Jobs**: BullMQ + Redis (separate `server` and `worker` processes)
- **Security**: `helmet`, `express-rate-limit`, body size + input length limits, `AbortSignal` timeouts on every external call
- **Tooling**: Biome (format + lint, `noExplicitAny` as error), Vitest, `tsc-alias` for path-alias-aware builds

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `POST` | `/ask` | Body: `{ question: string, config?: { language?: "BR" \| "US", model?, temperature?, ... } }`. Creates a job, returns `202 { jobId }` immediately (does **not** wait for the answer). |
| `GET` | `/ask/:jobId/stream` | Server-Sent Events. Emits `{ jobId, status: "PROCESSING", step }` while working, then a terminal `{ status: "SEND", answer }` or `{ status: "REJECT", error }`. |

`jobId` is a UUID (`crypto.randomUUID()`), not BullMQ's default sequential id — a sequential id would let anyone enumerate `/ask/1/stream`, `/ask/2/stream`... and read other people's questions/answers.

## Running locally (without Docker)

Needs a running Redis (`docker run -p 6379:6379 redis:alpine` is enough) and `embedding-service` reachable at `EMBEDDING_SERVICE_URL`.

```bash
npm install
cp .env.example .env   # fill in the real values
npm run dev            # HTTP server (hot reload)
npm run dev:worker      # worker process, in a second terminal (also hot reload)
```

## Environment variables

See [`.env.example`](.env.example).

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | no | `3000` | |
| `NODE_ENV` | no | `development` | `production` hides internal error messages from clients |
| `REDIS_URL` | no | `redis://localhost:6379` | |
| `EMBEDDING_SERVICE_URL` | **yes** | — | e.g. `http://localhost:8000` |
| `EMBEDDING_SERVICE_API_KEY` | **yes** | — | sent as `X-API-KEY` to `embedding-service` |

## Scripts

```bash
npm run dev          # server, hot reload (tsx watch)
npm run dev:worker   # worker, hot reload
npm run build         # tsc + tsc-alias -> dist/
npm start              # node dist/server.js (after build)
npm run start:worker    # node dist/worker.js (after build)
npm test                 # vitest run
npm run check              # biome check --write .
```

## Structure

```
src/
├── config/        # EnvConfig — validated environment settings
├── modules/         # cross-cutting infra: errors, logger, redis, queue, embedding-service client, job-outcome
├── dto/               # boundary validation (private constructor + static from())
├── interfaces/          # pure shapes, no behavior
├── repository/            # I/O only (BullMQ, Redis), no validation
├── events/                  # QueueEvents bridge
├── use-cases/                # business-flow orchestration
├── routes/                    # HTTP layer (Express routers as classes)
├── middlewares/                 # error handler, rate limiter
├── utils/                        # stateless static helpers
└── spec/                          # Vitest specs
```

## Docker

```bash
docker build -f docker/Dockerfile -t api-service .
```

In practice this is built via the root [`docker-compose.yml`](../docker-compose.yml), which runs this same image twice — once as `api-service` (`node dist/server.js`) and once as `api-worker` (`node dist/worker.js`).
