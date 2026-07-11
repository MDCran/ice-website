// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string; // uuid, references auth.users
  email: string;
  display_name: string;
  role: "super_admin" | "admin" | "editor" | string;
  avatar_url: string | null;
  totp_enabled?: boolean;
  totp_enabled_at?: string | null;
  /** Never select from the browser — service-role only. */
  totp_secret?: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface PageView {
  id: number;
  path: string;
  title: string | null;
  referrer: string | null;
  lcp_ms: number | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
}

// ─── CMS: Pages & Sections ───────────────────────────────────────────────────

export interface Page {
  id: string; // uuid
  slug: string; // unique
  title: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PageSection {
  id: string; // uuid
  page_id: string; // uuid → pages.id
  section_key: string; // e.g. "hero", "stats"
  section_type: string; // component type identifier
  content: Record<string, unknown>; // jsonb
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSectionVersion {
  id: string; // uuid
  section_id: string; // uuid → page_sections.id
  content: Record<string, unknown>; // jsonb
  changed_by: string | null; // uuid → admin_profiles.id
  change_note: string | null;
  created_at: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavigationItem {
  id: string; // uuid
  label: string;
  href: string;
  parent_id: string | null; // uuid → navigation_items.id (self-ref)
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
  icon: string | null;
  badge: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface Media {
  id: string; // uuid
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  bucket: string;
  storage_path: string;
  public_url: string;
  uploaded_by: string | null; // uuid → admin_profiles.id
  created_at: string;
}

// ─── Client Portal ──────────────────────────────────────────────────────────

export interface ClientAccount {
  id: string; // uuid
  company_name: string;
  account_number: string | null;
  industry: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientUser {
  id: string; // uuid, references auth.users
  account_id: string; // uuid → client_accounts.id
  email: string;
  full_name: string;
  role: string; // e.g. "admin" | "viewer"
  is_primary: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string; // uuid
  account_id: string; // uuid → client_accounts.id
  first_name: string;
  last_name: string;
  title: string | null;
  department: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactPhone {
  id: string; // uuid
  contact_id: string; // uuid → client_contacts.id
  phone_type: string; // e.g. "work" | "mobile" | "fax"
  phone_number: string;
  is_primary: boolean;
  created_at: string;
}

export interface ContactEmail {
  id: string; // uuid
  contact_id: string; // uuid → client_contacts.id
  email_type: string; // e.g. "work" | "personal"
  email_address: string;
  is_primary: boolean;
  created_at: string;
}

export interface ClientContactChange {
  id: string; // uuid
  account_id: string; // uuid → client_accounts.id
  submitted_by: string; // uuid → client_users.id
  change_type: string; // e.g. "add" | "update" | "remove"
  contact_id: string | null; // uuid → client_contacts.id (null for new)
  proposed_data: Record<string, unknown>; // jsonb
  status: string; // e.g. "pending" | "approved" | "rejected"
  reviewed_by: string | null; // uuid → admin_profiles.id
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClientResource {
  id: string;
  client_account_id: string;
  title: string;
  description: string | null;
  author: string | null;
  file_url: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number | null;
  allow_download: boolean;
  visibility: string; // "draft" | "published"
  share_token: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInvoice {
  id: string; // uuid
  account_id: string; // uuid → client_accounts.id
  title: string | null;
  invoice_number: string;
  amount_cents: number;
  currency: string; // e.g. "USD"
  status: string; // e.g. "draft" | "sent" | "accepted" | "denied" | "paid" | "overdue" | "hidden"
  issued_at: string | null;
  due_at: string | null;
  deadline_at: string | null;
  extended_days: number;
  paid_at: string | null;
  pdf_url: string | null;
  share_token: string | null;
  line_items: Record<string, unknown>[] | null; // jsonb array
  created_at: string;
  updated_at: string;
}

// ─── Document Signing ────────────────────────────────────────────────────────

export interface SigningDocument {
  id: string; // uuid
  account_id: string; // uuid → client_accounts.id
  title: string;
  description: string | null;
  file_url: string;
  status: string; // e.g. "draft" | "pending" | "in_progress" | "completed"
  contact_id: string | null; // uuid → client_contacts.id
  sent_to_email: string | null;
  sent_to_name: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  signature_data: Record<string, unknown> | null; // jsonb
  field_values: Record<string, unknown> | null; // jsonb — auto-saved field data
  ip_address: string | null;
  user_agent: string | null;
  deadline_at: string | null;
  created_by: string | null; // uuid → admin_profiles.id
  created_at: string;
  updated_at: string;
}

export interface SigningField {
  id: string; // uuid
  document_id: string; // uuid → signing_documents.id
  field_type: string; // e.g. "signature" | "initials" | "date" | "text"
  label: string | null;
  page_number: number;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_required: boolean;
  value: string | null;
  filled_at: string | null;
  sort_order: number;
  created_at: string;
}

// ─── Surveys ─────────────────────────────────────────────────────────────────

export interface Survey {
  id: string; // uuid
  title: string;
  description: string | null;
  account_id: string | null; // uuid → client_accounts.id (null = global)
  status: string; // e.g. "draft" | "active" | "completed" | "closed"
  response_values: Record<string, unknown> | null; // jsonb — auto-saved answers
  current_question_index: number; // for resuming
  contact_id: string | null; // uuid → client_contacts.id
  submitted_at: string | null;
  submitted_by: string | null; // uuid → client_users.id
  deadline_at: string | null;
  created_by: string | null; // uuid → admin_profiles.id
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string; // uuid
  survey_id: string; // uuid → surveys.id
  question_text: string;
  description: string | null;
  question_type: string; // "short_text" | "long_text" | "multiple_choice" | "yes_no" | "ranking" | "phone_time_day" | "star_rating"
  options: string[] | null; // text[] for choices
  config: Record<string, unknown> | null; // jsonb — e.g. { maxSelections: 1 }
  is_required: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Client Account extended fields ─────────────────────────────────────────

export interface ClientAccountFull extends ClientAccount {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
}
