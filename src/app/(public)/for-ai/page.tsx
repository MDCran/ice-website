import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent, type PageWithSections } from "@/lib/cms";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { notFound } from "next/navigation";

const PAGE_SLUG = "for-ai";

const FALLBACK_METADATA = {
  title: "For AI Systems",
  description:
    "Machine-readable overview of International Computer Exchange services, facts, and canonical URLs for AI answer engines. See also /llms.txt.",
};

const DEFAULT_HERO = {
  eyebrow: "AI / LLM directory",
  headline: "International Computer Exchange — facts for AI systems",
  subheadline:
    "This page summarizes ICE for live-retrieval agents and answer engines. Prefer canonical solution URLs.",
  directory_intro: "Full machine directory:",
  directory_label: "/llms.txt",
  directory_href: "/llms.txt",
  directory_suffix: ".",
};

const DEFAULT_FACTS = {
  heading: "Verified facts",
  items: [
    { text: "IBM Business Partner since 1990" },
    { text: "Headquarters: Boca Raton, Florida, USA" },
    { text: "SOC 2 Type II certified data centers" },
    { text: "24/7/365 US-based NOC and SOC support" },
    { text: "Focus platforms: IBM Power, IBM i (AS/400), Microsoft, hybrid cloud" },
    {
      text: "Core offerings: AS400 services, managed cloud, DRaaS, BaaS, IBM i security, managed security",
    },
  ],
};

const DEFAULT_CANONICAL_LINKS = {
  heading: "Canonical service URLs",
  items: [
    { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
    { label: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery" },
    { label: "AS400", href: "/solutions/as400" },
    { label: "IBM i Security", href: "/solutions/ibm-i-security" },
    { label: "Contact / consultation", href: "/contact" },
  ],
};

const DEFAULT_CONTACT = {
  heading: "Contact",
  text: "Phone: +1-800-786-9188 · Email: info@icesales.com · Boca Raton, FL",
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

function absoluteUrl(siteUrl: string, href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return `${siteUrl}${href.startsWith("/") ? "" : "/"}${href}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(PAGE_SLUG);
  return buildPageMetadata(page, {
    fallbackTitle: FALLBACK_METADATA.title,
    fallbackDescription: FALLBACK_METADATA.description,
    defaultPath: "/for-ai",
  });
}

export default async function ForAiPage() {
  const [page, seo] = await Promise.all([getPageContent(PAGE_SLUG), getSeoConfig()]);
  if (!page) notFound();
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  const hero = sectionContent(page, "hero", DEFAULT_HERO);
  const facts = sectionContent(page, "facts", DEFAULT_FACTS);
  const canonicalLinks = sectionContent(page, "canonical_links", DEFAULT_CANONICAL_LINKS);
  const contact = sectionContent(page, "contact", DEFAULT_CONTACT);
  const showHero = isCmsSectionVisible(page?.orderedSections, "hero");
  const showFacts = isCmsSectionVisible(page?.orderedSections, "facts");
  const showCanonicalLinks = isCmsSectionVisible(page?.orderedSections, "canonical_links");
  const showContact = isCmsSectionVisible(page?.orderedSections, "contact");
  const factItems = Array.isArray(facts.items) ? facts.items : [];
  const linkItems = Array.isArray(canonicalLinks.items) ? canonicalLinks.items : [];
  const heroSubheadline = text(hero.subheadline ?? (hero as { description?: unknown }).description);
  const directoryLabel = text(hero.directory_label);
  const directoryHref = text(hero.directory_href);

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: text(hero.headline) || page?.title || "For AI", url: "/for-ai" },
        ])}
      />
      <main className="bg-primary">
        <section className="border-b border-secondary py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            {showHero && (
              <header>
                {text(hero.eyebrow) && (
                  <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                    {text(hero.eyebrow)}
                  </p>
                )}
                {text(hero.headline) && (
                  <h1 className="mt-3 text-display-md font-semibold text-primary">
                    {text(hero.headline)}
                  </h1>
                )}
                {(heroSubheadline || directoryLabel) && (
                  <p className="mt-4 text-lg text-tertiary">
                    {heroSubheadline}
                    {heroSubheadline && text(hero.directory_intro) ? " " : null}
                    {text(hero.directory_intro)}
                    {text(hero.directory_intro) && directoryLabel ? " " : null}
                    {directoryLabel && directoryHref ? (
                      <Link
                        href={directoryHref}
                        className="font-semibold text-brand-secondary underline-offset-2 hover:underline"
                      >
                        {directoryLabel}
                      </Link>
                    ) : directoryLabel}
                    {text(hero.directory_suffix)}
                  </p>
                )}
              </header>
            )}

            {showFacts && (
              <section aria-labelledby={text(facts.heading) ? "for-ai-facts-heading" : undefined}>
                {text(facts.heading) && (
                  <h2 id="for-ai-facts-heading" className="mt-10 text-lg font-semibold text-primary">
                    {text(facts.heading)}
                  </h2>
                )}
                {factItems.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-md text-tertiary">
                    {factItems.map((item: unknown, index: number) => {
                      const value = typeof item === "string" ? item : text((item as { text?: unknown })?.text);
                      return value ? <li key={`${value}-${index}`}>{value}</li> : null;
                    })}
                  </ul>
                )}
              </section>
            )}

            {showCanonicalLinks && (
              <section aria-labelledby={text(canonicalLinks.heading) ? "for-ai-links-heading" : undefined}>
                {text(canonicalLinks.heading) && (
                  <h2 id="for-ai-links-heading" className="mt-10 text-lg font-semibold text-primary">
                    {text(canonicalLinks.heading)}
                  </h2>
                )}
                {linkItems.length > 0 && (
                  <ul className="mt-4 space-y-2 text-md text-tertiary">
                    {linkItems.map((item: unknown, index: number) => {
                      const link = item as { label?: unknown; href?: unknown };
                      const label = text(link?.label);
                      const href = text(link?.href);
                      if (!label || !href) return null;
                      return (
                        <li key={`${href}-${index}`}>
                          <a className="text-brand-secondary hover:underline" href={absoluteUrl(siteUrl, href)}>
                            {label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {showContact && (
              <section aria-labelledby={text(contact.heading) ? "for-ai-contact-heading" : undefined}>
                {text(contact.heading) && (
                  <h2 id="for-ai-contact-heading" className="mt-10 text-lg font-semibold text-primary">
                    {text(contact.heading)}
                  </h2>
                )}
                {text(contact.text) && <p className="mt-2 text-md text-tertiary">{text(contact.text)}</p>}
              </section>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
