# embedding-service

Owns the full RAG pipeline: embedding, vector search, prompt augmentation, and generation. Python / FastAPI, called internally by [`api-service`](../api-service/) — not meant to be exposed to the public internet directly.

## Stack

- **Runtime**: Python 3.13, FastAPI + uvicorn
- **LLM**: `google-genai` (Gemini) — both embeddings and generation
- **Vector store**: MongoDB Atlas (`$vectorSearch`), via `pymongo`
- **Config**: `pydantic-settings` (all required fields validated at startup — the app fails fast if something's missing)
- **Resilience**: `tenacity` retry with exponential backoff on transient Gemini errors (5xx and 429 `RESOURCE_EXHAUSTED`) — verified with `scripts/test_gemini_retry.py`, not just assumed

## Pipeline (`POST /answer`)

1. **Embed** the question (Gemini embeddings).
2. **Retrieve** — `$vectorSearch` against the `faq_chunks` collection in MongoDB Atlas.
3. **Augment** — build a prompt from the retrieved chunks (falls back to the raw question if nothing relevant is found).
4. **Generate** — call Gemini. If `config.language` is `"BR"` or `"US"`, a system instruction forces the answer into that language regardless of the question's language.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | none | Liveness check |
| `POST` | `/answer` | `X-API-KEY` header | Body: `{ question: string, config?: {...} }` → `{ answer: string }` |

## Running locally

```bash
python -m venv .venv
./.venv/Scripts/activate      # Windows; source .venv/bin/activate on Linux/macOS
pip install -r requirements.txt
cp .env.example .env           # fill in real values
uvicorn src.main:app --reload --port 8000
```

## Environment variables

See [`.env.example`](.env.example). All are required except `PORT` (defaults to `8000`) and the `MONGODB_*` names (sensible defaults).

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | default `8000` |
| `GEMINI_API_KEY` | **yes** | |
| `EMBEDDING_SERVICE_API_KEY` | **yes** | must match what `api-service` sends as `X-API-KEY` |
| `MONGODB_URI` | **yes** | Atlas connection string |
| `MONGODB_DB_NAME` | no | default `rag_study` |
| `MONGODB_COLLECTION_NAME` | no | default `faq_chunks` |
| `MONGODB_VECTOR_INDEX_NAME` | no | default `vector_index` |

## Loading the FAQ into the vector store

Edit `data/faq.md` (one chunk per `## ` section), then:

```bash
python scripts/ingest_faq.py
```

Re-run this any time `data/faq.md` changes — it embeds and inserts every section into MongoDB.

## Testing the Gemini retry logic

`scripts/test_gemini_retry.py` mocks the Gemini client to verify retry behavior without depending on real API flakiness (or burning quota):

```bash
python scripts/test_gemini_retry.py
```

Covers: recovery after transient 503s, recovery after transient 429 (quota) errors, and fast-fail (no wasted retries) on real client errors like an invalid API key.

## Structure

```
src/
├── config.py                     # Settings (pydantic-settings, fails fast if misconfigured)
├── main.py                        # FastAPI app + exception handlers
├── models/answer.py                 # AnswerRequest/AnswerResponse/GenerateConfig (pydantic)
├── routes/answer.py                  # POST /answer
└── modules/
    ├── auth/api_key.py                # X-API-KEY dependency
    ├── embedding/client.py              # Gemini embeddings
    ├── generation/client.py              # Gemini generation, retry, language instruction
    ├── retrieval/vector_store.py          # $vectorSearch (never returns Mongo's _id)
    ├── mongo/connection.py                 # Mongo client/collection
    ├── errors/                              # AppError / HTTPError + FastAPI exception handlers
    └── logger/logger.py                      # structured logging
```

## Docker

```bash
docker build -f docker/Dockerfile -t embedding-service .
```

In practice this is built via the root [`docker-compose.yml`](../docker-compose.yml).
