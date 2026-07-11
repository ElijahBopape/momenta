-- Milestone 3: invitation_responses. One row per invitation (accept or
-- decline), written only by service-role server actions — never a direct
-- anon or authenticated client write. Owners can read responses to their
-- own invitations via the FK join.

create table public.invitation_responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.invitations (id) on delete cascade,
  recipient_name text not null,
  activity text,
  response_date date,
  response_time time,
  decline_count int not null default 0,
  responded_at timestamptz not null default now()
);

alter table public.invitation_responses enable row level security;

create policy "responses are selectable by the invitation owner"
  on public.invitation_responses for select
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_responses.invitation_id
        and i.owner_id = auth.uid()
    )
  );

-- No insert/update/delete policy for anon or authenticated: the public
-- accept/decline actions use the service-role client and enforce the
-- status='pending' guard + this table's unique invitation_id in code.
