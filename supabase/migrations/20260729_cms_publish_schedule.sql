-- ICE CMS: draft / publish / schedule enhancements
-- Apply locally against your Supabase project when ready.
-- Safe to re-run (IF NOT EXISTS / additive only).

-- Publishing metadata on pages
alter table pages
  add column if not exists scheduled_publish_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists publish_status text;

-- Backfill publish_status from existing is_published flag
update pages
set publish_status = case when is_published then 'published' else 'draft' end
where publish_status is null;

-- Constrain status values (drop + recreate for idempotency on re-run environments)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pages_publish_status_check'
  ) then
    alter table pages
      add constraint pages_publish_status_check
      check (publish_status in ('draft', 'scheduled', 'published'));
  end if;
end $$;

create index if not exists idx_pages_scheduled_publish
  on pages (scheduled_publish_at)
  where publish_status = 'scheduled';

create index if not exists idx_pages_publish_status
  on pages (publish_status);

comment on column pages.scheduled_publish_at is 'When publish_status=scheduled, go live at this timestamp (worker or request-time check).';
comment on column pages.published_at is 'Last time the page was set to published.';
comment on column pages.publish_status is 'draft | scheduled | published — complements is_published for public RLS.';

-- Optional: site announcement is stored as a page_sections row on site-settings
-- (section_key = announcement_banner). No schema change required.
