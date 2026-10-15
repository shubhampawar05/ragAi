# RAG Lab

Document Q&A with citations (Phase 1): upload → chunk → embed → query via Supabase pgvector.

## Prerequisites

- Node 20+
- Supabase project with migration applied
- OpenAI API key

## 1. Supabase

Run SQL from [`backend/supabase/migrations/20260325100000_init_rag.sql`](backend/supabase/migrations/20260325100000_init_rag.sql) in the Supabase SQL editor (or `cd backend && supabase db push`).

Optional: create a **Storage** bucket named `documents` (public or private; uploads are best-effort if missing).

## 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Where to get it |
|----------|-----------------|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `DATABASE_URL` | Supabase → **Project Settings → Database** → Connection string (URI). Use **Transaction pooler** (port 6543) for the API server. |

**Database access (production style):** the API uses the **`pg`** driver with a connection pool and SQL repositories—not the Supabase JS client. Supabase is only the hosted Postgres (+ you run migrations in SQL).

Then:

```bash
npm install
npm run dev
```

API: `http://localhost:4000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/documents` | GET | List documents |
| `/api/ingest/upload` | POST | `multipart/form-data` field `file` |
| `/api/rag/query` | POST | JSON `{ question, documentId?, topK? }` |

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project docs

See [`Notes/RAG-Lab-Project-Plan.md`](Notes/RAG-Lab-Project-Plan.md) and [`AGENTS.md`](AGENTS.md).
