-- Optional pay-online fields for portal invoices (#49)
alter table public.client_invoices
  add column if not exists payment_url text,
  add column if not exists payment_submitted_at timestamptz;
