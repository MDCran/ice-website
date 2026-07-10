import { getPageContent } from "@/lib/cms";
import { getSolutionFallback } from "@/lib/solutionFallbacks";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** serviceType per solution pillar (mirrors the on-page category badge). */
const SERVICE_TYPE: Record<string, string> = {
  "managed-cloud-hosting": "Cloud Services",
  "managed-private-cloud": "Cloud Services",
  "managed-hybrid-cloud": "Cloud Services",
  "cloud-migration": "Cloud Services",
  "backup-as-a-service": "Data Protection",
  "disaster-recovery": "Data Protection",
  "high-availability": "Data Protection",
  "ransomware-recovery": "Data Protection",
  "ibm-i-security": "Security",
  "protection-suite": "Security",
  "security-monitoring": "Security",
  "threat-detection": "Security",
  "endpoint-security": "Security",
  "managed-microsoft": "Managed Services",
  "automation-suite": "Managed Services",
  "systems-management": "Managed Services",
  "ibm-power-vs": "Managed Services",
};

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

type PageLike = {
  title?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  sections?: Record<string, any>;
  orderedSections?: any[];
};

/** Human-readable service name for schema/metadata. */
function serviceName(page: PageLike): string {
  const hero = page.sections?.hero as Record<string, any> | undefined;
  return plain(hero?.headline) || plain(page.title) || "Managed IT Service";
}

/** Service description from CMS/fallback content. */
function serviceDescription(page: PageLike): string {
  const hero = page.sections?.hero as Record<string, any> | undefined;
  return (
    plain(page.meta_description) ||
    plain(hero?.subheadline) ||
    plain(hero?.headline) ||
    ""
  );
}

async function resolvePage(slug: string): Promise<PageLike | null> {
  // Always prefer live CMS content. Hardcoded fallbacks are only a last resort
  // when the page is missing/unpublished in the database entirely.
  const cms = await getPageContent(slug);
  if (cms && (cms.orderedSections?.length ?? 0) > 0) {
    return cms;
  }
  // If CMS returned a published page with zero sections, still use it (don't
  // mask empty CMS with fallbacks — admins need to see what's actually stored).
  if (cms) {
    return cms;
  }
  return getSolutionFallback(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) return {};

  const description = clampDescription(serviceDescription(page) || serviceName(page));

  const rawTitle = (page.meta_title ?? page.title ?? "").trim();
  const cleanTitle = rawTitle
    .replace(/\s*[|\-–]\s*International Computer Exchange\s*$/i, "")
    .trim();

  return {
    title: cleanTitle || rawTitle,
    description,
    alternates: { canonical: `/solutions/${slug}` },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const [page, seo] = await Promise.all([resolvePage(slug), getSeoConfig()]);

  // Unknown slugs still 404; known solution slugs always render (CMS or fallback).
  if (!page) {
    notFound();
  }

  const url = `/solutions/${slug}`;
  const name = serviceName(page);

  const faqItems: FaqItem[] = (page.orderedSections ?? [])
    .filter((s: any) => s.section_type === "faq")
    .flatMap((s: any) => (Array.isArray(s.content?.items) ? s.content.items : []))
    .map((item: any) => ({
      question: plain(item?.question),
      answer: plain(item?.answer),
    }))
    .filter((item: FaqItem) => item.question && item.answer);

  return (
    <>
      <JsonLd
        data={service(seo, {
          name,
          description: serviceDescription(page) || name,
          url,
          serviceType: SERVICE_TYPE[slug],
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
        sections={page.sections ?? {}}
        orderedSections={page.orderedSections}
      />
    </>
  );
}
