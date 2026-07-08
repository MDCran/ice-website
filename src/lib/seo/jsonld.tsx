import type { SeoConfig } from "@/lib/seo/config";

/**
 * JSON-LD structured data helpers for the ICE website.
 *
 * All builders TAKE a resolved `SeoConfig` (from `getSeoConfig()`) so the same
 * admin-editable source of truth drives metadata and schema. `@id` values are
 * kept consistent (`#organization`, `#website`) so nodes can reference each
 * other and search engines merge them into one entity graph.
 *
 * Render output with <JsonLd data={...} /> from a Server Component — it emits a
 * <script type="application/ld+json"> in the initial HTML.
 */

/** JSON-safe render of a structured-data object into a <script> tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so the payload can't break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** PostalAddress node built from the org config. */
function postalAddress(cfg: SeoConfig) {
  const o = cfg.organization;
  return {
    "@type": "PostalAddress",
    streetAddress: o.streetAddress,
    addressLocality: o.addressLocality,
    addressRegion: o.addressRegion,
    postalCode: o.postalCode,
    addressCountry: o.addressCountry,
  };
}

/**
 * Organization / ProfessionalService node — the canonical `#organization`
 * entity referenced by every other node's `provider` / `publisher`.
 */
export function organization(cfg: SeoConfig): Record<string, unknown> {
  const o = cfg.organization;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${cfg.siteUrl}/#organization`,
    name: cfg.siteName,
    legalName: o.legalName,
    url: cfg.siteUrl,
    logo: `${cfg.siteUrl}/images/logo/ice-logo.jpg`,
    telephone: o.telephone,
    email: o.email,
    foundingDate: o.foundingDate,
    areaServed: "US",
    address: postalAddress(cfg),
  };
  if (cfg.social.length > 0) node.sameAs = cfg.social;
  return node;
}

/** WebSite node linking back to the organization as publisher. */
export function webSite(cfg: SeoConfig): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${cfg.siteUrl}/#website`,
    url: cfg.siteUrl,
    name: cfg.siteName,
    publisher: { "@id": `${cfg.siteUrl}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Absolute or root-relative path; joined to siteUrl when relative. */
  url: string;
}

/** BreadcrumbList node. `items` are ordered root → current page. */
export function breadcrumbs(cfg: SeoConfig, items: BreadcrumbItem[]): Record<string, unknown> {
  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${cfg.siteUrl}${u.startsWith("/") ? u : `/${u}`}`);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

export interface ServiceInput {
  name: string;
  description: string;
  /** Absolute or root-relative URL of the service page. */
  url: string;
  serviceType?: string;
}

/** Service node provided by the organization. */
export function service(cfg: SeoConfig, input: ServiceInput): Record<string, unknown> {
  const abs = (u: string) =>
    /^https?:\/\//.test(u) ? u : `${cfg.siteUrl}${u.startsWith("/") ? u : `/${u}`}`;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: abs(input.url),
    provider: { "@id": `${cfg.siteUrl}/#organization` },
    areaServed: "US",
  };
  if (input.serviceType) node.serviceType = input.serviceType;
  return node;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage node built from question/answer pairs. */
export function faqPage(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * LocalBusiness node — organization fields plus geo coordinates and structured
 * opening hours. Used on the contact page.
 */
export function localBusiness(cfg: SeoConfig): Record<string, unknown> {
  const o = cfg.organization;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${cfg.siteUrl}/#organization`,
    name: cfg.siteName,
    legalName: o.legalName,
    url: cfg.siteUrl,
    logo: `${cfg.siteUrl}/images/logo/ice-logo.jpg`,
    image: `${cfg.siteUrl}/images/logo/ice-logo.jpg`,
    telephone: o.telephone,
    email: o.email,
    foundingDate: o.foundingDate,
    areaServed: "US",
    address: postalAddress(cfg),
    geo: {
      "@type": "GeoCoordinates",
      latitude: o.latitude,
      longitude: o.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    },
  };
  if (cfg.social.length > 0) node.sameAs = cfg.social;
  return node;
}
