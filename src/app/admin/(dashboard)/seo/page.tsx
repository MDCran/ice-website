import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SEO_CONFIG } from "@/lib/seo/config";
import SeoSettingsClient, { type SeoFormValues } from "./SeoSettingsClient";

/**
 * SEO & Analytics admin panel.
 *
 * Loads the current `seo` section from the special `site-settings` CMS page and
 * hands it to the client editor. The client writes the collected object back to
 * a `page_sections` row (section_key "seo") which `getSeoConfig()` reads.
 *
 * We query the `site-settings` page directly (no `is_published` filter) so the
 * panel works even before the settings page is published.
 */
export default async function SeoAdminPage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "site-settings")
    .maybeSingle();

  let seoContent: Record<string, any> = {};
  let seoSectionId: string | null = null;

  if (page?.id) {
    const { data: section } = await supabase
      .from("page_sections")
      .select("id, content")
      .eq("page_id", page.id)
      .eq("section_key", "seo")
      .maybeSingle();
    if (section) {
      seoSectionId = section.id;
      seoContent = (section.content as Record<string, any>) ?? {};
    }
  }

  const initialValues = toFormValues(seoContent);

  return (
    <SeoSettingsClient
      pageId={page?.id ?? null}
      sectionId={seoSectionId}
      initialValues={initialValues}
    />
  );
}

/**
 * Map a stored `seo` section (snake_case, matching getSeoConfig readers) into the
 * flat form shape. Falls back to DEFAULT_SEO_CONFIG so every field starts filled.
 */
function toFormValues(seo: Record<string, any>): SeoFormValues {
  const d = DEFAULT_SEO_CONFIG;
  const org = (seo.organization as Record<string, any>) ?? {};

  const pick = (v: unknown, fallback: string): string =>
    typeof v === "string" && v.trim() ? v : fallback;
  const pickNullable = (v: unknown, fallback: string | null): string =>
    typeof v === "string" ? v : (fallback ?? "");
  const pickNum = (v: unknown, fallback: number): string => {
    if (typeof v === "number") return String(v);
    if (typeof v === "string" && v.trim()) return v;
    return String(fallback);
  };
  const pickArr = (v: unknown, fallback: string[]): string[] => {
    if (Array.isArray(v)) return v.filter((s) => typeof s === "string");
    return fallback;
  };

  return {
    site_name: pick(seo.site_name, d.siteName),
    default_title: pick(seo.default_title, d.defaultTitle),
    title_template: pick(seo.title_template, d.titleTemplate),
    default_description: pick(seo.default_description, d.defaultDescription),
    keywords: pickArr(seo.keywords, d.keywords).join(", "),

    legal_name: pick(org.legal_name, d.organization.legalName),
    founding_date: pick(org.founding_date, d.organization.foundingDate),
    telephone: pick(org.telephone, d.organization.telephone),
    email: pick(org.email, d.organization.email),
    street_address: pick(org.street_address, d.organization.streetAddress),
    address_locality: pick(org.address_locality, d.organization.addressLocality),
    address_region: pick(org.address_region, d.organization.addressRegion),
    postal_code: pick(org.postal_code, d.organization.postalCode),
    address_country: pick(org.address_country, d.organization.addressCountry),
    latitude: pickNum(org.latitude, d.organization.latitude),
    longitude: pickNum(org.longitude, d.organization.longitude),
    hours_text: pick(org.hours_text, d.organization.hoursText),
    opens: pick(org.opens, d.organization.opens),
    closes: pick(org.closes, d.organization.closes),
    days: pickArr(org.days, d.organization.days),

    social: pickArr(seo.social, d.social),

    gtm_id: pickNullable(seo.gtm_id, d.analytics.gtmId),
    ga4_id: pickNullable(seo.ga4_id, d.analytics.ga4Id),

    google_verification: pickNullable(seo.google_verification, d.verification.google),
    bing_verification: pickNullable(seo.bing_verification, d.verification.bing),

    block_training_scrapers:
      typeof seo.block_training_scrapers === "boolean"
        ? seo.block_training_scrapers
        : d.blockTrainingScrapers,
  };
}
