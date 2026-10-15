# Database migrations

SQL for Postgres (hosted on Supabase or any provider).

## Apply manually

Copy [`migrations/20260325100000_init_rag.sql`](migrations/20260325100000_init_rag.sql) into the Supabase **SQL editor** and run.

## Supabase CLI (optional)

From the **`backend`** directory:

```bash
cd backend
npm run db:link    # supabase link --project-ref YOUR_REF
npm run db:push    # applies migrations/ to linked project
```

Or paste the migration SQL into the Supabase dashboard **SQL editor** if you skip the CLI.

After linking, set `DATABASE_URL` in `backend/.env` (Database → Connection string → URI).
