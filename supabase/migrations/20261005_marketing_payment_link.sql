alter table public.marketing_settings
  add column if not exists payment_url text,
  add column if not exists email_logo_url text,
  add column if not exists email_logo_alt text,
  add column if not exists email_header_color text,
  add column if not exists email_company_name text,
  add column if not exists email_location text,
  add column if not exists email_phone text,
  add column if not exists email_website_url text,
  add column if not exists email_footer_note text,
  add column if not exists email_accent_color text,
  add column if not exists email_hero_color text,
  add column if not exists email_footer_color text,
  add column if not exists email_page_color text,
  add column if not exists email_font_family text;

comment on column public.marketing_settings.payment_url is
  'HTTPS customer payment URL inserted into future balance-due and past-due email sends.';
