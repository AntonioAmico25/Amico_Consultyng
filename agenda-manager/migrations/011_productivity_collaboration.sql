create or replace function public.agenda_member_of(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_memberships um where um.tenant_id=p_tenant and um.user_id=auth.uid() and lower(um.status) in ('active','ativo'));
$$;
revoke all on function public.agenda_member_of(uuid) from public;
grant execute on function public.agenda_member_of(uuid) to authenticated, service_role;

create table if not exists public.agenda_projects (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 workspace_id uuid references public.agm_workspaces(id) on delete set null, name text not null, description text,
 status text not null default 'planned' check(status in ('planned','active','paused','completed','cancelled')),
 priority text not null default 'medium' check(priority in ('low','medium','high','critical')),
 owner_id uuid references auth.users(id) on delete set null, starts_at timestamptz, due_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.agenda_meetings (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 workspace_id uuid references public.agm_workspaces(id) on delete set null, project_id uuid references public.agenda_projects(id) on delete set null,
 title text not null, objective text, starts_at timestamptz not null, ends_at timestamptz, location text,
 facilitator_id uuid references auth.users(id) on delete set null,
 status text not null default 'planned' check(status in ('planned','in_progress','closed','cancelled')), summary text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.agenda_meeting_items (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 meeting_id uuid not null references public.agenda_meetings(id) on delete cascade, title text not null,
 item_order integer not null default 0, status text not null default 'open' check(status in ('open','discussed','deferred','closed')),
 notes text, created_at timestamptz not null default now());

create table if not exists public.agenda_decisions (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 meeting_id uuid references public.agenda_meetings(id) on delete set null, project_id uuid references public.agenda_projects(id) on delete set null,
 decision text not null, owner_id uuid references auth.users(id) on delete set null, due_at timestamptz,
 status text not null default 'open' check(status in ('open','implemented','cancelled')), evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.agenda_studies (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 workspace_id uuid references public.agm_workspaces(id) on delete set null, title text not null, institution text, course text, subject text,
 exam_at timestamptz, target_minutes integer not null default 0 check(target_minutes>=0), completed_minutes integer not null default 0 check(completed_minutes>=0),
 status text not null default 'active' check(status in ('active','completed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.agenda_live_components (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 workspace_id uuid references public.agm_workspaces(id) on delete set null,
 component_type text not null check(component_type in ('note','checklist','table','decision','action_plan','risk','question','agenda')),
 title text not null, content jsonb not null default '{}'::jsonb,
 status text not null default 'active' check(status in ('active','archived')), owner_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.agenda_live_component_links (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 component_id uuid not null references public.agenda_live_components(id) on delete cascade,
 entity_type text not null check(entity_type in ('task','event','project','meeting','study','workspace')), entity_id uuid not null,
 created_at timestamptz not null default now(), unique(component_id,entity_type,entity_id));

alter table public.agm_tasks add column if not exists is_important boolean not null default false;
alter table public.agm_tasks add column if not exists planned_start_at timestamptz;
alter table public.agm_tasks add column if not exists planned_end_at timestamptz;
alter table public.agm_tasks add column if not exists project_id uuid references public.agenda_projects(id) on delete set null;
alter table public.agm_tasks add column if not exists study_id uuid references public.agenda_studies(id) on delete set null;

create index if not exists idx_agenda_projects_tenant on public.agenda_projects(tenant_id,status,due_at);
create index if not exists idx_agenda_meetings_tenant on public.agenda_meetings(tenant_id,starts_at);
create index if not exists idx_agenda_decisions_tenant on public.agenda_decisions(tenant_id,status,due_at);
create index if not exists idx_agenda_studies_tenant on public.agenda_studies(tenant_id,status,exam_at);
create index if not exists idx_agenda_live_components_tenant on public.agenda_live_components(tenant_id,status);
create index if not exists idx_agm_tasks_planned on public.agm_tasks(tenant_id,planned_start_at);

alter table public.agenda_projects enable row level security;
alter table public.agenda_meetings enable row level security;
alter table public.agenda_meeting_items enable row level security;
alter table public.agenda_decisions enable row level security;
alter table public.agenda_studies enable row level security;
alter table public.agenda_live_components enable row level security;
alter table public.agenda_live_component_links enable row level security;

do $$ declare t text; begin
 foreach t in array array['agenda_projects','agenda_meetings','agenda_meeting_items','agenda_decisions','agenda_studies','agenda_live_components','agenda_live_component_links'] loop
  execute format('drop policy if exists %I_member_all on public.%I',t,t);
  execute format('create policy %I_member_all on public.%I for all to authenticated using (public.agenda_member_of(tenant_id)) with check (public.agenda_member_of(tenant_id))',t,t);
 end loop;
end $$;

grant select,insert,update,delete on public.agenda_projects,public.agenda_meetings,public.agenda_meeting_items,public.agenda_decisions,public.agenda_studies,public.agenda_live_components,public.agenda_live_component_links to authenticated;