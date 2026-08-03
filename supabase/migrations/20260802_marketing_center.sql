-- ICE Marketing Center: consent-aware audiences, lists, templates, campaigns,
-- delivery events, and suppression management.

alter table public.contacts
  add column if not exists email_marketing_consent boolean not null default false,
  add column if not exists email_consent_at timestamptz,
  add column if not exists email_consent_source text;

alter table public.subscribers
  add column if not exists email text,
  add column if not exists email_marketing_consent boolean not null default false,
  add column if not exists email_consent_at timestamptz,
  add column if not exists email_consent_source text;

create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  preferred_time text,
  context text,
  page_path text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.callback_requests enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'callback_requests' and policyname = 'callback_requests: anon insert') then
    create policy "callback_requests: anon insert" on public.callback_requests for insert to anon with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'callback_requests' and policyname = 'callback_requests: admins manage') then
    create policy "callback_requests: admins manage" on public.callback_requests for all to authenticated using (is_admin()) with check (is_admin());
  end if;
end $$;

create table if not exists public.marketing_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  company text,
  source text not null default 'manual',
  source_record_id uuid,
  tags text[] not null default '{}',
  custom_fields jsonb not null default '{}'::jsonb,
  email_consent_status text not null default 'unknown'
    check (email_consent_status in ('subscribed', 'unsubscribed', 'unknown', 'transactional_only')),
  email_consent_at timestamptz,
  email_consent_source text,
  suppressed_at timestamptz,
  suppression_reason text,
  last_emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists marketing_contacts_email_unique
  on public.marketing_contacts (email);
create index if not exists marketing_contacts_tags_idx
  on public.marketing_contacts using gin(tags);
create index if not exists marketing_contacts_consent_idx
  on public.marketing_contacts(email_consent_status, suppressed_at);

insert into public.marketing_contacts (
  first_name, last_name, email, phone, company, source, source_record_id,
  email_consent_status, email_consent_at, email_consent_source
)
select
  split_part(trim(name), ' ', 1),
  nullif(regexp_replace(trim(name), '^\S+\s*', ''), ''),
  lower(email),
  phone,
  company,
  coalesce(form_key, 'contact_form'),
  id,
  'subscribed',
  coalesce(email_consent_at, created_at),
  coalesce(email_consent_source, page_path, 'contact_form')
from public.contacts
where email_marketing_consent = true and email is not null
on conflict (email) do update set
  phone = coalesce(excluded.phone, marketing_contacts.phone),
  company = coalesce(excluded.company, marketing_contacts.company),
  email_consent_status = 'subscribed',
  email_consent_at = excluded.email_consent_at,
  email_consent_source = excluded.email_consent_source,
  updated_at = now();

insert into public.marketing_contacts (
  first_name, email, phone, company, source, source_record_id,
  email_consent_status, email_consent_at, email_consent_source
)
select
  name,
  lower(email),
  phone,
  company,
  'newsletter',
  id,
  'subscribed',
  coalesce(email_consent_at, created_at),
  coalesce(email_consent_source, 'newsletter_form')
from public.subscribers
where email_marketing_consent = true and email is not null
on conflict (email) do update set
  email_consent_status = 'subscribed',
  email_consent_at = excluded.email_consent_at,
  email_consent_source = excluded.email_consent_source,
  updated_at = now();

create table if not exists public.marketing_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default 'brand',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_list_members (
  list_id uuid not null references public.marketing_lists(id) on delete cascade,
  contact_id uuid not null references public.marketing_contacts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (list_id, contact_id)
);

create table if not exists public.marketing_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'general',
  description text,
  subject text not null default '',
  preheader text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  html text not null default '',
  is_system boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_type text not null default 'marketing'
    check (campaign_type in ('marketing', 'transactional', 'maintenance', 'service_alert')),
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'scheduled', 'sending', 'sent', 'cancelled')),
  list_id uuid references public.marketing_lists(id) on delete set null,
  template_id uuid references public.marketing_templates(id) on delete set null,
  subject text not null default '',
  preheader text not null default '',
  from_name text not null default 'International Computer Exchange',
  from_email text not null default 'info@icesales.com',
  reply_to text not null default 'info@icesales.com',
  blocks jsonb not null default '[]'::jsonb,
  html text not null default '',
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipient_count integer not null default 0,
  delivered_count integer not null default 0,
  opened_count integer not null default 0,
  clicked_count integer not null default 0,
  bounced_count integer not null default 0,
  complained_count integer not null default 0,
  unsubscribed_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_events (
  id bigint generated by default as identity primary key,
  campaign_id uuid references public.marketing_campaigns(id) on delete cascade,
  contact_id uuid references public.marketing_contacts(id) on delete set null,
  provider_message_id text,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketing_events_campaign_idx
  on public.marketing_events(campaign_id, event_type, created_at desc);

alter table public.marketing_contacts enable row level security;
alter table public.marketing_lists enable row level security;
alter table public.marketing_list_members enable row level security;
alter table public.marketing_templates enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_events enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'marketing_contacts',
    'marketing_lists',
    'marketing_list_members',
    'marketing_templates',
    'marketing_campaigns',
    'marketing_events'
  ]
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = table_name || ': admins manage'
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (is_admin()) with check (is_admin())',
        table_name || ': admins manage',
        table_name
      );
    end if;
  end loop;
end $$;
