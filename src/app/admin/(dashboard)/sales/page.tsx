import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/admin/permissions";
import { writeAuditLog } from "@/lib/auditLog";
import {
  DEFAULT_SALES_ENABLEMENT,
  resolveSalesEnablement,
  type SalesEnablementConfig,
} from "@/lib/salesEnablement";
import SalesEnablementEditor from "./SalesEnablementEditor";

const SETTINGS_SLUG = "site-settings";
const SECTION_KEY = "sales_enablement";

export default async function SalesEnablementAdminPage() {
  const supabase = await createClient();

  const { data: settingsPage } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", SETTINGS_SLUG)
    .maybeSingle();

  const { data: section } = settingsPage?.id
    ? await supabase
        .from("page_sections")
        .select("id, content, updated_at")
        .eq("page_id", settingsPage.id)
        .eq("section_key", SECTION_KEY)
        .maybeSingle()
    : { data: null };

  const initialConfig = section?.content
    ? resolveSalesEnablement(section.content)
    : DEFAULT_SALES_ENABLEMENT;

  async function saveSalesEnablement(config: SalesEnablementConfig) {
    "use server";

    const serverSupabase = await createClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return { ok: false as const, error: "Your session has expired. Sign in and try again." };
    }

    const { data: profile } = await serverSupabase
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !can(profile.role, "cms.edit")) {
      return { ok: false as const, error: "You do not have permission to edit CMS content." };
    }

    let pageId: string | null = null;
    const { data: currentPage, error: pageLookupError } = await serverSupabase
      .from("pages")
      .select("id, is_published")
      .eq("slug", SETTINGS_SLUG)
      .maybeSingle();

    if (pageLookupError) {
      return { ok: false as const, error: pageLookupError.message };
    }

    if (currentPage?.id) {
      pageId = currentPage.id;
      if (currentPage.is_published !== true) {
        const { error: publishSettingsError } = await serverSupabase
          .from("pages")
          .update({ is_published: true })
          .eq("id", pageId);

        if (publishSettingsError) {
          return { ok: false as const, error: publishSettingsError.message };
        }
      }
    } else {
      const { data: createdPage, error: createPageError } = await serverSupabase
        .from("pages")
        .insert({
          slug: SETTINGS_SLUG,
          title: "Site Settings",
          page_type: "settings",
          is_published: true,
        })
        .select("id")
        .single();

      if (createPageError) {
        return { ok: false as const, error: createPageError.message };
      }
      pageId = createdPage.id;
    }

    const normalized = resolveSalesEnablement(config);
    const { data: currentSection, error: sectionLookupError } = await serverSupabase
      .from("page_sections")
      .select("id")
      .eq("page_id", pageId)
      .eq("section_key", SECTION_KEY)
      .maybeSingle();

    if (sectionLookupError) {
      return { ok: false as const, error: sectionLookupError.message };
    }

    let sectionId = currentSection?.id ?? null;
    if (sectionId) {
      const { error } = await serverSupabase
        .from("page_sections")
        .update({
          content: normalized,
          updated_at: new Date().toISOString(),
          is_visible: true,
        })
        .eq("id", sectionId);

      if (error) return { ok: false as const, error: error.message };
    } else {
      const { data: inserted, error } = await serverSupabase
        .from("page_sections")
        .insert({
          page_id: pageId,
          section_key: SECTION_KEY,
          section_type: "custom",
          content: normalized,
          sort_order: 998,
          is_visible: true,
        })
        .select("id")
        .single();

      if (error) return { ok: false as const, error: error.message };
      sectionId = inserted.id;
    }

    await writeAuditLog(serverSupabase, {
      action: "sales.enablement_saved",
      entityType: "page_section",
      entityId: sectionId,
      summary: "Updated sales enablement configuration",
      metadata: {
        pageSlug: SETTINGS_SLUG,
        sectionKey: SECTION_KEY,
        enabled: normalized.enabled,
        enabledModules: Object.values(normalized.modules).filter(Boolean).length,
      },
    });

    revalidateTag("cms-pages", "max");
    revalidateTag(`cms-page:${SETTINGS_SLUG}`, "max");
    revalidatePath("/site-settings");
    revalidatePath("/admin/sales");
    revalidatePath("/");

    return {
      ok: true as const,
      sectionId,
      savedAt: new Date().toISOString(),
    };
  }

  return (
    <SalesEnablementEditor
      initialConfig={initialConfig}
      initialSectionId={section?.id ?? null}
      initialUpdatedAt={section?.updated_at ?? null}
      onSave={saveSalesEnablement}
    />
  );
}
