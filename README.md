# embedding-project — RAG Study Project

A practical study of RAG (Retrieval-Augmented Generation) architecture, built as two independent services that talk to each other over HTTP. The goal is to feed a text source (an FAQ) and answer natural-language questions grounded in that content — with a proper async job pipeline (queue + SSE) instead of a naive blocking request/response.

## Architecture

```
Client → api-service (Node) → Redis (BullMQ job queue) → api-worker (Node)
                                                                │
                                                                ▼
                                                     embedding-service (Python)
                                                     embed → Mongo Atlas vector
                                                     search → prompt augmentation
                                                     → Gemini → answer
                                                                │
Client ← SSE (PROCESSING → SEND/REJECT) ←──────────────────────┘
```

| Service | Language | Responsibility |
|---|---|---|
| [`api-service`](api-service/) | Node.js / TypeScript | Public HTTP + SSE layer. Creates jobs, relays questions to `embedding-service`, streams status back to the client. |
| [`embedding-service`](embedding-service/) | Python / FastAPI | Owns the full RAG pipeline: embeds the question, runs vector search against MongoDB Atlas, builds the prompt, calls Gemini. |

Node never talks to Gemini or Mongo directly — it only knows about jobs and HTTP. All embeddings/retrieval/generation logic lives in the Python service.

## Quick start (Docker Compose)

Requires Docker, and a `.env` in each service (copy from `.env.example`, fill in real values — see each service's README for what's needed: Gemini API key, MongoDB Atlas URI, etc.).

```bash
docker compose build
docker compose up -d
```

This starts 4 containers: `redis`, `embedding-service`, `api-service`, `api-worker`.

```bash
curl http://localhost:3000/health
curl http://localhost:8000/health
```

## Try it

```bash
# 1. create a job
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How does subscription cancellation work?", "config": {"language": "BR"}}'
# -> {"jobId":"<uuid>"}

# 2. stream the result
curl -N http://localhost:3000/ask/<uuid>/stream
```

`config.language` is optional (`"BR"` or `"US"`) — forces the answer's language regardless of the question's language.

## Repo layout

```
embedding-project/
├── docker-compose.yml
├── api-service/          # Node/TypeScript — see api-service/README.md
├── embedding-service/    # Python/FastAPI — see embedding-service/README.md
└── .github/workflows/    # CI (one workflow per service, path-filtered)
```

## CI

Each service has its own GitHub Actions workflow (`api-service-ci.yml`, `embedding-service-ci.yml`), triggered only when that service's files change: type-check/lint/test/build for Node, dependency install + compile check + import check + a mocked retry-behavior test for Python.
