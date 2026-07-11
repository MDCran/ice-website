import type { Metadata } from "next";
import type { PageData } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";

/** Trim to <=155 chars at a word boundary. */
export function clampDescription(value: string, max = 155): string {
  const v = value.trim();
  if (v.length <= max) return v;
  const slice = v.slice(0, max - 1);
  const cut = slice.slice(0, slice.lastIndexOf(" "));
  return `${(cut || slice).trimEnd()}…`;
}

/**
 * Build App Router Metadata from CMS page fields + site SEO defaults.
 * Includes per-page OG/Twitter images, canonical, and favicon override.
 */
export async function buildPageMetadata(
  page: PageData | null | undefined,
  opts: {
    fallbackTitle: string;
    fallbackDescription?: string;
    defaultPath: string;
    absoluteTitle?: boolean;
  }
): Promise<Metadata> {
  const seo = await getSeoConfig();
  const title = page?.meta_title?.trim() || page?.title?.trim() || opts.fallbackTitle;
  const description = clampDescription(
    page?.meta_description?.trim() || opts.fallbackDescription || seo.defaultDescription
  );
  const canonical =
    page?.canonical_url?.trim() ||
    opts.defaultPath;

  const ogImage = page?.og_image_url?.trim() || seo.defaultOgImage || undefined;
  const twitterImage =
    page?.twitter_image_url?.trim() || page?.og_image_url?.trim() || seo.defaultOgImage || undefined;
  const favicon = page?.favicon_url?.trim() || seo.faviconUrl || undefined;

  const metadata: Metadata = {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical.startsWith("http") ? canonical : `${seo.siteUrl}${canonical.startsWith("/") ? "" : "/"}${canonical}`,
      siteName: seo.siteName,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  };

  if (favicon) {
    metadata.icons = {
      icon: [{ url: favicon }],
      shortcut: favicon,
      apple: favicon,
    };
  }

  return metadata;
}
