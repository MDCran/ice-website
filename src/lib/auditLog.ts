import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "cms.page_saved"
  | "cms.page_created"
  | "cms.page_cloned"
  | "cms.page_deleted"
  | "cms.page_exported"
  | "client.created"
  | "client.provisioned"
  | "survey.saved"
  | "survey.sent";

/**
 * Best-effort admin activity log (#44). No-ops if the table is missing.
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: {
    action: AuditAction | string;
    entityType: string;
    entityId?: string | null;
    summary?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("admin_audit_log").insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary ?? null,
      metadata: entry.metadata ?? {},
    });

    if (error && !/admin_audit_log|schema cache|does not exist/i.test(error.message)) {
      console.error("[auditLog]", error.message);
    }
  } catch (err) {
    console.error("[auditLog]", err);
  }
}
