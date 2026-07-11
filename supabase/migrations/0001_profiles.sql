-- Milestone 1: profiles table, 1:1 with auth.users, provisioned automatically on signup.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_mascot_id text not null default 'bear',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

-- No insert/delete policies for authenticated/anon: rows are created only by
-- the trigger below (as the postgres role) and deleted via the auth.users
-- cascade, never directly by a client.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
