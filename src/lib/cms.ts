import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchPublishedPage } from "@/lib/cms/fetchPage";
import { publicPathForCmsPage } from "@/lib/cms/pageRegistry";

export type CMSJsonValue = ReturnType<typeof JSON.parse>;

function pointsToRetiredEnterprisePage(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    /^\/enterprise(?:[/?#]|$)/i.test(normalized) ||
    /^https?:\/\/(?:www\.)?icesales\.com\/enterprise(?:[/?#]|$)/i.test(
      normalized,
    )
  );
}

export interface PageSection {
  id: string;
  section_key: string;
  section_type: string;
  content: Record<string, CMSJsonValue>;
  sort_order: number;
  is_visible: boolean;
}

export interface PageData {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  page_type: string;
  is_published: boolean;
  updated_at: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
  twitter_image_url?: string | null;
  favicon_url?: string | null;
}

export interface PageWithSections extends PageData {
  sections: Record<string, CMSJsonValue>;
  orderedSections: PageSection[];
}

export const SITE_SETTINGS_VISIBILITY_KEY = "__cmsSectionVisibility";

export type SiteSettings = Record<string, CMSJsonValue> & {
  [SITE_SETTINGS_VISIBILITY_KEY]: Record<string, boolean>;
};

/**
 * Missing legacy rows keep their historical fallback behavior. Once a row
 * exists, its visibility toggle is authoritative even though hidden content
 * is intentionally omitted from the public payload.
 */
export function isSiteSettingVisible(
  settings: Record<string, CMSJsonValue> | null | undefined,
  sectionKey: string,
): boolean {
  const visibility = settings?.[SITE_SETTINGS_VISIBILITY_KEY];
  if (!visibility || typeof visibility !== "object" || Array.isArray(visibility)) return true;
  return (visibility as Record<string, unknown>)[sectionKey] !== false;
}

export function hasSiteSetting(
  settings: Record<string, CMSJsonValue> | null | undefined,
  sectionKey: string,
): boolean {
  const visibility = settings?.[SITE_SETTINGS_VISIBILITY_KEY];
  return Boolean(
    visibility &&
      typeof visibility === "object" &&
      !Array.isArray(visibility) &&
      Object.prototype.hasOwnProperty.call(visibility, sectionKey),
  );
}

export interface NavigationItem {
  id: string;
  parent_id: string | null;
  location: string;
  label: string;
  href: string;
  is_visible: boolean;
  sort_order: number;
  has_mega_menu?: boolean | null;
  mega_column_title?: string | null;
  mega_column_icon?: string | null;
}

/**
 * Fetch a page and all its visible sections by slug.
 * Returns sections both as a keyed map (for easy access) and ordered array.
 *
 * Uses the cookie-less anon client so published CMS content is always readable
 * on the public site, even when an admin session cookie is present.
 *
 * Always dynamic: `connection()` opts the caller out of static rendering so
 * CMS edits appear without a redeploy. Prefer `getCachedPageContent` (#31)
 * on high-traffic routes that can invalidate via `/api/admin/revalidate`.
 *
 * Scheduling: admin save promotes due `scheduled_publish_at` to `is_published`
 * (see CMSPageEditor + `supabase/migrations/20260729_cms_publish_schedule.sql`).
 */
export async function getPageContent(slug: string): Promise<PageWithSections | null> {
  try {
    await connection();
    return fetchPublishedPage(slug);
  } catch {
    return null;
  }
}

/**
 * Fetch navigation items grouped by location.
 */
export async function getNavigation(): Promise<NavigationItem[]> {
  try {
    const supabase = createPublicClient();
    const [{ data: items }, { data: publishedSolutions, error: solutionError }] = await Promise.all([
      supabase.from("navigation_items").select("*").order("sort_order"),
      supabase
        .from("pages")
        .select("slug")
        .eq("page_type", "solution")
        .eq("is_published", true),
    ]);
    const publishedSlugs = solutionError
      ? null
      : new Set((publishedSolutions ?? []).map((page) => page.slug));

    return ((items || []) as NavigationItem[]).filter((item) => {
      if (pointsToRetiredEnterprisePage(item.href)) return false;
      if (!publishedSlugs) return true;
      const match = item.href.trim().match(/^\/solutions\/([^/?#]+)/i);
      if (!match || match[1] === "find") return true;
      return publishedSlugs.has(decodeURIComponent(match[1]));
    });
  } catch {
    return [];
  }
}

/**
 * Fetch site-wide settings (footer info, etc.) from a special "site-settings" page.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await getPageContent("site-settings");
  const visibility = Object.fromEntries(
    (result?.orderedSections ?? []).map((section) => [
      section.section_key,
      section.is_visible !== false,
    ]),
  );
  return {
    ...(result?.sections ?? {}),
    [SITE_SETTINGS_VISIBILITY_KEY]: visibility,
  };
}

/**
 * Build a search index from all published pages for the search modal.
 */
export async function getSearchIndex(): Promise<
  { title: string; description: string; url: string; category: string; keywords?: string[] }[]
> {
  try {
    const supabase = createPublicClient();
    const { data: pages } = await supabase
      .from("pages")
      .select("id, slug, title, meta_description, page_type")
      .eq("is_published", true)
      .neq("slug", "site-settings")
      .neq("slug", "enterprise")
      .neq("page_type", "settings");

    if (!pages || pages.length === 0) return [];

    const solutionPageIds = pages
      .filter((page) => page.page_type === "solution")
      .map((page) => page.id)
      .filter(Boolean);
    const profileByPageId = new Map<string, Record<string, unknown>>();
    if (solutionPageIds.length > 0) {
      const { data: profiles } = await supabase
        .from("page_sections")
        .select("page_id, content")
        .in("page_id", solutionPageIds)
        .eq("section_key", "service_profile")
        .eq("is_visible", true);
      for (const profile of profiles ?? []) {
        if (
          profile.content
          && typeof profile.content === "object"
          && !Array.isArray(profile.content)
        ) {
          profileByPageId.set(profile.page_id, profile.content as Record<string, unknown>);
        }
      }
    }

    return pages.flatMap((p) => {
      const url = publicPathForCmsPage(p.slug, p.page_type);

      const category =
        p.page_type === "solution" ? "Solutions" : p.page_type === "legal" ? "Legal" : "Pages";

      const profile = profileByPageId.get(p.id);
      if (
        p.page_type === "solution"
        && (!profile || profile.listed === false)
      ) {
        return [];
      }
      const keywords = profile
        ? [profile.tags, profile.industries, profile.platforms, profile.workloads]
            .flatMap((value) => Array.isArray(value) ? value : [])
            .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
        : [];

      return [{
        title: p.title,
        description: p.meta_description ?? "",
        url,
        category,
        ...(keywords.length > 0 ? { keywords } : {}),
      }];
    });
  } catch {
    return [];
  }
}
