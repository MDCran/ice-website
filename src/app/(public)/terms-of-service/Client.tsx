"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronRight, Download01, FileCheck02 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { cx } from "@/utils/cx";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import type { CMSRenderableSection } from "@/components/cms/GenericCMSSections";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DEFAULT_HERO = {
  eyebrow: "Legal · Website Terms",
  headline: "Terms of Service",
  subheadline:
    "Please read these terms and conditions carefully before using the International Computer Exchange, Inc. website.",
  last_updated: "March 2026",
  badge_note: "Applies to icesales.com",
  document_title: "Website Terms and Conditions",
  document_intro:
    "These Terms govern your access to and use of the International Computer Exchange, Inc. website. By using the site, you agree to be bound by the sections below.",
  related_label: "SMS Consent Policy",
  related_href: "/sms-consent",
};

const DEFAULT_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing, browsing, or using the International Computer Exchange, Inc. ("ICE," "we," "us," or "our") website located at icesales.com (the "Site"), you acknowledge that you have read, understood, and agree to be bound by these Website Terms and Conditions ("Terms"). If you do not agree to these Terms, you should not use or access the Site.

We reserve the right to change, modify, or update these Terms at any time without prior notice. Your continued use of the Site following the posting of any changes constitutes your acceptance of such changes. We encourage you to review these Terms periodically.`,
  },
  {
    id: "use-of-site",
    title: "2. Use of the Site",
    content: `You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:

• Use the Site in any way that violates any applicable federal, state, local, or international law or regulation.
• Use the Site to transmit or procure the sending of any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.
• Impersonate or attempt to impersonate ICE, an ICE employee, another user, or any other person or entity.
• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site, or which, as determined by us, may harm ICE or users of the Site.
• Use any robot, spider, or other automatic device, process, or means to access the Site for any purpose, including monitoring or copying any of the material on the Site.
• Introduce any viruses, Trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.`,
  },
  {
    id: "intellectual-property",
    title: "3. Intellectual Property",
    content: `The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, audio, and the design, selection, and arrangement thereof) are owned by ICE, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.

These Terms permit you to use the Site for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material on our Site without the prior written consent of ICE.`,
  },
  {
    id: "disclaimer-of-warranties",
    title: "4. Disclaimer of Warranties",
    content: `THE SITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER ICE NOR ANY PERSON ASSOCIATED WITH ICE MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SITE.

WITHOUT LIMITING THE FOREGOING, NEITHER ICE NOR ANYONE ASSOCIATED WITH ICE REPRESENTS OR WARRANTS THAT THE SITE, ITS CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SITE WILL BE ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT THE SITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT THE SITE OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SITE WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.

ICE HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.`,
  },
  {
    id: "limitation-of-liability",
    title: "5. Limitation of Liability",
    content: `IN NO EVENT WILL ICE, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SITE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE SITE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.`,
  },
  {
    id: "third-party-links",
    title: "6. Links to Third-Party Sites",
    content: `The Site may contain links to other websites and resources provided by third parties. These links are provided for your convenience only. We have no control over the contents of those sites or resources, and accept no responsibility for them or for any loss or damage that may arise from your use of them.

If you decide to access any of the third-party websites linked to the Site, you do so entirely at your own risk and subject to the terms and conditions of use for such websites.`,
  },
  {
    id: "changes-to-terms",
    title: "7. Changes to Terms",
    content: `We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the Site thereafter.

Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.`,
  },
  {
    id: "contact",
    title: "8. Contact",
    content: `If you have any questions about these Terms of Service, please contact us:

International Computer Exchange, Inc.

Email: info@icesales.com
Phone: 1-800-786-9188`,
  },
];

type CmsRecord = Record<string, unknown>;

interface LegalSection {
  id: string;
  title: string;
  content: string;
}

function asRecord(value: unknown): CmsRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as CmsRecord
    : {};
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeHero(value: unknown): typeof DEFAULT_HERO {
  const hero = asRecord(value);
  return {
    eyebrow: stringValue(hero.eyebrow, DEFAULT_HERO.eyebrow),
    headline: stringValue(hero.headline, DEFAULT_HERO.headline),
    subheadline: stringValue(hero.subheadline, DEFAULT_HERO.subheadline),
    last_updated: stringValue(hero.last_updated, DEFAULT_HERO.last_updated),
    badge_note: stringValue(hero.badge_note, DEFAULT_HERO.badge_note),
    document_title: stringValue(hero.document_title, DEFAULT_HERO.document_title),
    document_intro: stringValue(hero.document_intro, DEFAULT_HERO.document_intro),
    related_label: stringValue(hero.related_label, DEFAULT_HERO.related_label),
    related_href: stringValue(hero.related_href, DEFAULT_HERO.related_href),
  };
}

function normalizeSections(value: unknown): LegalSection[] {
  const items = asRecord(value).items;
  if (items === undefined) return DEFAULT_SECTIONS;
  if (!Array.isArray(items)) return DEFAULT_SECTIONS;
  return items.flatMap((item) => {
    const section = asRecord(item);
    if (
      typeof section.id !== "string" ||
      typeof section.title !== "string" ||
      typeof section.content !== "string"
    ) {
      return [];
    }
    return [{ id: section.id, title: section.title, content: section.content }];
  });
}

export default function TermsOfServicePage({ cmsData, orderedSections }: { cmsData?: Record<string, unknown>; orderedSections?: CMSRenderableSection[] }) {
  const showHero = isCmsSectionVisible(orderedSections, "hero");
  const showSections = isCmsSectionVisible(orderedSections, "sections");
  const hero = normalizeHero(cmsData?.hero);
  const sections = useMemo(
    () => showSections ? normalizeSections(cmsData?.sections) : [],
    [cmsData, showSections],
  );
  const [selectedActiveId, setActiveId] = useState(sections[0]?.id ?? DEFAULT_SECTIONS[0].id);
  const activeId = sections.some((section) => section.id === selectedActiveId)
    ? selectedActiveId
    : sections[0]?.id ?? "";
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  const headerReveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE },
      };

  return (
    <main className="bg-primary">
      {/* Hard-edged document header */}
      {showHero && <section className="relative overflow-hidden border-b border-secondary">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <BackgroundPattern
            pattern="grid"
            className="absolute -top-28 right-0 translate-x-1/3 text-border-secondary opacity-70 dark:opacity-40"
          />
        </div>
        <div className="relative mx-auto max-w-container px-4 py-10 md:px-8 md:py-14">
          <motion.div {...headerReveal}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
              <Link href="/" className="text-tertiary transition duration-100 ease-linear hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight aria-hidden="true" className="size-4 text-fg-quaternary" />
              <span aria-current="page" className="font-semibold text-brand-secondary">{hero.headline}</span>
            </nav>

            <p className="mt-8 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              {hero.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-md text-tertiary md:text-lg">
              {hero.subheadline}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Badge size="md" color="brand">Last Updated: {hero.last_updated}</Badge>
              <span className="hidden h-4 w-px bg-border-secondary sm:block" aria-hidden="true" />
              <span className="flex items-center gap-1.5 text-sm text-quaternary">
                <FileCheck02 aria-hidden="true" className="size-4" />
                {hero.badge_note}
              </span>
            </div>
          </motion.div>
        </div>
      </section>}

      {/* Content */}
      {showSections && <section className="py-12 md:py-16">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            {/* Sticky Table of Contents (desktop) */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pb-6">
                <p className="text-xs font-medium tracking-[0.2em] text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-4 flex flex-col gap-0.5 border-l border-secondary">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      className={cx(
                        "-ml-px cursor-pointer border-l-2 py-1.5 pl-4 text-sm transition duration-100 ease-linear",
                        activeId === section.id
                          ? "border-brand bg-brand-primary_alt font-semibold text-brand-secondary"
                          : "border-transparent text-tertiary hover:border-brand hover:text-brand-secondary"
                      )}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
              {/* Mobile table of contents */}
              <div className="mb-10 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:hidden print:hidden">
                <p className="text-xs font-medium tracking-[0.2em] text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-3 flex flex-col gap-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      className="cursor-pointer text-sm font-medium text-tertiary transition duration-100 ease-linear hover:text-brand-secondary"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Document header */}
              <div className="border-b border-secondary pb-8">
                <h2 className="text-display-xs font-semibold tracking-tight text-primary md:text-display-sm">
                  {hero.document_title}
                </h2>
                <p className="prose mt-4">
                  {hero.document_intro}
                </p>
              </div>

              {/* Sections */}
              <div>
                {sections.map((section, i) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className={cx("scroll-mt-24 py-8", i < sections.length - 1 && "border-b border-secondary")}
                  >
                    <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                    <div className="prose mt-4 whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div className="flex flex-col items-center gap-6 border-t border-secondary pt-8 print:hidden">
                <Button color="secondary" size="lg" iconLeading={Download01} onClick={() => window.print()}>
                  Download as PDF
                </Button>
                <p className="text-sm text-tertiary">
                  Related:{" "}
                  <Link
                    href={hero.related_href ?? "/sms-consent"}
                    className="inline-flex items-center gap-1 font-medium text-brand-secondary hover:underline"
                  >
                    {hero.related_label ?? "SMS Consent Policy"}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>}
    </main>
  );
}
