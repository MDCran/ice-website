alter table public.marketing_campaigns
  add column if not exists body_only boolean not null default false,
  add column if not exists body_text text not null default '';

comment on column public.marketing_campaigns.body_only is
  'Send the saved body_text as plain text without the branded HTML wrapper or preference footer. Application restricts this mode to transactional messages.';
