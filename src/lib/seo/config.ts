import { getSiteSettings } from "@/lib/cms";

/**
 * Site-wide SEO / AEO / GEO configuration.
 *
 * Resolution order for each value: admin-edited CMS `site-settings` → environment
 * variable → hardcoded default. This lets the SEO admin panel override anything
 * without a deploy, while env vars keep secrets out of the database if preferred.
 *
 * The CMS source is the `site-settings` page, section_key `seo` (a JSONB blob
 * shaped like the `SeoConfig` fields below). The admin SEO panel writes it.
 */
export interface SeoOrganization {
  legalName: string;
  foundingDate: string;
  telephone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  latitude: number;
  longitude: number;
  /** Human-readable opening hours line, e.g. "Mon – Fri, 9:00 AM – 5:00 PM ET". */
  hoursText: string;
  /** Structured opening hours for schema.org openingHoursSpecification. */
  opens: string; // "09:00"
  closes: string; // "17:00"
  days: string[]; // ["Monday", ... "Friday"]
}

export interface SeoConfig {
  siteUrl: string;
  siteName: string;
  defaultTitle: string;
  titleTemplate: string; // "%s | International Computer Exchange"
  defaultDescription: string;
  keywords: string[];
  organization: SeoOrganization;
  /** URLs for schema.org `sameAs` (social/professional profiles). */
  social: string[];
  analytics: {
    gtmId: string | null;
    ga4Id: string | null;
  };
  verification: {
    google: string | null;
    bing: string | null;
  };
  /** When true, robots.ts blocks AI model-training scrapers (keeps live-retrieval search bots). */
  blockTrainingScrapers: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icesales.com";

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteUrl: SITE_URL,
  siteName: "International Computer Exchange",
  defaultTitle:
    "International Computer Exchange — Enterprise Cloud, Security & IBM Managed Services",
  titleTemplate: "%s | International Computer Exchange",
  defaultDescription:
    "IBM Business Partner since 1990. ICE delivers managed cloud hosting, disaster recovery, backup, IBM i security, and enterprise managed services from SOC 2 Type II certified data centers.",
  keywords: [
    "IBM Business Partner",
    "IBM Power Systems",
    "IBM i hosting",
    "managed cloud hosting",
    "disaster recovery as a service",
    "backup as a service",
    "ransomware recovery",
    "IBM i security",
    "managed security services",
    "enterprise IT services",
    "International Computer Exchange",
  ],
  organization: {
    legalName: "International Computer Exchange",
    foundingDate: "1990",
    telephone: "+1-800-786-9188",
    email: "info@icesales.com",
    streetAddress: "1279 W Palmetto Park Rd #272415",
    addressLocality: "Boca Raton",
    addressRegion: "FL",
    postalCode: "33427",
    addressCountry: "US",
    latitude: 26.3501,
    longitude: -80.1298,
    hoursText: "Mon – Fri, 9:00 AM – 5:00 PM ET",
    opens: "09:00",
    closes: "17:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  social: [],
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? null,
    ga4Id: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? null,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? null,
    bing: process.env.BING_SITE_VERIFICATION ?? null,
  },
  blockTrainingScrapers: true,
};

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
function strOrNull(v: unknown, fallback: string | null): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}
function num(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}
function arr(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) return v.filter((s) => typeof s === "string" && s.trim());
  return fallback;
}

/**
 * Merge admin-edited `site-settings.seo` over env/defaults. Never throws — always
 * returns a complete, valid config so metadata/JSON-LD never break on bad data.
 */
export async function getSeoConfig(): Promise<SeoConfig> {
  const d = DEFAULT_SEO_CONFIG;
  let seo: Record<string, any> = {};
  let org: Record<string, any> = {};
  try {
    const settings = await getSiteSettings();
    seo = (settings?.seo as Record<string, any>) ?? {};
    // Organization contact can also live in the existing company_info section.
    org = (seo.organization as Record<string, any>) ?? (settings?.company_info as Record<string, any>) ?? {};
  } catch {
    // DB unavailable — fall back to defaults.
  }

  return {
    siteUrl: d.siteUrl,
    siteName: str(seo.site_name ?? seo.siteName, d.siteName),
    defaultTitle: str(seo.default_title ?? seo.defaultTitle, d.defaultTitle),
    titleTemplate: str(seo.title_template ?? seo.titleTemplate, d.titleTemplate),
    defaultDescription: str(seo.default_description ?? seo.defaultDescription, d.defaultDescription),
    keywords: arr(seo.keywords, d.keywords),
    organization: {
      legalName: str(org.legal_name ?? org.legalName ?? org.name, d.organization.legalName),
      foundingDate: str(org.founding_date ?? org.foundingDate, d.organization.foundingDate),
      telephone: str(org.telephone ?? org.phone, d.organization.telephone),
      email: str(org.email, d.organization.email),
      streetAddress: str(org.street_address ?? org.streetAddress ?? org.address, d.organization.streetAddress),
      addressLocality: str(org.address_locality ?? org.addressLocality ?? org.city, d.organization.addressLocality),
      addressRegion: str(org.address_region ?? org.addressRegion ?? org.state, d.organization.addressRegion),
      postalCode: str(org.postal_code ?? org.postalCode ?? org.zip, d.organization.postalCode),
      addressCountry: str(org.address_country ?? org.addressCountry ?? org.country, d.organization.addressCountry),
      latitude: num(org.latitude ?? org.lat, d.organization.latitude),
      longitude: num(org.longitude ?? org.lng ?? org.lon, d.organization.longitude),
      hoursText: str(org.hours_text ?? org.hoursText ?? org.hours, d.organization.hoursText),
      opens: str(org.opens, d.organization.opens),
      closes: str(org.closes, d.organization.closes),
      days: arr(org.days, d.organization.days),
    },
    social: arr(seo.social ?? seo.sameAs ?? org.social, d.social),
    analytics: {
      gtmId: strOrNull(seo.gtm_id ?? seo.gtmId, d.analytics.gtmId),
      ga4Id: strOrNull(seo.ga4_id ?? seo.ga4Id ?? seo.ga_measurement_id, d.analytics.ga4Id),
    },
    verification: {
      google: strOrNull(seo.google_verification ?? seo.googleVerification, d.verification.google),
      bing: strOrNull(seo.bing_verification ?? seo.bingVerification, d.verification.bing),
    },
    blockTrainingScrapers:
      typeof seo.block_training_scrapers === "boolean"
        ? seo.block_training_scrapers
        : typeof seo.blockTrainingScrapers === "boolean"
          ? seo.blockTrainingScrapers
          : d.blockTrainingScrapers,
  };
}
