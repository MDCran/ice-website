/**
 * Public route mapping for CMS records whose database slug does not match the
 * URL one-for-one. Keep this in one place so preview, search, sitemap, and
 * cache invalidation all point at the same page.
 */
const PUBLIC_PATH_OVERRIDES: Record<string, string> = {
  home: "/",
  "site-settings": "/",
  "solution-finder": "/solutions/find",
};

export const SYSTEM_CMS_SLUGS = new Set([
  "home",
  "solutions",
  "partners",
  "why-ice",
  "contact",
  "terms-of-service",
  "sms-consent",
  "site-settings",
  "faq",
  "resources",
  "for-ai",
  "search",
  "subscribe",
  "solution-finder",
]);

export function publicPathForCmsPage(
  slug: string,
  pageType?: string | null,
): string {
  const cleanSlug = slug.trim();
  const override = PUBLIC_PATH_OVERRIDES[cleanSlug];
  if (override) return override;
  if (pageType === "solution") return `/solutions/${cleanSlug}`;
  return `/${cleanSlug}`;
}
