import { createClient } from "@/lib/supabase/server";

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
}

export interface PageWithSections extends PageData {
  sections: Record<string, any>;
  orderedSections: PageSection[];
}

/**
 * Fetch a page and all its visible sections by slug.
 * Returns sections both as a keyed map (for easy access) and ordered array.
 */
export async function getPageContent(slug: string): Promise<PageWithSections | null> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*, page_sections(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!page) return null;

  const visibleSections = (page.page_sections || [])
    .filter((s: any) => s.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const sections: Record<string, any> = {};
  for (const section of visibleSections) {
    sections[section.section_key] = section.content;
  }

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    page_type: page.page_type,
    is_published: page.is_published,
    updated_at: page.updated_at,
    sections,
    orderedSections: visibleSections,
  };
}

/**
 * Fetch navigation items grouped by location.
 */
export async function getNavigation() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order");
  return items || [];
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
export async function getSearchIndex(): Promise<{ title: string; description: string; url: string; category: string; keywords?: string[] }[]> {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, title, meta_description, page_type")
    .eq("is_published", true)
    .neq("slug", "site-settings");

  if (!pages || pages.length === 0) return [];

  return pages.map((p) => {
    let url = "/";
    if (p.slug === "home") url = "/";
    else if (p.page_type === "solution") url = `/solutions/${p.slug}`;
    else url = `/${p.slug}`;

    const category = p.page_type === "solution"
      ? "Solutions"
      : p.page_type === "legal"
        ? "Legal"
        : "Pages";

    return {
      title: p.title,
      description: p.meta_description ?? "",
      url,
      category,
    };
  });
}
