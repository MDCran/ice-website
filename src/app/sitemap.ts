import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SEO_CONFIG } from "@/lib/seo/config";
import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SEO_CONFIG.siteUrl;

/** Static pages get a per-slug priority; anything unlisted falls back to 0.6. */
const STATIC_PRIORITY: Record<string, number> = {
  home: 1.0,
  solutions: 0.9,
  "why-ice": 0.6,
  partners: 0.6,
  contact: 0.6,
};

function urlForPage(slug: string, pageType: string | null): string {
  if (slug === "home") return baseUrl;
  if (pageType === "solution") return `${baseUrl}/solutions/${slug}`;
  return `${baseUrl}/${slug}`;
}

function changeFrequencyFor(
  pageType: string | null,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (pageType === "solution") return "weekly";
  if (pageType === "legal") return "yearly";
  return "monthly";
}

function priorityFor(slug: string, pageType: string | null): number {
  if (pageType === "solution") return 0.8;
  if (pageType === "legal") return 0.3;
  return STATIC_PRIORITY[slug] ?? 0.6;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, page_type, updated_at")
    .eq("is_published", true)
    .neq("slug", "site-settings");

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages ?? []) {
    entries.push({
      url: urlForPage(page.slug, page.page_type),
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: changeFrequencyFor(page.page_type),
      priority: priorityFor(page.slug, page.page_type),
    });
  }

  return entries;
}
