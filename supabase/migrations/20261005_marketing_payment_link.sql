alter table public.marketing_settings
  add column if not exists payment_url text;

comment on column public.marketing_settings.payment_url is
  'HTTPS customer payment URL inserted into future balance-due and past-due email sends.';
