-- Revenue attribution and structured qualification for enterprise lead capture.
-- Additive and safe to re-run.

alter table public.contacts
  add column if not exists form_key text,
  add column if not exists source text,
  add column if not exists page_path text,
  add column if not exists referrer text,
  add column if not exists utm jsonb default '{}'::jsonb,
  add column if not exists qualification jsonb default '{}'::jsonb,
  add column if not exists lead_score integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contacts_lead_score_range'
  ) then
    alter table public.contacts
      add constraint contacts_lead_score_range
      check (lead_score is null or lead_score between 0 and 100);
  end if;
end $$;

create index if not exists idx_contacts_source
  on public.contacts (source)
  where source is not null;

create index if not exists idx_contacts_lead_score
  on public.contacts (lead_score desc)
  where lead_score is not null;

comment on column public.contacts.form_key is
  'Stable CMS form identifier such as enterprise_briefing.';
comment on column public.contacts.source is
  'Conversion source or CTA surface supplied by the server-owned form flow.';
comment on column public.contacts.page_path is
  'Public page path where the lead converted.';
comment on column public.contacts.utm is
  'Sanitized UTM attribution values captured at conversion.';
comment on column public.contacts.qualification is
  'Structured, form-specific qualification answers.';
comment on column public.contacts.lead_score is
  'Server-calculated 0-100 intent score for pipeline prioritization.';
