import type { Metadata } from "next";
import Link from "next/link";
import SolutionFinder, { type SolutionFinderContent } from "@/components/marketing/SolutionFinder";
import AtmosphericBand from "@/components/marketing/AtmosphericBand";
import { getPageContent, type PageWithSections } from "@/lib/cms";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { notFound } from "next/navigation";
import { getPublishedSolutionCatalog } from "@/lib/cms/solutionCatalog";

const PAGE_SLUG = "solution-finder";

const FALLBACK_METADATA = {
  title: "Solution Finder",
  description: "Find the right ICE solution with a quick guided match or a more detailed assessment.",
};

const DEFAULT_BREADCRUMBS = {
  aria_label: "Breadcrumb",
  separator: "/",
  items: [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions" },
    { label: "Finder", schema_label: "Solution Finder", href: "/solutions/find" },
  ],
};

const DEFAULT_HERO = {
  eyebrow: "Guided recommendations",
  headline: "Find the right ICE solution",
  subheadline:
    "Choose a quick match or a detailed assessment to get one recommended starting point and two supporting options.",
};

const DEFAULT_CATALOG_CTA = {
  label: "Or browse the full catalog →",
  href: "/solutions",
};

function hasSection(page: PageWithSections | null, key: string): boolean {
  return page?.orderedSections.some((section) => section.section_key === key) ?? false;
}

function sectionContent<T>(page: PageWithSections | null, key: string, fallback: T): T {
  if (!hasSection(page, key)) return fallback;
  return (page?.sections[key] ?? {}) as T;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(PAGE_SLUG);
  const metadata = await buildPageMetadata(page, {
    fallbackTitle: FALLBACK_METADATA.title,
    fallbackDescription: FALLBACK_METADATA.description,
    defaultPath: "/solutions/find",
  });
  const cmsTitle = page?.meta_title?.trim() || page?.title?.trim();
  const cmsDescription = page?.meta_description?.trim();
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      title: cmsTitle || "Solution Finder | International Computer Exchange",
      description:
        cmsDescription ||
        "Get tailored ICE recommendations for managed cloud, DR, security, IBM Power, Microsoft, and managed operations.",
    },
  };
}

export default async function SolutionFinderPage() {
  const [page, seo, catalog] = await Promise.all([
    getPageContent(PAGE_SLUG),
    getSeoConfig(),
    getPublishedSolutionCatalog(),
  ]);
  if (!page) notFound();
  const breadcrumbCopy = sectionContent(page, "breadcrumbs", DEFAULT_BREADCRUMBS);
  const hero = sectionContent(page, "hero", DEFAULT_HERO);
  const finderContent = sectionContent<SolutionFinderContent>(page, "finder", {});
  const catalogCta = sectionContent(page, "catalog_cta", DEFAULT_CATALOG_CTA);
  const showBreadcrumbs = isCmsSectionVisible(page?.orderedSections, "breadcrumbs");
  const showHero = isCmsSectionVisible(page?.orderedSections, "hero");
  const showFinder = isCmsSectionVisible(page?.orderedSections, "finder");
  const showCatalogCta = isCmsSectionVisible(page?.orderedSections, "catalog_cta");
  const heroSubheadline = text(hero.subheadline ?? (hero as { description?: unknown }).description);
  const breadcrumbItems = (Array.isArray(breadcrumbCopy.items) ? breadcrumbCopy.items : [])
    .map((item: unknown) => {
      const value = item as { label?: unknown; schema_label?: unknown; href?: unknown };
      return {
        label: text(value?.label),
        schemaLabel: text(value?.schema_label) || text(value?.label),
        href: text(value?.href),
      };
    })
    .filter((item) => item.label && item.href);

  return (
    <>
      {showBreadcrumbs && breadcrumbItems.length > 0 && (
        <JsonLd
          data={breadcrumbs(
            seo,
            breadcrumbItems.map((item) => ({ name: item.schemaLabel, url: item.href })),
          )}
        />
      )}
      <main className="bg-primary">
        <AtmosphericBand tone="muted" className="border-b border-secondary py-16 md:py-24">
          <div className="mx-auto w-full max-w-container px-4 md:px-8">
            {showBreadcrumbs && breadcrumbItems.length > 0 && (
              <nav aria-label={text(breadcrumbCopy.aria_label) || undefined} className="mb-8 flex items-center gap-1.5 text-sm">
                {breadcrumbItems.map((item, index) => {
                  const isCurrent = index === breadcrumbItems.length - 1;
                  return (
                    <span key={`${item.href}-${index}`} className="contents">
                      {index > 0 && (
                        <span aria-hidden="true" className="text-fg-quaternary">
                          {text(breadcrumbCopy.separator)}
                        </span>
                      )}
                      {isCurrent ? (
                        <span aria-current="page" className="font-medium text-secondary">
                          {item.label}
                        </span>
                      ) : (
                        <Link href={item.href} className="font-medium text-tertiary hover:text-brand-secondary">
                          {item.label}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </nav>
            )}

            {showHero && (
              <header className="mx-auto max-w-3xl text-center">
                {text(hero.eyebrow) && (
                  <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                    {text(hero.eyebrow)}
                  </p>
                )}
                {text(hero.headline) && (
                  <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">
                    {text(hero.headline)}
                  </h1>
                )}
                {heroSubheadline && <p className="mt-4 text-lg text-tertiary">{heroSubheadline}</p>}
              </header>
            )}

            {showFinder && (
              <div className="mx-auto mt-10 max-w-6xl md:mt-12">
                <SolutionFinder content={finderContent} catalog={catalog} />
              </div>
            )}

            {showCatalogCta && text(catalogCta.label) && text(catalogCta.href) && (
              <div className="mx-auto mt-8 flex max-w-6xl justify-center">
                <Link
                  href={text(catalogCta.href)}
                  className="text-sm font-semibold text-brand-secondary underline-offset-2 hover:underline"
                >
                  {text(catalogCta.label)}
                </Link>
              </div>
            )}
          </div>
        </AtmosphericBand>
      </main>
    </>
  );
}
