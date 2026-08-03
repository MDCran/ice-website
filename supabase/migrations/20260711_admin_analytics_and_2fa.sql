-- =============================================================================
-- ICE Website — Admin analytics insights + profile 2FA
-- Migration: 20260711_admin_analytics_and_2fa
-- =============================================================================
-- APPLY STEPS (Supabase Dashboard → SQL Editor → New query):
--   1. Paste this entire file and run it once against project cbgfxbfqfbuodnhfxlpq.
--   2. Confirm tables/columns exist:
--        select column_name from information_schema.columns
--          where table_name = 'admin_profiles'
--            and column_name in ('totp_secret','totp_enabled','totp_enabled_at');
--        select to_regclass('public.page_views');
--   3. Redeploy / restart the Next.js app so API routes can use the new schema.
-- =============================================================================

-- ─── 1. admin_profiles: TOTP columns ─────────────────────────────────────────
-- totp_secret is never exposed to the client; only the service role reads it
-- via server API routes. Authenticated clients must not SELECT this column.

alter table admin_profiles
  add column if not exists totp_secret text,
  add column if not exists totp_enabled boolean not null default false,
  add column if not exists totp_enabled_at timestamptz;

comment on column admin_profiles.totp_secret is
  'Base32 TOTP secret. Service-role only — do not select from browser clients.';
comment on column admin_profiles.totp_enabled is
  'When true, admin login requires a valid 6-digit TOTP code.';

-- Allow each admin to update their own profile (display_name, email, avatar).
-- Role / totp_* remain writable only via service role or the policies below;
-- clients should never send totp_secret from the browser.
drop policy if exists "admin_profiles: self can update own profile" on admin_profiles;
create policy "admin_profiles: self can update own profile"
  on admin_profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Prevent privilege escalation via self-update
    and role = (select p.role from admin_profiles p where p.id = auth.uid())
  );

-- Keep existing super_admin full update policy.

-- Revoke direct column access to totp_secret from anon/authenticated when possible.
-- Service role (and table owner) retains access for API verification.
do $$
begin
  revoke select (totp_secret) on admin_profiles from anon, authenticated;
exception
  when others then
    raise notice 'Column privilege revoke skipped: %', sqlerrm;
end $$;

-- ─── 2. page_views: first-party analytics ────────────────────────────────────
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

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_path_created_idx on public.page_views (path, created_at desc);

comment on table public.page_views is
  'First-party public pageview + optional LCP samples for the admin dashboard.';

alter table public.page_views enable row level security;

-- Inserts go through the Next.js API (service role). Admins can read aggregates.
drop policy if exists "page_views: admins can select" on public.page_views;
create policy "page_views: admins can select"
  on public.page_views for select to authenticated
  using (is_admin());

-- No direct anon/authenticated insert policies — use service role via API.
