-- Preserve evidence for an explicit website SMS opt-in. These fields are
-- intentionally separate from a phone number: a submitted phone number alone
-- must never be treated as text-message marketing consent.

alter table public.contacts
  add column if not exists sms_consent_at timestamptz,
  add column if not exists sms_consent_source text,
  add column if not exists sms_consent_ip text,
  add column if not exists sms_consent_user_agent text,
  add column if not exists sms_consent_disclosure_version text;

create index if not exists contacts_sms_consent_audit_idx
  on public.contacts (sms_consent_at desc)
  where sms_consent = true;

comment on column public.contacts.sms_consent_at is
  'When the contact affirmatively selected the optional SMS consent control.';
comment on column public.contacts.sms_consent_source is
  'Website form or conversion source where SMS consent was captured.';
comment on column public.contacts.sms_consent_disclosure_version is
  'Version of the disclosure presented beside the consent checkbox.';
