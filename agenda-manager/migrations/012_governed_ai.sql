create table if not exists public.agenda_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_type text not null check (suggestion_type in ('weekly_plan','deadline_risk','reorganize','meeting_summary','meeting_actions','changes_since_last_access')),
  title text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  risk_level text not null default 'info' check (risk_level in ('info','low','medium','high','critical')),
  status text not null default 'pending' check (status in ('pending','accepted','edited','ignored','expired')),
  source_scope text,
  source_ids jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_user_activity_state (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_digest_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (tenant_id,user_id)
);

create table if not exists public.agenda_ai_action_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_id uuid references public.agenda_ai_suggestions(id) on delete set null,
  action_type text not null,
  target_type text,
  target_id uuid,
  before_state jsonb,
  after_state jsonb,
  result text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_agenda_ai_suggestions_tenant_user on public.agenda_ai_suggestions(tenant_id,user_id,status,generated_at desc);
create index if not exists idx_agenda_ai_action_log_tenant_user on public.agenda_ai_action_log(tenant_id,user_id,created_at desc);

alter table public.agenda_ai_suggestions enable row level security;
alter table public.agenda_user_activity_state enable row level security;
alter table public.agenda_ai_action_log enable row level security;

drop policy if exists agenda_ai_suggestions_user_all on public.agenda_ai_suggestions;
create policy agenda_ai_suggestions_user_all on public.agenda_ai_suggestions for all to authenticated using (public.agenda_member_of(tenant_id) and user_id=auth.uid()) with check (public.agenda_member_of(tenant_id) and user_id=auth.uid());
drop policy if exists agenda_user_activity_state_user_all on public.agenda_user_activity_state;
create policy agenda_user_activity_state_user_all on public.agenda_user_activity_state for all to authenticated using (public.agenda_member_of(tenant_id) and user_id=auth.uid()) with check (public.agenda_member_of(tenant_id) and user_id=auth.uid());
drop policy if exists agenda_ai_action_log_user_read on public.agenda_ai_action_log;
create policy agenda_ai_action_log_user_read on public.agenda_ai_action_log for select to authenticated using (public.agenda_member_of(tenant_id) and user_id=auth.uid());
drop policy if exists agenda_ai_action_log_user_insert on public.agenda_ai_action_log;
create policy agenda_ai_action_log_user_insert on public.agenda_ai_action_log for insert to authenticated with check (public.agenda_member_of(tenant_id) and user_id=auth.uid());

grant select,insert,update,delete on public.agenda_ai_suggestions to authenticated;
grant select,insert,update on public.agenda_user_activity_state to authenticated;
grant select,insert on public.agenda_ai_action_log to authenticated;