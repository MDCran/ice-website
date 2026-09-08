import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACCESS_SCHEMA_VERSION,
  ACCESS_SETTINGS_SECTION_KEY,
  type AccessChallengeClaims,
  type AccessContentSection,
  type AccessGrant,
  type AccessPageDocument,
  type AccessSectionContent,
  type AccessSessionClaims,
  type AccessSettings,
  type PublicAccessSettings,
} from "@/lib/access-pages/types";
import {
  accessGrantFingerprint,
  signAccessClaims,
  verifyAccessClaims,
  verifyAccessToken,
} from "@/lib/access-pages/crypto";

export const ACCESS_SESSION_SECONDS = 12 * 60 * 60;
export const ACCESS_CHALLENGE_SECONDS = 15 * 60;

type JsonObject = Record<string, unknown>;

export function isValidAccessSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,158}[a-z0-9])?$/.test(slug);
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableTimestamp(value: unknown): string | null {
  const candidate = asString(value);
  return candidate && !Number.isNaN(Date.parse(candidate)) ? candidate : null;
}

function parseNullableTimestamp(
  value: unknown,
): { valid: boolean; value: string | null } {
  if (value === null || value === undefined || value === "") {
    return { valid: true, value: null };
  }
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return { valid: false, value: null };
  }
  return { valid: true, value };
}

function asNonNegativeInteger(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : fallback;
}

function normalizeGrant(value: unknown): AccessGrant | null {
  const grant = asObject(value);
  if (!grant) return null;

  const id = asString(grant.id);
  const tokenHash = asString(grant.token_hash);
  if (!id || !tokenHash) return null;

  const expiresAt = parseNullableTimestamp(grant.expires_at);
  const revokedAt = parseNullableTimestamp(grant.revoked_at);
  if (!expiresAt.valid || !revokedAt.valid) return null;

  if (
    grant.view_count !== undefined &&
    (typeof grant.view_count !== "number" ||
      !Number.isSafeInteger(grant.view_count) ||
      grant.view_count < 0)
  ) {
    return null;
  }

  const maxViews =
    grant.max_views === null || grant.max_views === undefined || grant.max_views === ""
      ? null
      : asNonNegativeInteger(grant.max_views, 0);

  return {
    id,
    label: asString(grant.label) || "Shared link",
    recipient_hint: asString(grant.recipient_hint),
    token_hash: tokenHash,
    token_prefix: asString(grant.token_prefix),
    password_hash: asString(grant.password_hash),
    expires_at: expiresAt.value,
    revoked_at: revokedAt.value,
    max_views: maxViews,
    view_count: asNonNegativeInteger(grant.view_count, 0),
    last_viewed_at: asNullableTimestamp(grant.last_viewed_at),
    created_at: asNullableTimestamp(grant.created_at) || new Date(0).toISOString(),
  };
}

export function normalizeAccessSettings(value: unknown): AccessSettings | null {
  const settings = asObject(value);
  if (!settings || settings.schema_version !== ACCESS_SCHEMA_VERSION) return null;

  const rawStatus = asString(settings.status);
  const status =
    rawStatus === "draft" || rawStatus === "active" || rawStatus === "archived"
      ? rawStatus
      : null;
  if (!status) return null;

  return {
    schema_version: ACCESS_SCHEMA_VERSION,
    status,
    template_key: asString(settings.template_key) || "proposal",
    client_name: asString(settings.client_name),
    document_title: asString(settings.document_title),
    prepared_for: asString(settings.prepared_for),
    prepared_by: asString(settings.prepared_by),
    prepared_date: asString(settings.prepared_date),
    intro: asString(settings.intro),
    hero_image: asString(settings.hero_image),
    hero_video: asString(settings.hero_video),
    pdf_url: asString(settings.pdf_url),
    allow_download: settings.allow_download !== false,
    grants: Array.isArray(settings.grants)
      ? settings.grants.slice(0, 100).map(normalizeGrant).filter((grant): grant is AccessGrant => Boolean(grant))
      : [],
  };
}

export function publicAccessSettings(settings: AccessSettings): PublicAccessSettings {
  return {
    schema_version: settings.schema_version,
    status: settings.status,
    template_key: settings.template_key,
    client_name: settings.client_name,
    document_title: settings.document_title,
    prepared_for: settings.prepared_for,
    prepared_by: settings.prepared_by,
    prepared_date: settings.prepared_date,
    intro: settings.intro,
    hero_image: settings.hero_image,
    hero_video: settings.hero_video,
    pdf_url: settings.pdf_url,
    allow_download: settings.allow_download,
  };
}

function normalizeContent(value: unknown): AccessSectionContent {
  return (asObject(value) || {}) as AccessSectionContent;
}

export async function getAccessPageBySlug(
  slug: string,
): Promise<AccessPageDocument | null> {
  const cleanSlug = slug.trim();
  if (!isValidAccessSlug(cleanSlug)) return null;

  try {
    const supabase = createAdminClient();
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, slug, title, page_type, is_published")
      .eq("slug", cleanSlug)
      .eq("page_type", "static")
      .eq("is_published", false)
      .maybeSingle();

    if (pageError || !page) return null;

    const { data: rows, error: sectionsError } = await supabase
      .from("page_sections")
      .select("id, section_key, section_type, content, sort_order, is_visible")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    if (sectionsError || !rows) return null;

    const settingsRow = rows.find(
      (row) => row.section_key === ACCESS_SETTINGS_SECTION_KEY,
    );
    const settings = normalizeAccessSettings(settingsRow?.content);
    if (!settings) return null;

    const sections: AccessContentSection[] = rows
      .filter(
        (row) =>
          row.section_key !== ACCESS_SETTINGS_SECTION_KEY && row.is_visible !== false,
      )
      .map((row) => ({
        id: String(row.id),
        section_key: String(row.section_key),
        section_type: String(row.section_type || "content"),
        content: normalizeContent(row.content),
        sort_order:
          typeof row.sort_order === "number" ? row.sort_order : 0,
        is_visible: row.is_visible !== false,
      }));

    return {
      id: String(page.id),
      slug: String(page.slug),
      title: String(page.title),
      settings,
      sections,
    };
  } catch {
    return null;
  }
}

export type GrantValidationMode = "new-session" | "existing-session";

export function isAccessGrantUsable(
  page: AccessPageDocument,
  grant: AccessGrant,
  mode: GrantValidationMode,
  viewSequence?: number,
): boolean {
  if (page.settings.status !== "active" || grant.revoked_at) return false;

  const now = Date.now();
  if (grant.expires_at && Date.parse(grant.expires_at) <= now) return false;

  if (grant.max_views !== null) {
    if (mode === "new-session" && grant.view_count >= grant.max_views) return false;
    if (
      mode === "existing-session" &&
      (typeof viewSequence !== "number" || viewSequence > grant.max_views)
    ) {
      return false;
    }
  }

  return true;
}

export function findGrantByToken(
  page: AccessPageDocument,
  rawToken: string,
): AccessGrant | null {
  if (!rawToken || rawToken.length > 512) return null;
  return (
    page.settings.grants.find((grant) =>
      verifyAccessToken(rawToken, grant.token_hash),
    ) || null
  );
}

export function findGrantById(
  page: AccessPageDocument,
  grantId: string,
): AccessGrant | null {
  return page.settings.grants.find((grant) => grant.id === grantId) || null;
}

function cookieExpiryForGrant(grant: AccessGrant, lifetimeSeconds: number): number {
  const now = Math.floor(Date.now() / 1000);
  const lifetimeExpiry = now + lifetimeSeconds;
  if (!grant.expires_at) return lifetimeExpiry;
  return Math.min(lifetimeExpiry, Math.floor(Date.parse(grant.expires_at) / 1000));
}

export function createChallengeValue(
  page: AccessPageDocument,
  grant: AccessGrant,
): { value: string; maxAge: number } {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = cookieExpiryForGrant(grant, ACCESS_CHALLENGE_SECONDS);
  const claims: AccessChallengeClaims = {
    kind: "challenge",
    page_id: page.id,
    grant_id: grant.id,
    slug: page.slug,
    issued_at: now,
    expires_at: expiresAt,
    grant_fingerprint: accessGrantFingerprint(grant),
  };
  return { value: signAccessClaims(claims), maxAge: Math.max(1, expiresAt - now) };
}

export function createSessionValue(
  page: AccessPageDocument,
  grant: AccessGrant,
  viewSequence: number,
): { value: string; maxAge: number } {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = cookieExpiryForGrant(grant, ACCESS_SESSION_SECONDS);
  const claims: AccessSessionClaims = {
    kind: "access",
    page_id: page.id,
    grant_id: grant.id,
    slug: page.slug,
    issued_at: now,
    expires_at: expiresAt,
    grant_fingerprint: accessGrantFingerprint(grant),
    view_sequence: viewSequence,
  };
  return { value: signAccessClaims(claims), maxAge: Math.max(1, expiresAt - now) };
}

export function validateChallenge(
  page: AccessPageDocument,
  cookieValue: string | undefined,
): { claims: AccessChallengeClaims; grant: AccessGrant } | null {
  const claims = verifyAccessClaims<AccessChallengeClaims>(cookieValue, "challenge");
  if (!claims || claims.page_id !== page.id || claims.slug !== page.slug) return null;
  const grant = findGrantById(page, claims.grant_id);
  if (
    !grant ||
    claims.grant_fingerprint !== accessGrantFingerprint(grant) ||
    !grant.password_hash ||
    !isAccessGrantUsable(page, grant, "new-session")
  ) {
    return null;
  }
  return { claims, grant };
}

export function validateSession(
  page: AccessPageDocument,
  cookieValue: string | undefined,
): { claims: AccessSessionClaims; grant: AccessGrant } | null {
  const claims = verifyAccessClaims<AccessSessionClaims>(cookieValue, "access");
  if (!claims || claims.page_id !== page.id || claims.slug !== page.slug) return null;
  const grant = findGrantById(page, claims.grant_id);
  if (
    !grant ||
    claims.grant_fingerprint !== accessGrantFingerprint(grant) ||
    !isAccessGrantUsable(page, grant, "existing-session", claims.view_sequence)
  ) {
    return null;
  }
  return { claims, grant };
}

/**
 * Increment a JSON-embedded grant counter with optimistic concurrency control.
 * The page_sections.updated_at comparison prevents us from overwriting a
 * concurrent admin edit or another view. A normalized grant and its assigned
 * view sequence are returned only after the compare-and-swap succeeds.
 */
export async function recordAccessGrantView(
  pageId: string,
  grantId: string,
): Promise<{ grant: AccessGrant; viewSequence: number } | null> {
  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: row, error: readError } = await supabase
      .from("page_sections")
      .select("id, content, updated_at")
      .eq("page_id", pageId)
      .eq("section_key", ACCESS_SETTINGS_SECTION_KEY)
      .maybeSingle();
    if (readError || !row) return null;

    const rawContent = asObject(row.content);
    const settings = normalizeAccessSettings(rawContent);
    if (!rawContent || !settings || settings.status !== "active") return null;

    const grantIndex = settings.grants.findIndex((grant) => grant.id === grantId);
    const grant = settings.grants[grantIndex];
    if (!grant || !isAccessGrantUsable(
      { id: pageId, slug: "", title: "", settings, sections: [] },
      grant,
      "new-session",
    )) {
      return null;
    }

    const rawGrants = Array.isArray(rawContent.grants) ? [...rawContent.grants] : [];
    const rawGrantIndex = rawGrants.findIndex(
      (candidate) => asString(asObject(candidate)?.id) === grantId,
    );
    if (rawGrantIndex < 0) return null;

    const nextCount = grant.view_count + 1;
    rawGrants[rawGrantIndex] = {
      ...(asObject(rawGrants[rawGrantIndex]) || {}),
      view_count: nextCount,
      last_viewed_at: new Date().toISOString(),
    };
    const nextContent = { ...rawContent, grants: rawGrants };
    const previousUpdatedAt = row.updated_at ? Date.parse(row.updated_at) : 0;
    const nextUpdatedAt = new Date(
      Math.max(Date.now(), Number.isNaN(previousUpdatedAt) ? 0 : previousUpdatedAt + 1),
    ).toISOString();

    let update = supabase
      .from("page_sections")
      .update({ content: nextContent, updated_at: nextUpdatedAt })
      .eq("id", row.id);
    update = row.updated_at
      ? update.eq("updated_at", row.updated_at)
      : update.is("updated_at", null);

    const { data: updated, error: updateError } = await update
      .select("id")
      .maybeSingle();
    if (updateError) return null;
    if (updated) {
      return {
        grant: {
          ...grant,
          view_count: nextCount,
          last_viewed_at: nextUpdatedAt,
        },
        viewSequence: nextCount,
      };
    }
  }

  return null;
}

export const accessCookieOptions = (slug: string, maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: `/access/${slug}`,
  maxAge,
});
