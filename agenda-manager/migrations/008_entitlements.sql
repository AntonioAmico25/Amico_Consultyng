-- Agenda Manager R08 — entitlements e solicitações de mudança de plano
-- Migration aplicada no Supabase oficial em 2026-08-30.

create table if not exists public.agenda_plan_change_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  requested_plan_id uuid not null references public.agenda_plans(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected','canceled')),
  note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id)
);

alter table public.agenda_plan_change_requests enable row level security;

create or replace function public.agenda_feature_enabled(p_tenant uuid, p_feature text)
returns boolean language sql stable security invoker set search_path=public as $$
  select case when p_tenant not in (select public.sgq_current_tenant_ids()) then false else coalesce((
    select f.enabled from public.agenda_tenant_subscriptions s
    join public.agenda_plan_features f on f.plan_id=s.plan_id
    where s.tenant_id=p_tenant and s.status in ('trial','active') and f.feature_code=p_feature limit 1
  ),false) end;
$$;

create or replace function public.agenda_limit_int(p_tenant uuid, p_key text)
returns bigint language sql stable security invoker set search_path=public as $$
  select case when p_tenant not in (select public.sgq_current_tenant_ids()) then 0 else (
    select case when p.limits ? p_key and p.limits->>p_key is not null then (p.limits->>p_key)::bigint else null end
    from public.agenda_tenant_subscriptions s join public.agenda_plans p on p.id=s.plan_id
    where s.tenant_id=p_tenant and s.status in ('trial','active') limit 1
  ) end;
$$;

-- O banco também contém trigger para limite de workspaces, RLS de solicitações e
-- políticas de integração condicionadas a integrations.microsoft, integrations.google,
-- education e admin.advanced. O cliente público apenas registra solicitações pending;
-- aprovação, cobrança e mudança efetiva de plano ficam fora do navegador.
