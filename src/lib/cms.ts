import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchPublishedPage } from "@/lib/cms/fetchPage";

export interface PageSection {
  id: string;
  section_key: string;
  section_type: string;
  content: Record<string, any>;
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
  sections: Record<string, any>;
  orderedSections: PageSection[];
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
export async function getNavigation() {
  try {
    const supabase = createPublicClient();
    const { data: items } = await supabase
      .from("navigation_items")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order");
    return items || [];
  } catch {
    return [];
  }
}

/**
 * Fetch site-wide settings (footer info, etc.) from a special "site-settings" page.
 */
export async function getSiteSettings(): Promise<Record<string, any>> {
  const result = await getPageContent("site-settings");
  return result?.sections ?? {};
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
      .select("slug, title, meta_description, page_type")
      .eq("is_published", true)
      .neq("slug", "site-settings")
      .neq("page_type", "settings");

    if (!pages || pages.length === 0) return [];

    return pages.map((p) => {
      let url = "/";
      if (p.slug === "home") url = "/";
      else if (p.page_type === "solution") url = `/solutions/${p.slug}`;
      else url = `/${p.slug}`;

      const category =
        p.page_type === "solution" ? "Solutions" : p.page_type === "legal" ? "Legal" : "Pages";

      return {
        title: p.title,
        description: p.meta_description ?? "",
        url,
        category,
      };
    });
  } catch {
    return [];
  }
}
