-- Milestone 2: invitations table. Owner-only access — the public read path
-- for recipients (via share_token) is a dedicated server-side lookup added
-- in Milestone 3, never a direct anon select against this table.

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  share_token text not null unique,
  status text not null default 'draft' check (status in ('draft', 'pending', 'accepted', 'declined')),
  recipient_name text,
  title text not null default '',
  message text not null default '',
  design jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  expires_at timestamptz
);

create index invitations_owner_id_idx on public.invitations (owner_id, created_at desc);

alter table public.invitations enable row level security;

create policy "invitations are selectable by their owner"
  on public.invitations for select
  using (auth.uid() = owner_id);

create policy "invitations are insertable by their owner"
  on public.invitations for insert
  with check (auth.uid() = owner_id);

create policy "invitations are updatable by their owner"
  on public.invitations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
