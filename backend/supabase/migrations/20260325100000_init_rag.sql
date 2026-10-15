-- RAG Lab Phase 1: documents, chunks, pgvector search
create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  content_hash text not null unique,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  storage_path text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists chunks_document_id_idx on public.chunks (document_id);
create index if not exists chunks_embedding_idx on public.chunks
  using hnsw (embedding vector_cosine_ops);

create or replace function public.match_chunks (
  query_embedding vector(1536),
  match_count int default 5,
  filter_document_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where c.embedding is not null
    and (filter_document_id is null or c.document_id = filter_document_id)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
