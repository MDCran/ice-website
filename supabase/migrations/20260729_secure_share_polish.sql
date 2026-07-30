-- Secure share polish for client_resources / client_invoices (#53)
-- Additive only; safe to re-run.

alter table client_resources
  add column if not exists share_expires_at timestamptz,
  add column if not exists share_password_hash text,
  add column if not exists share_view_count int default 0,
  add column if not exists share_last_viewed_at timestamptz,
  add column if not exists share_watermark boolean default false;

alter table client_invoices
  add column if not exists share_expires_at timestamptz,
  add column if not exists share_password_hash text,
  add column if not exists share_view_count int default 0,
  add column if not exists share_last_viewed_at timestamptz;

comment on column client_resources.share_expires_at is 'Optional expiry for share_token links';
comment on column client_resources.share_password_hash is 'Optional password gate (store hash only)';
comment on column client_resources.share_watermark is 'When true, watermark downloads for this share';
