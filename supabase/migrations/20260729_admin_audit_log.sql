-- Activity audit log for CMS / client admin actions (#44)
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_entity_idx
  on public.admin_audit_log (entity_type, entity_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on public.admin_audit_log;
create policy "Admins read audit log"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap where ap.id = auth.uid()
    )
  );

drop policy if exists "Admins insert audit log" on public.admin_audit_log;
create policy "Admins insert audit log"
  on public.admin_audit_log
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_profiles ap where ap.id = auth.uid()
    )
  );
