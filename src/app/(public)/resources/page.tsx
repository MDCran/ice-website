import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, Cloud01, File02, Server01, Shield01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import GenericCMSSections from "@/components/cms/GenericCMSSections";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { getPageContent } from "@/lib/cms";
import { resolveIcon } from "@/lib/iconMap";
import { notFound } from "next/navigation";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("resources");
  return buildPageMetadata(page, {
    fallbackTitle: "Resources",
    fallbackDescription:
      "ICE resource hub: enterprise guides on managed cloud, disaster recovery, IBM i security, and business continuity for IBM Power environments.",
    defaultPath: "/resources",
  });
}

type ResourceIcon = ComponentType<{ className?: string }>;

interface ResourceCard {
  category: string;
  title: string;
  summary: string;
  href: string;
  icon: ResourceIcon;
  linkLabel?: string;
}

interface ResourceSection {
  eyebrow?: string;
  heading?: string;
  description?: string;
  item_cta_label?: string;
  items?: unknown;
  resources?: unknown;
  cards?: unknown;
}

const RESOURCES: ResourceCard[] = [
  {
    category: "AS400",
    title: "AS400 modernization assessment",
    summary:
      "How to evaluate AS/400, iSeries, and IBM i hosting, security, backup, HA, and DR options.",
    href: "/solutions/as400",
    icon: Server01,
  },
  {
    category: "Cloud",
    title: "Managed cloud for IBM Power workloads",
    summary:
      "How ICE hosts IBM i and AIX with 24/7 operations, defined SLAs, and SOC 2 Type II controls.",
    href: "/solutions/managed-cloud-hosting",
    icon: Cloud01,
  },
  {
    category: "Continuity",
    title: "Disaster recovery with measurable RPO/RTO",
    summary:
      "What to require from a DRaaS partner: replication, test cadence, and failover runbooks.",
    href: "/solutions/disaster-recovery",
    icon: File02,
  },
  {
    category: "Security",
    title: "IBM i security hardening checklist",
    summary:
      "Exit points, object authority, encryption, and monitoring practices for AS/400 environments.",
    href: "/solutions/ibm-i-security",
    icon: Shield01,
  },
];

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function resourceCardsFromSections(
  sections: Record<string, unknown>,
): { section: ResourceSection; items: ResourceCard[]; keys: string[] } {
  const keys = ["resources", "resources_grid", "resource_items", "items"];
  const sectionKey = keys.find((key) => hasOwn(sections, key));
  if (!sectionKey) return { section: {}, items: RESOURCES, keys };

  const sectionValue = sections[sectionKey];
  const section: ResourceSection =
    sectionValue && typeof sectionValue === "object" && !Array.isArray(sectionValue)
      ? (sectionValue as ResourceSection)
      : {};
  const rawItems = Array.isArray(sectionValue)
    ? sectionValue
    : (section.items ?? section.resources ?? section.cards ?? []);

  if (!Array.isArray(rawItems)) return { section, items: [], keys };

  const items = rawItems.flatMap((raw: unknown) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const title = String(item.title ?? item.heading ?? "").trim();
    const href = String(item.href ?? item.url ?? "").trim();
    if (!title || !href) return [];
    return [{
      category: String(item.category ?? item.eyebrow ?? "Resource").trim(),
      title,
      summary: String(item.summary ?? item.description ?? item.excerpt ?? "").trim(),
      href,
      icon: typeof item.icon === "string" ? resolveIcon(item.icon) : File02,
      linkLabel: String(item.link_label ?? item.cta_label ?? section.item_cta_label ?? "").trim() || undefined,
    }];
  });

  return { section, items, keys };
}

export default async function ResourcesPage() {
  const [page, seo] = await Promise.all([
    getPageContent("resources"),
    getSeoConfig(),
  ]);
  if (!page) notFound();
  const sections = page?.sections ?? {};
  const hero = sections.hero ?? {};
  const { section: resourcesSection, items: resources, keys: resourceKeys } =
    resourceCardsFromSections(sections);
  const ctaKey = ["final_cta", "cta"].find((key) => hasOwn(sections, key));
  const cta = ctaKey
    ? (sections[ctaKey] ?? {})
    : {
        cta_primary: {
          label: "Request a guided assessment",
          href: "/contact",
        },
      };
  const showHero = isCmsSectionVisible(page.orderedSections, "hero");
  const showResources = isCmsSectionVisible(
    page.orderedSections,
    "resources",
    "resources_grid",
    "resource_items",
    "items",
  );
  const showCta = isCmsSectionVisible(page.orderedSections, "final_cta", "cta");
  const extraSections = (page?.orderedSections ?? []).filter(
    (section) =>
      !["hero", ...resourceKeys, "final_cta", "cta"].includes(section.section_key),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: page?.title ?? "Resources", url: "/resources" },
        ])}
      />
      <main className="bg-primary">
        {showHero && <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
          <div
            aria-hidden="true"
            className="texture-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="texture-noise pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          />
          <BrandOrbs />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center md:px-8">
            {(hero.eyebrow || hero.label) && (
              <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                {hero.eyebrow ?? hero.label}
              </span>
            )}
            <h1 className="text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              {hero.headline ?? hero.heading ?? "Knowledge Hub"}
            </h1>
            <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">
              {hero.subheadline ??
                hero.description ??
                "Fact-dense primers on managed cloud, data protection, and IBM i security — written for architects and IT leaders evaluating ICE."}
            </p>
          </div>
        </section>}

        {(showResources || showCta) && <section className="py-16 md:py-24">
          {showResources && <>
          {(resourcesSection.eyebrow || resourcesSection.heading || resourcesSection.description) && (
            <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center px-4 text-center md:mb-16 md:px-8">
              {resourcesSection.eyebrow && (
                <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                  {resourcesSection.eyebrow}
                </span>
              )}
              {resourcesSection.heading && (
                <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                  {resourcesSection.heading}
                </h2>
              )}
              {resourcesSection.description && (
                <p className="mt-4 text-lg text-tertiary">{resourcesSection.description}</p>
              )}
            </div>
          )}
          <div className="mx-auto grid w-full max-w-container gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
            {resources.map((item) => (
              <Link
                key={`${item.href}-${item.title}`}
                href={item.href}
                className="group flex flex-col rounded-2xl bg-primary p-6 ring-1 ring-secondary transition hover:ring-brand"
              >
                <item.icon className="size-6 text-fg-brand-primary" />
                <span className="mt-4 text-xs font-medium tracking-[0.16em] text-brand-secondary uppercase">
                  {item.category}
                </span>
                <h2 className="mt-2 text-lg font-semibold text-primary group-hover:text-brand-secondary">
                  {item.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-tertiary">{item.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
                  {item.linkLabel ?? resourcesSection.item_cta_label ?? "Read more"}{" "}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
          </>}
          {showCta && (cta.heading || cta.headline || cta.description || cta.cta_primary || cta.ctaPrimary || cta.cta) && (
            <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center px-4 text-center md:px-8">
              {(cta.heading || cta.headline) && (
                <h2 className="text-display-xs font-semibold text-primary md:text-display-sm">
                  {cta.heading ?? cta.headline}
                </h2>
              )}
              {cta.description && <p className="mt-4 text-lg text-tertiary">{cta.description}</p>}
              <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                {(cta.cta_secondary?.label ?? cta.ctaSecondary?.label) &&
                  (cta.cta_secondary?.href ?? cta.ctaSecondary?.href) && (
                    <Button
                      color="secondary"
                      href={cta.cta_secondary?.href ?? cta.ctaSecondary?.href}
                      size="xl"
                    >
                      {cta.cta_secondary?.label ?? cta.ctaSecondary?.label}
                    </Button>
                  )}
                {(cta.cta_primary?.label ?? cta.ctaPrimary?.label ?? cta.cta?.label) &&
                  (cta.cta_primary?.href ?? cta.ctaPrimary?.href ?? cta.cta?.href) && (
                    <Button
                      href={cta.cta_primary?.href ?? cta.ctaPrimary?.href ?? cta.cta?.href}
                      size="xl"
                    >
                      {cta.cta_primary?.label ?? cta.ctaPrimary?.label ?? cta.cta?.label}
                    </Button>
                  )}
              </div>
            </div>
          )}
        </section>}
        <GenericCMSSections sections={extraSections} />
      </main>
    </>
  );
}
