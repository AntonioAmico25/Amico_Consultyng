create table if not exists public.agenda_user_admin_audit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('create_user','reset_password','block_user','unblock_user','deactivate_membership','activate_membership','change_role','force_password_change')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.agenda_user_admin_audit enable row level security;

create or replace function public.agenda_is_master(p_tenant_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_memberships um
    join public.roles r on r.id = um.role_id
    where um.tenant_id = p_tenant_id
      and um.user_id = p_user_id
      and um.status = 'active'
      and r.code = 'MASTER'
  );
$$;

revoke all on function public.agenda_is_master(uuid,uuid) from public;
grant execute on function public.agenda_is_master(uuid,uuid) to authenticated, service_role;

drop policy if exists agenda_user_admin_audit_master_read on public.agenda_user_admin_audit;
create policy agenda_user_admin_audit_master_read
on public.agenda_user_admin_audit
for select
to authenticated
using (public.agenda_is_master(tenant_id, auth.uid()));

create index if not exists idx_agenda_user_admin_audit_tenant_created
  on public.agenda_user_admin_audit(tenant_id, created_at desc);
create index if not exists idx_agenda_user_admin_audit_target
  on public.agenda_user_admin_audit(target_user_id, created_at desc);
