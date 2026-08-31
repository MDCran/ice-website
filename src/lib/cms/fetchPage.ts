import { createPublicClient } from "@/lib/supabase/public";
import type { PageSection, PageWithSections } from "@/lib/cms";

/**
 * Raw CMS page fetch (no caching / no connection()). Used by both the live
 * and tagged-cache entry points.
 */
export async function fetchPublishedPage(slug: string): Promise<PageWithSections | null> {
  try {
    const supabase = createPublicClient();
    const { data: page, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !page) return null;

    const { data: pageSections, error: sectionsError } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    if (sectionsError) return null;

    const contentSections = ((pageSections || []) as PageSection[])
      .filter((s) => s.section_key !== "page_seo" && s.section_type !== "seo")
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const visibleSections = contentSections.filter((s) => s.is_visible !== false);

    // Keep hidden rows in the ordered manifest so bespoke page renderers can
    // distinguish "the editor hid this section" from "legacy CMS data is
    // missing, use a fallback". Never send the hidden row's content to the
    // browser: only its key/type/order/visibility are exposed.
    const orderedSections = contentSections.map((section) =>
      section.is_visible === false ? { ...section, content: {} } : section,
    );

    const sections: Record<string, unknown> = {};
    for (const section of visibleSections) {
      sections[section.section_key] = section.content;
    }

    const pageRow = page as Record<string, unknown>;
    const seoSection = (pageSections || []).find(
      (s: { section_key?: string; section_type?: string }) =>
        s.section_key === "page_seo" || s.section_type === "seo",
    ) as { content?: Record<string, unknown> } | undefined;
    const seo = seoSection?.content ?? {};

    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      page_type: page.page_type,
      is_published: page.is_published,
      updated_at: page.updated_at,
      canonical_url:
        (typeof seo.canonical_url === "string" ? seo.canonical_url : null) ??
        (typeof pageRow.canonical_url === "string" ? pageRow.canonical_url : null),
      og_image_url:
        (typeof seo.og_image_url === "string" ? seo.og_image_url : null) ??
        (typeof pageRow.og_image_url === "string" ? pageRow.og_image_url : null),
      twitter_image_url:
        (typeof seo.twitter_image_url === "string" ? seo.twitter_image_url : null) ??
        (typeof pageRow.twitter_image_url === "string" ? pageRow.twitter_image_url : null),
      favicon_url:
        (typeof seo.favicon_url === "string" ? seo.favicon_url : null) ??
        (typeof pageRow.favicon_url === "string" ? pageRow.favicon_url : null),
      sections,
      orderedSections,
    };
  } catch {
    return null;
  }
}
