-- Milestone 5: venue_cache. Not user-owned data — a shared cache of public
-- OpenStreetMap geocoding/search results, read and written only by our
-- server code via the service-role client. RLS is enabled with zero
-- policies, so even a valid anon/authenticated key can't touch it directly.

create table public.venue_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index venue_cache_expires_at_idx on public.venue_cache (expires_at);

alter table public.venue_cache enable row level security;
