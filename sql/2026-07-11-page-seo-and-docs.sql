-- Optional page-level SEO columns.
-- The CMS editor already persists these in a reserved page_sections row
-- (section_key = 'page_seo'), so this migration is optional.
-- Apply in the Supabase SQL editor when ready.

alter table pages add column if not exists og_image_url text;
alter table pages add column if not exists twitter_image_url text;
alter table pages add column if not exists canonical_url text;
alter table pages add column if not exists favicon_url text;

comment on table client_resources is
  'Client portal documents. Admins upload via /admin/clients/[id]/resources; clients view at /portal/resources when logged in. Not for public /access/ links.';
