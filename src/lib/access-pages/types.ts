/**
 * Data contract for CMS-backed protected access pages.
 *
 * Access pages deliberately use an unpublished `pages` row (`page_type =
 * "static"`) so the existing anonymous CMS read policy cannot expose their
 * contents. The `access_settings` section is read with the service-role client
 * on the server only.
 */

export const ACCESS_SETTINGS_SECTION_KEY = "access_settings";
export const ACCESS_SCHEMA_VERSION = 1 as const;

export type AccessPageStatus = "draft" | "active" | "archived";

export interface AccessGrant {
  id: string;
  label: string;
  recipient_hint: string;
  /** SHA-256 digest produced by `hashAccessToken`; never store the raw token. */
  token_hash: string;
  /** Non-secret characters shown in admin lists to identify a link. */
  token_prefix: string;
  /** Scrypt envelope produced by `hashAccessPassword`, or an empty string. */
  password_hash: string;
  expires_at: string | null;
  revoked_at: string | null;
  max_views: number | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

export interface AccessSettings {
  schema_version: typeof ACCESS_SCHEMA_VERSION;
  status: AccessPageStatus;
  template_key: "proposal" | string;
  client_name: string;
  document_title: string;
  prepared_for: string;
  prepared_by: string;
  prepared_date: string;
  intro: string;
  hero_image: string;
  hero_video: string;
  pdf_url: string;
  allow_download: boolean;
  grants: AccessGrant[];
}

export type AccessSectionValue =
  | null
  | boolean
  | number
  | string
  | AccessSectionValue[]
  | { [key: string]: AccessSectionValue };

export type AccessSectionContent = Record<string, AccessSectionValue>;

export interface AccessContentSection {
  id: string;
  section_key: string;
  section_type: string;
  content: AccessSectionContent;
  sort_order: number;
  is_visible: boolean;
}

export interface AccessPageDocument {
  id: string;
  slug: string;
  title: string;
  settings: AccessSettings;
  sections: AccessContentSection[];
}

/** Safe subset that may be passed to a client component after authorization. */
export type PublicAccessSettings = Omit<AccessSettings, "grants">;

export interface AccessSessionClaims {
  kind: "access";
  page_id: string;
  grant_id: string;
  slug: string;
  issued_at: number;
  expires_at: number;
  /** Changes when the grant's token or password credential is rotated. */
  grant_fingerprint: string;
  /** Successful open number for enforcing a subsequently lowered max_views. */
  view_sequence: number;
}

export interface AccessChallengeClaims {
  kind: "challenge";
  page_id: string;
  grant_id: string;
  slug: string;
  issued_at: number;
  expires_at: number;
  /** Changes when the grant's token or password credential is rotated. */
  grant_fingerprint: string;
}
