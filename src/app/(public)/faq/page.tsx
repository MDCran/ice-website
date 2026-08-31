import type { Metadata } from "next";
import FaqHub from "@/components/marketing/FaqHub";
import { getPageContent } from "@/lib/cms";
import { faqItemsFromSections } from "@/lib/cms/faqContent";
import { JsonLd, breadcrumbs, faqPage } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { notFound } from "next/navigation";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("faq");
  return buildPageMetadata(page, {
    fallbackTitle: "Enterprise IT Frequently Asked Questions | ICE",
    fallbackDescription:
      "Answers about ICE managed cloud, IBM i, disaster recovery, RPO/RTO, security monitoring, and response times.",
    defaultPath: "/faq",
  });
}

export default async function Page() {
  const [page, seo] = await Promise.all([getPageContent("faq"), getSeoConfig()]);
  if (!page) notFound();
  const sections = page?.sections ?? {};
  const showHero = isCmsSectionVisible(page.orderedSections, "hero");
  const showFaqs = isCmsSectionVisible(page.orderedSections, "faqs", "faq", "faq_items", "items");
  const showCta = isCmsSectionVisible(page.orderedSections, "final_cta", "cta");
  const faqSection =
    sections.faqs ?? sections.faq ?? sections.faq_items ?? sections.items ?? {};
  const items = showFaqs ? faqItemsFromSections(sections) : [];
  const cta = sections.final_cta ?? sections.cta ?? null;

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: page?.title ?? "FAQ", url: "/faq" },
        ])}
      />
      <JsonLd data={faqPage(items)} />
      <FaqHub
        items={items}
        hero={sections.hero ?? {}}
        faqSection={faqSection}
        cta={cta}
        showHero={showHero}
        showFaqs={showFaqs}
        showCta={showCta}
      />
    </>
  );
}
