create table if not exists public.agenda_validation_checks (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 module_key text not null,
 module_label text not null,
 visual_status text not null default 'not_tested' check (visual_status in ('not_tested','approved','adjust')),
 text_status text not null default 'not_tested' check (text_status in ('not_tested','approved','adjust')),
 function_status text not null default 'not_tested' check (function_status in ('not_tested','approved','adjust')),
 notes text,
 updated_at timestamptz not null default now(),
 unique(tenant_id,user_id,module_key)
);
alter table public.agenda_validation_checks enable row level security;
drop policy if exists agenda_validation_checks_self on public.agenda_validation_checks;
create policy agenda_validation_checks_self on public.agenda_validation_checks for all to authenticated using (user_id=auth.uid() and public.agenda_member_of(tenant_id)) with check (user_id=auth.uid() and public.agenda_member_of(tenant_id));
grant select,insert,update,delete on public.agenda_validation_checks to authenticated;
create index if not exists idx_agenda_validation_checks_user on public.agenda_validation_checks(tenant_id,user_id,module_key);