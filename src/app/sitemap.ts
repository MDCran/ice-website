import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, page_type, updated_at")
    .eq("is_published", true)
    .neq("slug", "site-settings");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icesales.com";
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages ?? []) {
    let url = baseUrl;
    if (page.slug === "home") url = baseUrl;
    else if (page.page_type === "solution") url = `${baseUrl}/solutions/${page.slug}`;
    else url = `${baseUrl}/${page.slug}`;

    entries.push({
      url,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: page.page_type === "solution" ? "monthly" : "weekly",
      priority: page.slug === "home" ? 1.0 : page.page_type === "solution" ? 0.8 : 0.7,
    });
  }

  return entries;
}
