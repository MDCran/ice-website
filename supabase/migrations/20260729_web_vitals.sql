-- Core Web Vitals RUM samples (#33)
create table if not exists public.web_vitals (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value double precision not null,
  page_path text not null default '/',
  metric_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists web_vitals_created_at_idx on public.web_vitals (created_at desc);
create index if not exists web_vitals_metric_path_idx on public.web_vitals (metric_name, page_path);

alter table public.web_vitals enable row level security;

drop policy if exists "Anyone can insert web vitals" on public.web_vitals;
create policy "Anyone can insert web vitals"
  on public.web_vitals
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read web vitals" on public.web_vitals;
create policy "Admins read web vitals"
  on public.web_vitals
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap where ap.id = auth.uid()
    )
  );
