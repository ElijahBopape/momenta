-- Milestone 7 RLS audit: scripts/migrate.mjs's own bookkeeping table had no
-- RLS, meaning any anon/authenticated API key could read it via PostgREST
-- (Supabase grants broad table privileges to those roles by default and
-- relies on RLS to restrict actual row access). Not sensitive data —
-- migration filenames — but there's no reason to expose it. The migration
-- runner connects via the raw Postgres connection string, not the Supabase
-- client, so this has zero effect on the tool itself.

alter table public._migrations enable row level security;
