import "server-only";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function asNullablePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

/**
 * Browser-safe view of an access grant. Credential digests stay on the server;
 * the UI receives only the fact that an optional password exists.
 */
export function accessGrantForAdmin(value: unknown) {
  const grant = asRecord(value);
  return {
    id: asString(grant.id),
    label: asString(grant.label),
    recipient_hint: asString(grant.recipient_hint),
    token_prefix: asString(grant.token_prefix),
    has_password: Boolean(asString(grant.password_hash)),
    expires_at: asNullableString(grant.expires_at),
    revoked_at: asNullableString(grant.revoked_at),
    max_views: asNullablePositiveInteger(grant.max_views),
    view_count:
      typeof grant.view_count === "number" &&
      Number.isSafeInteger(grant.view_count) &&
      grant.view_count >= 0
        ? grant.view_count
        : 0,
    last_viewed_at: asNullableString(grant.last_viewed_at),
    created_at: asString(grant.created_at),
  };
}

/** Explicit allowlist for access settings crossing a server/client boundary. */
export function accessSettingsForAdmin(value: unknown) {
  const settings = asRecord(value);
  const status = asString(settings.status);
  const safeStatus: "draft" | "active" | "archived" =
    status === "active" || status === "archived" ? status : "draft";
  return {
    schema_version:
      typeof settings.schema_version === "number" ? settings.schema_version : 1,
    status: safeStatus,
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
      ? settings.grants.slice(0, 100).map(accessGrantForAdmin)
      : [],
  };
}
