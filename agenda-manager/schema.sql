-- Agenda Manager v0.1 — Fundação SaaS (PostgreSQL)
create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'personal',
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  email text not null,
  display_name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(tenant_id,email)
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  owner_id uuid references users(id),
  name text not null,
  kind text not null default 'personal',
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  workspace_id uuid references workspaces(id),
  owner_id uuid references users(id),
  assignee_id uuid references users(id),
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'created',
  due_at timestamptz,
  estimated_minutes integer,
  source_type text,
  source_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_steps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position integer not null default 0
);

create table if not exists calendars (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  workspace_id uuid references workspaces(id),
  owner_id uuid references users(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  calendar_id uuid references calendars(id),
  workspace_id uuid references workspaces(id),
  owner_id uuid references users(id),
  task_id uuid references tasks(id),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  location text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  user_id uuid references users(id),
  severity text not null default 'info',
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  actor_id uuid references users(id),
  action text not null,
  object_type text not null,
  object_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_tenant_due on tasks(tenant_id,due_at);
create index if not exists idx_events_tenant_start on events(tenant_id,starts_at);
create index if not exists idx_audit_tenant_created on audit_log(tenant_id,created_at desc);

-- Regra de implementação: todas as consultas e políticas RLS devem filtrar tenant_id.
