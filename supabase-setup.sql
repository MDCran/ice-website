-- =============================================================================
-- ICE Website — Complete Supabase SQL Migration
-- =============================================================================
-- Run this ENTIRE file in the Supabase SQL Editor in ONE go.
-- Order: 1) Tables  2) Helper functions  3) RLS + Policies  4) Indexes
-- =============================================================================


-- =============================================================================
-- PART 1: CREATE ALL TABLES
-- =============================================================================

-- 1. admin_profiles
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  role text not null default 'admin'
    check (role in ('super_admin', 'admin', 'editor')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. pages
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  meta_title text,
  meta_description text,
  page_type text not null default 'static'
    check (page_type in ('static', 'solution', 'legal')),
  is_published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references admin_profiles(id)
);

-- 3. page_sections
create table if not exists page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  section_key text not null,
  section_type text not null default 'custom',
  content jsonb not null default '{}',
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references admin_profiles(id),
  unique(page_id, section_key)
);

-- 4. page_section_versions
create table if not exists page_section_versions (
  id uuid primary key default gen_random_uuid(),
  page_section_id uuid not null references page_sections(id) on delete cascade,
  content jsonb not null,
  changed_by uuid references admin_profiles(id),
  created_at timestamptz default now()
);

-- 5. navigation_items
create table if not exists navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null
    check (location in ('navbar', 'navbar_mega', 'footer_quick', 'footer_legal')),
  parent_id uuid references navigation_items(id) on delete cascade,
  label text not null,
  href text not null,
  icon_name text,
  mega_column_title text,
  mega_column_icon text,
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. media
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,
  bucket text not null default 'public-media',
  public_url text not null,
  alt_text text,
  folder text default '/',
  width int,
  height int,
  is_static_local boolean default false,
  uploaded_by uuid references admin_profiles(id),
  created_at timestamptz default now()
);

-- 7. client_accounts
create table if not exists client_accounts (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  slug text unique not null,
  logo_url text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text default 'US',
  phone text,
  website text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. client_users
create table if not exists client_users (
  id uuid primary key references auth.users(id) on delete cascade,
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null default 'viewer'
    check (role in ('admin', 'editor', 'viewer')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. client_contacts
create table if not exists client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  title text,
  department text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. contact_phones
create table if not exists contact_phones (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references client_contacts(id) on delete cascade,
  phone text not null,
  label text default 'primary',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 11. contact_emails
create table if not exists contact_emails (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references client_contacts(id) on delete cascade,
  email text not null,
  label text default 'primary',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 12. client_contact_changes
create table if not exists client_contact_changes (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  contact_id uuid references client_contacts(id) on delete set null,
  change_type text not null
    check (change_type in ('add', 'edit', 'remove')),
  before_data jsonb,
  after_data jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  review_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- 13. client_resources
create table if not exists client_resources (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  title text not null,
  description text,
  author text,
  file_url text not null,
  storage_path text not null,
  mime_type text not null default 'application/pdf',
  size_bytes bigint,
  allow_download boolean default true,
  visibility text not null default 'draft'
    check (visibility in ('draft', 'published')),
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. client_invoices
create table if not exists client_invoices (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  storage_path text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'accepted', 'denied', 'void')),
  deadline_at timestamptz,
  original_deadline_at timestamptz,
  extended_days int default 0,
  is_hidden boolean default false,
  display_updated_at timestamptz default now(),
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. signing_documents
create table if not exists signing_documents (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  title text not null,
  description text,
  source_file_url text not null,
  source_storage_path text not null,
  completed_file_url text,
  completed_storage_path text,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'in_progress', 'completed')),
  allowed_contact_ids uuid[],
  signed_by_contact_id uuid references client_contacts(id),
  signed_by_user_id uuid references auth.users(id),
  signed_at timestamptz,
  field_values jsonb default '{}',
  last_saved_at timestamptz,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 16. signing_fields
create table if not exists signing_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references signing_documents(id) on delete cascade,
  field_type text not null
    check (field_type in ('signature', 'initials', 'text_input', 'checkbox', 'selector')),
  label text,
  page_number int not null,
  x_percent numeric not null,
  y_percent numeric not null,
  width_percent numeric not null,
  height_percent numeric not null,
  options jsonb,
  is_required boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 17. surveys
create table if not exists surveys (
  id uuid primary key default gen_random_uuid(),
  client_account_id uuid not null references client_accounts(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'expired')),
  expires_at timestamptz,
  responded_by_contact_id uuid references client_contacts(id),
  responded_by_user_id uuid references auth.users(id),
  responded_at timestamptz,
  response_values jsonb default '{}',
  current_question_index int default 0,
  last_saved_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 18. survey_questions
create table if not exists survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys(id) on delete cascade,
  question_type text not null
    check (question_type in ('short_text', 'long_text', 'multiple_choice', 'yes_no', 'ranking', 'phone_time_day', 'star_rating')),
  question_text text not null,
  description text,
  config jsonb default '{}',
  is_required boolean default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);


-- =============================================================================
-- PART 2: HELPER FUNCTIONS (after tables exist)
-- =============================================================================

create or replace function get_user_role()
returns text as $$
  select coalesce(
    (select role from admin_profiles where id = auth.uid()),
    (select 'client' from client_users where id = auth.uid()),
    'anon'
  )
$$ language sql security definer stable;

create or replace function is_admin()
returns boolean as $$
  select exists(select 1 from admin_profiles where id = auth.uid())
$$ language sql security definer stable;

create or replace function get_client_account_id()
returns uuid as $$
  select client_account_id from client_users where id = auth.uid()
$$ language sql security definer stable;


-- =============================================================================
-- PART 3: ENABLE RLS + CREATE POLICIES
-- =============================================================================
-- Uses DROP IF EXISTS + CREATE so this file is safe to re-run.

-- admin_profiles
alter table admin_profiles enable row level security;
drop policy if exists "admin_profiles: admins can select" on admin_profiles;
create policy "admin_profiles: admins can select" on admin_profiles for select to authenticated using (is_admin());
drop policy if exists "admin_profiles: super_admin can insert" on admin_profiles;
create policy "admin_profiles: super_admin can insert" on admin_profiles for insert to authenticated with check (exists(select 1 from admin_profiles where id = auth.uid() and role = 'super_admin'));
drop policy if exists "admin_profiles: super_admin can update" on admin_profiles;
create policy "admin_profiles: super_admin can update" on admin_profiles for update to authenticated using (exists(select 1 from admin_profiles where id = auth.uid() and role = 'super_admin'));
drop policy if exists "admin_profiles: super_admin can delete" on admin_profiles;
create policy "admin_profiles: super_admin can delete" on admin_profiles for delete to authenticated using (exists(select 1 from admin_profiles where id = auth.uid() and role = 'super_admin'));

-- pages
alter table pages enable row level security;
drop policy if exists "pages: admins can select" on pages;
create policy "pages: admins can select" on pages for select to authenticated using (is_admin());
drop policy if exists "pages: admins can insert" on pages;
create policy "pages: admins can insert" on pages for insert to authenticated with check (is_admin());
drop policy if exists "pages: admins can update" on pages;
create policy "pages: admins can update" on pages for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "pages: admins can delete" on pages;
create policy "pages: admins can delete" on pages for delete to authenticated using (is_admin());
drop policy if exists "pages: public can select published" on pages;
create policy "pages: public can select published" on pages for select using (is_published = true);

-- page_sections
alter table page_sections enable row level security;
drop policy if exists "page_sections: admins can select" on page_sections;
create policy "page_sections: admins can select" on page_sections for select to authenticated using (is_admin());
drop policy if exists "page_sections: admins can insert" on page_sections;
create policy "page_sections: admins can insert" on page_sections for insert to authenticated with check (is_admin());
drop policy if exists "page_sections: admins can update" on page_sections;
create policy "page_sections: admins can update" on page_sections for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "page_sections: admins can delete" on page_sections;
create policy "page_sections: admins can delete" on page_sections for delete to authenticated using (is_admin());
drop policy if exists "page_sections: public can select published" on page_sections;
create policy "page_sections: public can select published" on page_sections for select using (exists(select 1 from pages where pages.id = page_sections.page_id and pages.is_published = true));

-- page_section_versions
alter table page_section_versions enable row level security;
drop policy if exists "page_section_versions: admins can select" on page_section_versions;
create policy "page_section_versions: admins can select" on page_section_versions for select to authenticated using (is_admin());
drop policy if exists "page_section_versions: admins can insert" on page_section_versions;
create policy "page_section_versions: admins can insert" on page_section_versions for insert to authenticated with check (is_admin());

-- navigation_items
alter table navigation_items enable row level security;
drop policy if exists "navigation_items: admins can select" on navigation_items;
create policy "navigation_items: admins can select" on navigation_items for select to authenticated using (is_admin());
drop policy if exists "navigation_items: admins can insert" on navigation_items;
create policy "navigation_items: admins can insert" on navigation_items for insert to authenticated with check (is_admin());
drop policy if exists "navigation_items: admins can update" on navigation_items;
create policy "navigation_items: admins can update" on navigation_items for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "navigation_items: admins can delete" on navigation_items;
create policy "navigation_items: admins can delete" on navigation_items for delete to authenticated using (is_admin());
drop policy if exists "navigation_items: public can select visible" on navigation_items;
create policy "navigation_items: public can select visible" on navigation_items for select to anon using (is_visible = true);

-- media
alter table media enable row level security;
drop policy if exists "media: admins can select" on media;
create policy "media: admins can select" on media for select to authenticated using (is_admin());
drop policy if exists "media: admins can insert" on media;
create policy "media: admins can insert" on media for insert to authenticated with check (is_admin());
drop policy if exists "media: admins can update" on media;
create policy "media: admins can update" on media for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "media: admins can delete" on media;
create policy "media: admins can delete" on media for delete to authenticated using (is_admin());

-- client_accounts
alter table client_accounts enable row level security;
drop policy if exists "client_accounts: admins can select" on client_accounts;
create policy "client_accounts: admins can select" on client_accounts for select to authenticated using (is_admin());
drop policy if exists "client_accounts: admins can insert" on client_accounts;
create policy "client_accounts: admins can insert" on client_accounts for insert to authenticated with check (is_admin());
drop policy if exists "client_accounts: admins can update" on client_accounts;
create policy "client_accounts: admins can update" on client_accounts for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_accounts: admins can delete" on client_accounts;
create policy "client_accounts: admins can delete" on client_accounts for delete to authenticated using (is_admin());
drop policy if exists "client_accounts: clients can select own" on client_accounts;
create policy "client_accounts: clients can select own" on client_accounts for select to authenticated using (id = get_client_account_id());

-- client_users
alter table client_users enable row level security;
drop policy if exists "client_users: admins can select" on client_users;
create policy "client_users: admins can select" on client_users for select to authenticated using (is_admin());
drop policy if exists "client_users: admins can insert" on client_users;
create policy "client_users: admins can insert" on client_users for insert to authenticated with check (is_admin());
drop policy if exists "client_users: admins can update" on client_users;
create policy "client_users: admins can update" on client_users for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_users: admins can delete" on client_users;
create policy "client_users: admins can delete" on client_users for delete to authenticated using (is_admin());
drop policy if exists "client_users: users can select self" on client_users;
create policy "client_users: users can select self" on client_users for select to authenticated using (id = auth.uid());
drop policy if exists "client_users: clients can select own account" on client_users;
create policy "client_users: clients can select own account" on client_users for select to authenticated using (client_account_id = get_client_account_id());

-- client_contacts
alter table client_contacts enable row level security;
drop policy if exists "client_contacts: admins can select" on client_contacts;
create policy "client_contacts: admins can select" on client_contacts for select to authenticated using (is_admin());
drop policy if exists "client_contacts: admins can insert" on client_contacts;
create policy "client_contacts: admins can insert" on client_contacts for insert to authenticated with check (is_admin());
drop policy if exists "client_contacts: admins can update" on client_contacts;
create policy "client_contacts: admins can update" on client_contacts for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_contacts: admins can delete" on client_contacts;
create policy "client_contacts: admins can delete" on client_contacts for delete to authenticated using (is_admin());
drop policy if exists "client_contacts: clients can select own company" on client_contacts;
create policy "client_contacts: clients can select own company" on client_contacts for select to authenticated using (client_account_id = get_client_account_id());

-- contact_phones
alter table contact_phones enable row level security;
drop policy if exists "contact_phones: admins can select" on contact_phones;
create policy "contact_phones: admins can select" on contact_phones for select to authenticated using (is_admin());
drop policy if exists "contact_phones: admins can insert" on contact_phones;
create policy "contact_phones: admins can insert" on contact_phones for insert to authenticated with check (is_admin());
drop policy if exists "contact_phones: admins can update" on contact_phones;
create policy "contact_phones: admins can update" on contact_phones for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "contact_phones: admins can delete" on contact_phones;
create policy "contact_phones: admins can delete" on contact_phones for delete to authenticated using (is_admin());
drop policy if exists "contact_phones: clients can select own company" on contact_phones;
create policy "contact_phones: clients can select own company" on contact_phones for select to authenticated using (exists(select 1 from client_contacts where client_contacts.id = contact_phones.contact_id and client_contacts.client_account_id = get_client_account_id()));

-- contact_emails
alter table contact_emails enable row level security;
drop policy if exists "contact_emails: admins can select" on contact_emails;
create policy "contact_emails: admins can select" on contact_emails for select to authenticated using (is_admin());
drop policy if exists "contact_emails: admins can insert" on contact_emails;
create policy "contact_emails: admins can insert" on contact_emails for insert to authenticated with check (is_admin());
drop policy if exists "contact_emails: admins can update" on contact_emails;
create policy "contact_emails: admins can update" on contact_emails for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "contact_emails: admins can delete" on contact_emails;
create policy "contact_emails: admins can delete" on contact_emails for delete to authenticated using (is_admin());
drop policy if exists "contact_emails: clients can select own company" on contact_emails;
create policy "contact_emails: clients can select own company" on contact_emails for select to authenticated using (exists(select 1 from client_contacts where client_contacts.id = contact_emails.contact_id and client_contacts.client_account_id = get_client_account_id()));

-- client_contact_changes
alter table client_contact_changes enable row level security;
drop policy if exists "client_contact_changes: admins can select" on client_contact_changes;
create policy "client_contact_changes: admins can select" on client_contact_changes for select to authenticated using (is_admin());
drop policy if exists "client_contact_changes: admins can insert" on client_contact_changes;
create policy "client_contact_changes: admins can insert" on client_contact_changes for insert to authenticated with check (is_admin());
drop policy if exists "client_contact_changes: admins can update" on client_contact_changes;
create policy "client_contact_changes: admins can update" on client_contact_changes for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_contact_changes: admins can delete" on client_contact_changes;
create policy "client_contact_changes: admins can delete" on client_contact_changes for delete to authenticated using (is_admin());
drop policy if exists "client_contact_changes: clients can insert own" on client_contact_changes;
create policy "client_contact_changes: clients can insert own" on client_contact_changes for insert to authenticated with check (client_account_id = get_client_account_id() and requested_by = auth.uid());
drop policy if exists "client_contact_changes: clients can select own" on client_contact_changes;
create policy "client_contact_changes: clients can select own" on client_contact_changes for select to authenticated using (client_account_id = get_client_account_id());

-- client_resources
alter table client_resources enable row level security;
drop policy if exists "client_resources: admins can select" on client_resources;
create policy "client_resources: admins can select" on client_resources for select to authenticated using (is_admin());
drop policy if exists "client_resources: admins can insert" on client_resources;
create policy "client_resources: admins can insert" on client_resources for insert to authenticated with check (is_admin());
drop policy if exists "client_resources: admins can update" on client_resources;
create policy "client_resources: admins can update" on client_resources for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_resources: admins can delete" on client_resources;
create policy "client_resources: admins can delete" on client_resources for delete to authenticated using (is_admin());
drop policy if exists "client_resources: clients can select published own" on client_resources;
create policy "client_resources: clients can select published own" on client_resources for select to authenticated using (client_account_id = get_client_account_id() and visibility = 'published');

-- client_invoices
alter table client_invoices enable row level security;
drop policy if exists "client_invoices: admins can select" on client_invoices;
create policy "client_invoices: admins can select" on client_invoices for select to authenticated using (is_admin());
drop policy if exists "client_invoices: admins can insert" on client_invoices;
create policy "client_invoices: admins can insert" on client_invoices for insert to authenticated with check (is_admin());
drop policy if exists "client_invoices: admins can update" on client_invoices;
create policy "client_invoices: admins can update" on client_invoices for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "client_invoices: admins can delete" on client_invoices;
create policy "client_invoices: admins can delete" on client_invoices for delete to authenticated using (is_admin());
drop policy if exists "client_invoices: clients can select own" on client_invoices;
create policy "client_invoices: clients can select own" on client_invoices for select to authenticated using (client_account_id = get_client_account_id() and status != 'draft' and is_hidden = false);
drop policy if exists "client_invoices: clients can update status on active" on client_invoices;
create policy "client_invoices: clients can update status on active" on client_invoices for update to authenticated using (client_account_id = get_client_account_id() and status = 'active' and is_hidden = false) with check (client_account_id = get_client_account_id() and status in ('accepted', 'denied'));

-- signing_documents
alter table signing_documents enable row level security;
drop policy if exists "signing_documents: admins can select" on signing_documents;
create policy "signing_documents: admins can select" on signing_documents for select to authenticated using (is_admin());
drop policy if exists "signing_documents: admins can insert" on signing_documents;
create policy "signing_documents: admins can insert" on signing_documents for insert to authenticated with check (is_admin());
drop policy if exists "signing_documents: admins can update" on signing_documents;
create policy "signing_documents: admins can update" on signing_documents for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "signing_documents: admins can delete" on signing_documents;
create policy "signing_documents: admins can delete" on signing_documents for delete to authenticated using (is_admin());
drop policy if exists "signing_documents: clients can select own" on signing_documents;
create policy "signing_documents: clients can select own" on signing_documents for select to authenticated using (client_account_id = get_client_account_id() and status in ('pending', 'in_progress', 'completed'));
drop policy if exists "signing_documents: clients can update own" on signing_documents;
create policy "signing_documents: clients can update own" on signing_documents for update to authenticated using (client_account_id = get_client_account_id() and status in ('pending', 'in_progress')) with check (client_account_id = get_client_account_id());

-- signing_fields
alter table signing_fields enable row level security;
drop policy if exists "signing_fields: admins can select" on signing_fields;
create policy "signing_fields: admins can select" on signing_fields for select to authenticated using (is_admin());
drop policy if exists "signing_fields: admins can insert" on signing_fields;
create policy "signing_fields: admins can insert" on signing_fields for insert to authenticated with check (is_admin());
drop policy if exists "signing_fields: admins can update" on signing_fields;
create policy "signing_fields: admins can update" on signing_fields for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "signing_fields: admins can delete" on signing_fields;
create policy "signing_fields: admins can delete" on signing_fields for delete to authenticated using (is_admin());
drop policy if exists "signing_fields: clients can select via document" on signing_fields;
create policy "signing_fields: clients can select via document" on signing_fields for select to authenticated using (exists(select 1 from signing_documents where signing_documents.id = signing_fields.document_id and signing_documents.client_account_id = get_client_account_id() and signing_documents.status in ('pending', 'in_progress', 'completed')));

-- surveys
alter table surveys enable row level security;
drop policy if exists "surveys: admins can select" on surveys;
create policy "surveys: admins can select" on surveys for select to authenticated using (is_admin());
drop policy if exists "surveys: admins can insert" on surveys;
create policy "surveys: admins can insert" on surveys for insert to authenticated with check (is_admin());
drop policy if exists "surveys: admins can update" on surveys;
create policy "surveys: admins can update" on surveys for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "surveys: admins can delete" on surveys;
create policy "surveys: admins can delete" on surveys for delete to authenticated using (is_admin());
drop policy if exists "surveys: clients can select own" on surveys;
create policy "surveys: clients can select own" on surveys for select to authenticated using (client_account_id = get_client_account_id() and status in ('active', 'completed'));
drop policy if exists "surveys: clients can update active own" on surveys;
create policy "surveys: clients can update active own" on surveys for update to authenticated using (client_account_id = get_client_account_id() and status = 'active') with check (client_account_id = get_client_account_id());

-- survey_questions
alter table survey_questions enable row level security;
drop policy if exists "survey_questions: admins can select" on survey_questions;
create policy "survey_questions: admins can select" on survey_questions for select to authenticated using (is_admin());
drop policy if exists "survey_questions: admins can insert" on survey_questions;
create policy "survey_questions: admins can insert" on survey_questions for insert to authenticated with check (is_admin());
drop policy if exists "survey_questions: admins can update" on survey_questions;
create policy "survey_questions: admins can update" on survey_questions for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "survey_questions: admins can delete" on survey_questions;
create policy "survey_questions: admins can delete" on survey_questions for delete to authenticated using (is_admin());
drop policy if exists "survey_questions: clients can select via survey" on survey_questions;
create policy "survey_questions: clients can select via survey" on survey_questions for select to authenticated using (exists(select 1 from surveys where surveys.id = survey_questions.survey_id and surveys.client_account_id = get_client_account_id() and surveys.status in ('active', 'completed')));


-- =============================================================================
-- PART 4: INDEXES
-- =============================================================================
create index if not exists idx_pages_slug on pages(slug);
create index if not exists idx_pages_published on pages(is_published) where is_published = true;
create index if not exists idx_page_sections_page_id on page_sections(page_id);
create index if not exists idx_page_section_versions_section_id on page_section_versions(page_section_id);
create index if not exists idx_navigation_items_location on navigation_items(location);
create index if not exists idx_navigation_items_parent on navigation_items(parent_id);
create index if not exists idx_media_folder on media(folder);
create index if not exists idx_media_bucket on media(bucket);
create index if not exists idx_client_accounts_slug on client_accounts(slug);
create index if not exists idx_client_users_account on client_users(client_account_id);
create index if not exists idx_client_contacts_account on client_contacts(client_account_id);
create index if not exists idx_contact_phones_contact on contact_phones(contact_id);
create index if not exists idx_contact_emails_contact on contact_emails(contact_id);
create index if not exists idx_client_contact_changes_account on client_contact_changes(client_account_id);
create index if not exists idx_client_contact_changes_status on client_contact_changes(status);
create index if not exists idx_client_resources_account on client_resources(client_account_id);
create index if not exists idx_client_resources_visibility on client_resources(visibility);
create index if not exists idx_client_invoices_account on client_invoices(client_account_id);
create index if not exists idx_client_invoices_status on client_invoices(status);
create index if not exists idx_signing_documents_account on signing_documents(client_account_id);
create index if not exists idx_signing_documents_status on signing_documents(status);
create index if not exists idx_signing_fields_document on signing_fields(document_id);
create index if not exists idx_surveys_account on surveys(client_account_id);
create index if not exists idx_surveys_status on surveys(status);
create index if not exists idx_survey_questions_survey on survey_questions(survey_id);


-- =============================================================================
-- DONE! Next steps:
--   1. Create your admin user in Supabase Auth dashboard
--   2. Run this to make them a super_admin:
--      INSERT INTO admin_profiles (id, display_name, email, role)
--      SELECT id, 'Admin', 'admin@icesales.com', 'super_admin'
--      FROM auth.users WHERE email = 'admin@icesales.com';
--   3. For analytics + 2FA columns/tables, also run:
--      supabase/migrations/20260711_admin_analytics_and_2fa.sql
-- =============================================================================
