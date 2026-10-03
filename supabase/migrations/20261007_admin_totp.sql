-- Admin authenticator-app enrollment and verification storage.

alter table public.admin_profiles
  add column if not exists totp_enabled boolean not null default false,
  add column if not exists totp_enabled_at timestamptz;

comment on column public.admin_profiles.totp_enabled is
  'When true, admin login requires a valid six-digit TOTP code.';

create table if not exists public.admin_totp_secrets (
  admin_id uuid primary key references public.admin_profiles(id) on delete cascade,
  secret text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_totp_secrets enable row level security;
revoke all on public.admin_totp_secrets from public, anon, authenticated;
grant all on public.admin_totp_secrets to service_role;

-- Keep MFA flags server-managed. The settings form only needs to edit these
-- profile fields; clients must not be able to turn their own MFA off via REST.
revoke update on public.admin_profiles from public, anon, authenticated;
grant update (display_name, email, avatar_url, updated_at)
  on public.admin_profiles to authenticated;

comment on table public.admin_totp_secrets is
  'TOTP shared secrets, accessible only to server routes running with the service role.';

-- Move existing secrets out of admin_profiles before removing the column; its
-- ordinary profile read permissions must never expose a reusable MFA secret.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_profiles'
      and column_name = 'totp_secret'
  ) then
    execute $copy$
      insert into public.admin_totp_secrets (admin_id, secret)
      select id, totp_secret from public.admin_profiles
      where totp_secret is not null
      on conflict (admin_id) do nothing
    $copy$;
  end if;
exception
  when others then
    raise exception 'Could not securely migrate TOTP secrets: %', sqlerrm;
end $$;

alter table public.admin_profiles drop column if exists totp_secret;
notify pgrst, 'reload schema';
