import type { PageWithSections } from "@/lib/cms";
import { getCachedPageContent } from "@/lib/cms/cachedPage";
import { getSeoConfig } from "@/lib/seo/config";
import {
  JsonLd,
  breadcrumbs,
  service,
  faqPage,
  type FaqItem,
} from "@/lib/seo/jsonld";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DynamicSolutionPage from "./DynamicSolutionPage";
import {
  buildSolutionCatalogItem,
  getPublishedSolutionCatalog,
  relatedCatalogItemsForCms,
  type SolutionCatalogItem,
} from "@/lib/cms/solutionCatalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Strip HTML tags and collapse whitespace. */
function plain(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Trim to <=155 chars at a word boundary, appending an ellipsis when cut. */
function clampDescription(value: string, max = 155): string {
  if (value.length <= max) return value;
  const slice = value.slice(0, max - 1);
  const cut = slice.slice(0, slice.lastIndexOf(" "));
  return `${(cut || slice).trimEnd()}…`;
}

type PageLike = PageWithSections;

/** Human-readable service name for schema/metadata — prefer CMS page title. */
function serviceName(page: PageLike, profile?: SolutionCatalogItem): string {
  return (
    plain(profile?.title) ||
    plain(page.title) ||
    plain((page.sections?.hero as Record<string, unknown> | undefined)?.headline) ||
    "Managed IT Service"
  );
}

/** Service description from CMS content. */
function serviceDescription(
  page: PageLike,
  profile?: Pick<SolutionCatalogItem, "card_description">,
): string {
  const hero = page.sections?.hero as Record<string, unknown> | undefined;
  return (
    plain(page.meta_description) ||
    plain(profile?.card_description) ||
    plain(hero?.subheadline) ||
    plain(hero?.headline) ||
    ""
  );
}

/**
 * Tagged cache (#31) — invalidated on CMS save via /api/admin/revalidate.
 * Missing/unpublished pages 404 so incomplete fallback content cannot mask DB.
 */
async function resolvePage(slug: string): Promise<PageLike | null> {
  const page = await getCachedPageContent(slug);
  return page?.page_type === "solution" ? page : null;
}

function detailProfileForPage(page: PageLike): SolutionCatalogItem {
  return buildSolutionCatalogItem(
    {
      id: page.id,
      slug: page.slug,
      title: page.title,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      sort_order: 0,
      updated_at: page.updated_at,
    },
    page.sections?.service_profile,
    page.sections?.hero,
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, catalog] = await Promise.all([
    resolvePage(slug),
    getPublishedSolutionCatalog(),
  ]);
  if (!page) return {};
  const profile =
    catalog?.find((item) => item.slug === slug) ?? detailProfileForPage(page);

  const { buildPageMetadata } = await import("@/lib/seo/pageMetadata");
  const description = clampDescription(
    serviceDescription(page, profile) || serviceName(page, profile),
  );
  const rawTitle = (page.meta_title ?? page.title ?? "").trim();
  const cleanTitle = rawTitle
    .replace(/\s*[|\-–]\s*International Computer Exchange\s*$/i, "")
    .trim();

  const metadata = await buildPageMetadata(page, {
    fallbackTitle: cleanTitle || rawTitle || serviceName(page, profile),
    fallbackDescription: description,
    defaultPath: `/solutions/${slug}`,
  });

  if (profile.tags.length) metadata.keywords = profile.tags;

  return metadata;
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const [page, seo, catalog] = await Promise.all([
    resolvePage(slug),
    getSeoConfig(),
    getPublishedSolutionCatalog(),
  ]);

  if (!page) {
    notFound();
  }

  const profile =
    catalog?.find((item) => item.slug === slug) ?? detailProfileForPage(page);
  const relatedItems = catalog
    ? relatedCatalogItemsForCms(slug, catalog, 3)
    : [];
  const url = profile?.href || `/solutions/${slug}`;
  const name = serviceName(page, profile);

  const faqItems: FaqItem[] = (page.orderedSections ?? [])
    .filter((section) => section.section_type === "faq")
    .flatMap((section) => {
      const items: unknown = section.content?.items;
      return Array.isArray(items) ? (items as unknown[]) : [];
    })
    .flatMap((item): FaqItem[] => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const record = item as Record<string, unknown>;
      const question = plain(record.question);
      const answer = plain(record.answer);
      return question && answer ? [{ question, answer }] : [];
    });

  return (
    <>
      <JsonLd
        data={service(seo, {
          name,
          description: serviceDescription(page, profile) || name,
          url,
          serviceType: profile.schema.service_type || profile.category,
          alternateName: profile.schema.aliases,
          keywords: profile.tags,
          hasOfferCatalog: profile.schema.offer_names.length
            ? {
                "@type": "OfferCatalog",
                name: `${name} services`,
                itemListElement: profile.schema.offer_names.map((offerName) => ({
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: offerName },
                })),
              }
            : undefined,
        })}
      />
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
          { name, url },
        ])}
      />
      {faqItems.length > 0 && <JsonLd data={faqPage(faqItems)} />}
      <DynamicSolutionPage
        slug={slug}
        pageTitle={name}
        sections={page.sections ?? {}}
        orderedSections={page.orderedSections}
        profile={profile}
        autoRelatedItems={relatedItems}
      />
    </>
  );
}
