-- Consent preferences shared by the public preference center and Marketing Center.

alter table public.marketing_contacts
  add column if not exists marketing_preferences jsonb not null default '{}'::jsonb,
  add column if not exists consent_ip text,
  add column if not exists consent_user_agent text;

alter table public.subscribers
  add column if not exists marketing_preferences jsonb not null default '{}'::jsonb,
  add column if not exists consent_ip text,
  add column if not exists consent_user_agent text;

alter table public.marketing_campaigns
  drop constraint if exists marketing_campaigns_campaign_type_check;

alter table public.marketing_campaigns
  add constraint marketing_campaigns_campaign_type_check
  check (campaign_type in (
    'marketing', 'billing', 'transactional', 'private_message',
    'special_message', 'event', 'service_update', 'maintenance', 'service_alert'
  ));

create index if not exists marketing_contacts_preferences_idx
  on public.marketing_contacts using gin(marketing_preferences);
