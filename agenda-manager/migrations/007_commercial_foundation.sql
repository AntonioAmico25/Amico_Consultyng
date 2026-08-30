-- Agenda Manager R07 — fundação comercial
-- Migration já aplicada no Supabase oficial.

create table if not exists public.agenda_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  audience text not null default 'general',
  description text,
  price_cents integer,
  currency text not null default 'BRL',
  billing_interval text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_plan_features (
  plan_id uuid not null references public.agenda_plans(id) on delete cascade,
  feature_code text not null,
  enabled boolean not null default true,
  quota jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(plan_id, feature_code)
);

create table if not exists public.agenda_tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.agenda_plans(id),
  status text not null default 'active' check (status in ('trial','active','past_due','paused','canceled')),
  source text not null default 'internal',
  starts_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  renews_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_usage_counters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  metric text not null,
  period_start date not null,
  period_end date not null,
  used bigint not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  unique(tenant_id, metric, period_start, period_end)
);

create table if not exists public.agenda_integration_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider text not null,
  account_label text not null default 'Principal',
  status text not null default 'disconnected',
  config jsonb not null default '{}'::jsonb,
  secret_ref text,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, provider, account_label)
);

-- Observação de segurança: tokens OAuth não devem ser gravados em secret_ref.
-- A coluna existe apenas para futura referência a cofre/secret manager.

alter table public.agenda_plans enable row level security;
alter table public.agenda_plan_features enable row level security;
alter table public.agenda_tenant_subscriptions enable row level security;
alter table public.agenda_usage_counters enable row level security;
alter table public.agenda_integration_connections enable row level security;
