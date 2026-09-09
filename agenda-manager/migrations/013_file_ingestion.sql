create table if not exists public.agenda_file_ingestions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.agm_workspaces(id) on delete set null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  storage_path text not null unique,
  status text not null default 'uploaded' check (status in ('uploaded','processing','ready','approved','failed')),
  extracted_text text,
  analysis_summary text,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_file_task_candidates (
  id uuid primary key default gen_random_uuid(),
  ingestion_id uuid not null references public.agenda_file_ingestions(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  destination text not null default 'inbox' check (destination in ('inbox','my_day','project','study','calendar')),
  context_type text,
  context_label text,
  owner_hint text,
  confidence numeric(5,4) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  source_excerpt text,
  status text not null default 'suggested' check (status in ('suggested','approved','ignored','created')),
  task_id uuid references public.agm_tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_agenda_file_ingestions_tenant_user on public.agenda_file_ingestions(tenant_id,user_id,created_at desc);
create index if not exists idx_agenda_file_candidates_ingestion on public.agenda_file_task_candidates(ingestion_id,status,confidence desc);

alter table public.agenda_file_ingestions enable row level security;
alter table public.agenda_file_task_candidates enable row level security;

drop policy if exists agenda_file_ingestions_user_all on public.agenda_file_ingestions;
create policy agenda_file_ingestions_user_all on public.agenda_file_ingestions for all to authenticated
  using (public.agenda_member_of(tenant_id) and user_id = auth.uid())
  with check (public.agenda_member_of(tenant_id) and user_id = auth.uid());

drop policy if exists agenda_file_candidates_user_all on public.agenda_file_task_candidates;
create policy agenda_file_candidates_user_all on public.agenda_file_task_candidates for all to authenticated
  using (public.agenda_member_of(tenant_id) and user_id = auth.uid())
  with check (public.agenda_member_of(tenant_id) and user_id = auth.uid());

grant select,insert,update,delete on public.agenda_file_ingestions to authenticated;
grant select,insert,update,delete on public.agenda_file_task_candidates to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('agenda-uploads','agenda-uploads',false,26214400,array[
  'text/plain','text/markdown','text/csv','application/json','application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
])
on conflict (id) do update set public=false,file_size_limit=26214400,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists agenda_uploads_select on storage.objects;
create policy agenda_uploads_select on storage.objects for select to authenticated using (
  bucket_id='agenda-uploads' and public.agenda_member_of(((storage.foldername(name))[1])::uuid)
);
drop policy if exists agenda_uploads_insert on storage.objects;
create policy agenda_uploads_insert on storage.objects for insert to authenticated with check (
  bucket_id='agenda-uploads' and public.agenda_member_of(((storage.foldername(name))[1])::uuid)
  and (storage.foldername(name))[2]=auth.uid()::text
);
drop policy if exists agenda_uploads_delete on storage.objects;
create policy agenda_uploads_delete on storage.objects for delete to authenticated using (
  bucket_id='agenda-uploads' and public.agenda_member_of(((storage.foldername(name))[1])::uuid)
  and (storage.foldername(name))[2]=auth.uid()::text
);