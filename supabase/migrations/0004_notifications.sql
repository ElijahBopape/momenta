-- Milestone 4: notifications. Inserted only by the service-role client from
-- the public accept/decline actions (a logged-out recipient triggers the
-- write, but it's the owner's notification) — no insert policy for anon or
-- authenticated. Owners can read/update (mark read) their own.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  type text not null check (type in ('accepted', 'declined')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications are selectable by their owner"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications are updatable by their owner"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Live in-app notifications via Supabase Realtime (postgres_changes).
alter publication supabase_realtime add table public.notifications;
