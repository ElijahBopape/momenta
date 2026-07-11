-- Milestone 7: DB-backed rate limiting. Deliberately not a new external
-- service (e.g. Upstash) — a small Postgres table is enough at this scale
-- and keeps the 0-capital rule simple (no new account to provision). Same
-- lockdown pattern as venue_cache: shared infrastructure, not user data,
-- RLS enabled with zero policies, touched only by the service-role client.

create table public.rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_created_idx on public.rate_limit_hits (bucket_key, created_at);

alter table public.rate_limit_hits enable row level security;
