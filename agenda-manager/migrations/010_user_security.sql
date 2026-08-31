create table if not exists public.agenda_user_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  must_change_password boolean not null default false,
  password_changed_at timestamptz,
  failed_admin_resets integer not null default 0 check (failed_admin_resets >= 0),
  updated_at timestamptz not null default now()
);

alter table public.agenda_user_security enable row level security;

drop policy if exists agenda_user_security_own_read on public.agenda_user_security;
create policy agenda_user_security_own_read
on public.agenda_user_security
for select
to authenticated
using (user_id = auth.uid());

create index if not exists idx_agenda_user_security_must_change
  on public.agenda_user_security(must_change_password)
  where must_change_password = true;
