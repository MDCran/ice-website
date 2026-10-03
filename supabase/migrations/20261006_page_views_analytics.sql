-- First-party public-site analytics storage.
-- Public writes are accepted only through /api/analytics/pageview using the
-- server-side service role; admins can read rows through the authenticated app.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  title text,
  referrer text,
  lcp_ms numeric(10, 2),
  user_agent text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);
create index if not exists page_views_path_idx
  on public.page_views (path);
create index if not exists page_views_path_created_idx
  on public.page_views (path, created_at desc);

comment on table public.page_views is
  'First-party public pageview and optional LCP samples for the admin dashboard.';

alter table public.page_views enable row level security;
grant select on public.page_views to authenticated;
grant insert, select on public.page_views to service_role;
grant usage, select on sequence public.page_views_id_seq to service_role;

drop policy if exists "page_views: admins can select" on public.page_views;
create policy "page_views: admins can select"
  on public.page_views for select to authenticated
  using (is_admin());
