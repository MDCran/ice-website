"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { resolveIcon } from "@/lib/iconMap";
import { SOLUTION_HERO_IMAGE_BY_SLUG } from "@/lib/solutionHeroImages";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import SolutionHeroImage from "@/components/solutions/SolutionHeroImage";
import type { MetricPreset } from "@/components/solutions/SolutionMetrics";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import SolutionMutedDemo from "@/components/solutions/SolutionMutedDemo";
import { relatedItemsForCms } from "@/lib/cms/relatedSolutions";
import { pushEvent } from "@/lib/analytics";

/** Animated solution heroes — code-split so only the active page pays the cost. */
const HERO_MAP: Record<string, React.ComponentType> = {
  "managed-cloud-hosting": dynamic(() => import("@/components/solutions/heroes/CloudHostingHero")),
  "managed-private-cloud": dynamic(() => import("@/components/solutions/heroes/PrivateCloudHero")),
  "managed-hybrid-cloud": dynamic(() => import("@/components/solutions/heroes/HybridCloudHero")),
  "cloud-migration": dynamic(() => import("@/components/solutions/heroes/CloudMigrationHero")),
  "backup-as-a-service": dynamic(() => import("@/components/solutions/heroes/BackupHero")),
  "disaster-recovery": dynamic(() => import("@/components/solutions/heroes/DisasterRecoveryHero")),
  "high-availability": dynamic(() => import("@/components/solutions/heroes/HighAvailabilityHero")),
  "ransomware-recovery": dynamic(() => import("@/components/solutions/heroes/RansomwareRecoveryHero")),
  "ibm-i-security": dynamic(() => import("@/components/solutions/heroes/IBMiSecurityHero")),
  "protection-suite": dynamic(() => import("@/components/solutions/heroes/ProtectionSuiteHero")),
  "security-monitoring": dynamic(() => import("@/components/solutions/heroes/SecurityMonitoringHero")),
  "threat-detection": dynamic(() => import("@/components/solutions/heroes/ThreatDetectionHero")),
  "endpoint-security": dynamic(() => import("@/components/solutions/heroes/EndpointSecurityHero")),
  "managed-microsoft": dynamic(() => import("@/components/solutions/heroes/ManagedMicrosoftHero")),
  "automation-suite": dynamic(() => import("@/components/solutions/heroes/AutomationSuiteHero")),
  "systems-management": dynamic(() => import("@/components/solutions/heroes/SystemsManagementHero")),
  "ibm-power-vs": dynamic(() => import("@/components/solutions/heroes/IBMPowerVSHero")),
};

const SOLUTION_HERO_ALTS: Record<string, string> = {
  "managed-cloud-hosting": "Generated illustration of managed cloud hosting infrastructure",
  "managed-private-cloud": "Generated illustration of a secure private cloud environment",
  "managed-hybrid-cloud": "Generated illustration of hybrid cloud infrastructure",
  "cloud-migration": "Generated illustration of workloads migrating to cloud infrastructure",
  "backup-as-a-service": "Generated illustration of secure backup storage",
  "disaster-recovery": "Generated illustration of disaster recovery replication",
  "high-availability": "Generated illustration of mirrored high availability systems",
  "ransomware-recovery": "Generated illustration of ransomware recovery from protected backups",
  "ibm-i-security": "Generated illustration of enterprise server security",
  "protection-suite": "Generated illustration of layered security protection",
  "security-monitoring": "Generated illustration of security monitoring operations",
  "threat-detection": "Generated illustration of threat detection and response",
  "endpoint-security": "Generated illustration of endpoint security protection",
  "managed-microsoft": "Generated illustration of managed cloud productivity services",
  "automation-suite": "Generated illustration of IT automation workflows",
  "systems-management": "Generated illustration of systems management operations",
  "ibm-power-vs": "Generated illustration of enterprise power virtualization",
};

// Category badge config per solution — matches navbar mega-menu groupings.
const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  "managed-cloud-hosting": { label: "Managed Cloud Services", icon: "Cloud" },
  "managed-private-cloud": { label: "Managed Cloud Services", icon: "Cloud" },
  "managed-hybrid-cloud": { label: "Managed Cloud Services", icon: "Cloud" },
  "cloud-migration": { label: "Managed Cloud Services", icon: "Cloud" },
  "backup-as-a-service": { label: "Managed Data Protection", icon: "Shield" },
  "disaster-recovery": { label: "Managed Data Protection", icon: "Shield" },
  "high-availability": { label: "Managed Data Protection", icon: "Shield" },
  "ransomware-recovery": { label: "Managed Data Protection", icon: "Shield" },
  "ibm-i-security": { label: "Managed Security", icon: "Lock" },
  "protection-suite": { label: "Managed Security", icon: "Lock" },
  "security-monitoring": { label: "Managed Security", icon: "Lock" },
  "threat-detection": { label: "Managed Security", icon: "Lock" },
  "endpoint-security": { label: "Managed Security", icon: "Lock" },
  "managed-microsoft": { label: "Managed Services", icon: "Server" },
  "automation-suite": { label: "Managed Services", icon: "Server" },
  "systems-management": { label: "Managed Services", icon: "Server" },
  "ibm-power-vs": { label: "Managed Services", icon: "Server" },
};

interface CtaLink {
  label?: string;
  href?: string;
}

interface SectionData {
  hero?: {
    headline: string;
    subheadline: string;
    eyebrow?: string;
    category?: string;
    category_label?: string;
    categoryLabel?: string;
    category_icon?: string;
    categoryIcon?: string;
    proof_labels?: string[];
    proofLabels?: string[];
    cta_primary?: CtaLink;
    ctaPrimary?: CtaLink;
    cta_secondary?: CtaLink;
    ctaSecondary?: CtaLink;
    hero_image?: string;
    heroImage?: string;
    image?: string;
    visual_image?: string;
    visualImage?: string;
    image_alt?: string;
    imageAlt?: string;
    hero_image_alt?: string;
    heroImageAlt?: string;
    demo_video_url?: string;
    demoVideoUrl?: string;
    demo_poster?: string;
    demoPoster?: string;
    demo_caption?: string;
    experiment_id?: string;
    experimentId?: string;
    headline_b?: string;
    headlineB?: string;
    cta_primary_b?: CtaLink;
    ctaPrimaryB?: CtaLink;
  };
  features?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { icon: string; title: string; description: string; proof?: string }[];
  };
  process?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { step?: string; title: string; description: string; icon?: string }[];
  };
  benefits?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: Array<string | { text?: string; label?: string; title?: string }>;
  };
  cta?: {
    heading?: string;
    headline?: string;
    description?: string;
    subheadline?: string;
    cta_primary?: CtaLink;
    ctaPrimary?: CtaLink;
    cta_secondary?: CtaLink;
    ctaSecondary?: CtaLink;
  };
}

/** Section keys the layout renders bespoke (everything else goes through GenericCMSSections). */
const KNOWN_KEYS = ["hero", "features", "process", "benefits", "cta"];

function firstText(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export default function DynamicSolutionPage({
  slug,
  pageTitle,
  sections,
  orderedSections,
}: {
  slug: string;
  pageTitle?: string;
  sections: SectionData;
  orderedSections?: CMSRenderableSection[];
}) {
  const hero = sections.hero;
  const features = (sections.features?.items ?? []).map((f) => ({
    icon: resolveIcon(f.icon),
    title: f.title,
    description: f.description,
    proof: f.proof,
  }));
  const process = sections.process?.items ?? [];
  const benefits = (sections.benefits?.items ?? [])
    .map((item) => (typeof item === "string" ? item : (item?.text ?? item?.label ?? item?.title ?? "")))
    .filter(Boolean);
  const cta = sections.cta;

  // Prefer CMS page title for H1 + breadcrumb (not marketing headline fluff).
  const solutionTitle =
    (pageTitle?.trim() ||
      hero?.headline?.replace(/<[^>]*>/g, "").trim() ||
      slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "));
  useEffect(() => {
    pushEvent("solution_viewed", { slug, title: solutionTitle });
    // Intentionally keyed to `slug` only: one event per solution navigated to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Prefer CMS orderedSections (sort_order). If only the keyed map is present,
  // synthesize an order so value_props/banner/roi/faq/etc. still render.
  const visibleOrdered: CMSRenderableSection[] =
    (orderedSections ?? []).filter((section) => section.is_visible !== false).length > 0
      ? (orderedSections ?? [])
          .filter((section) => section.is_visible !== false)
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      : Object.entries(sections as Record<string, Record<string, unknown>>)
          .filter(([, content]) => content && typeof content === "object")
          .map(([key, content], index) => ({
            section_key: key,
            section_type: key,
            content,
            sort_order: index,
            is_visible: true,
          }));

  // Smart related solutions (#20): fill empty / auto related sections from catalog.
  const autoRelatedItems = relatedItemsForCms(slug, 3);
  const enrichedOrdered = visibleOrdered.map((section) => {
    if (section.section_key !== "related" && section.section_type !== "related") return section;
    const content = (section.content ?? {}) as Record<string, unknown>;
    const items = Array.isArray(content.items) ? content.items : [];
    const useAuto = content.auto === true || items.length === 0;
    if (!useAuto) return section;
    return {
      ...section,
      content: {
        ...content,
        eyebrow: content.eyebrow ?? "Related",
        heading: content.heading ?? "Related solutions",
        description:
          content.description ??
          "Adjacent ICE services commonly evaluated with this offer.",
        auto: true,
        items: autoRelatedItems,
      },
    };
  });
  const hasRelated = enrichedOrdered.some(
    (s) => s.section_key === "related" || s.section_type === "related",
  );
  if (!hasRelated && autoRelatedItems.length > 0) {
    enrichedOrdered.push({
      section_key: "related",
      section_type: "related",
      content: {
        eyebrow: "Related",
        heading: "Related solutions",
        description: "Adjacent ICE services commonly evaluated with this offer.",
        auto: true,
        items: autoRelatedItems,
      },
      sort_order: 900,
      is_visible: true,
    });
  }

  const sectionOrder = enrichedOrdered.map((section) => section.section_key);
  const orderedExtras: Record<string, React.ReactNode> = {};
  for (const section of enrichedOrdered) {
    // Hero/features/process/benefits/cta use bespoke layout chrome; everything
    // else (value_props, banner, roi, stats, use_cases, faq, related, …) goes
    // through GenericCMSSections so comparison tables and FAQs always appear.
    if (!KNOWN_KEYS.includes(section.section_key)) {
      orderedExtras[section.section_key] = <GenericCMSSections sections={[section]} />;
    }
  }
  // Legacy path (no ordered data): render extras as one block.
  const extraSections = enrichedOrdered.filter((section) => !KNOWN_KEYS.includes(section.section_key));

  const categoryFallback = CATEGORY_MAP[slug] ?? { label: "Solutions", icon: "Globe" };
  const categoryLabel =
    firstText(hero?.category, hero?.category_label, hero?.categoryLabel) ?? categoryFallback.label;
  const categoryIconName = firstText(hero?.category_icon, hero?.categoryIcon) ?? categoryFallback.icon;
  const CategoryIcon = resolveIcon(categoryIconName);
  const defaultHeroSrc = SOLUTION_HERO_IMAGE_BY_SLUG[slug];
  const heroImageSrc = firstText(
    hero?.hero_image,
    hero?.heroImage,
    hero?.image,
    hero?.visual_image,
    hero?.visualImage,
    defaultHeroSrc,
  );
  const heroImageAlt = firstText(
    hero?.image_alt,
    hero?.imageAlt,
    hero?.hero_image_alt,
    hero?.heroImageAlt,
    SOLUTION_HERO_ALTS[slug],
    `${solutionTitle} illustration`,
  );

  const AnimatedHero = HERO_MAP[slug];
  const heroVisualization = AnimatedHero ? (
    <AnimatedHero />
  ) : heroImageSrc ? (
    <SolutionHeroImage src={heroImageSrc} alt={heroImageAlt ?? ""} />
  ) : undefined;

  const demoVideoUrl = firstText(hero?.demo_video_url, hero?.demoVideoUrl);
  const demoPoster = firstText(hero?.demo_poster, hero?.demoPoster, heroImageSrc);
  const demoCaption = firstText(hero?.demo_caption) ?? `${solutionTitle} product demo (muted)`;

  const mutedDemo = demoVideoUrl ? (
    <section className="mx-auto max-w-container px-4 py-10 md:px-8">
      <SolutionMutedDemo
        videoSrc={demoVideoUrl}
        posterSrc={demoPoster}
        caption={demoCaption}
        className="mx-auto max-w-3xl"
      />
    </section>
  ) : null;

  const genericExtras =
    sectionOrder.length > 0 ? undefined : (
      <>
        {mutedDemo}
        <GenericCMSSections sections={extraSections} />
      </>
    );

  const extrasWithDemo =
    mutedDemo && sectionOrder.length > 0
      ? { __demo: mutedDemo, ...orderedExtras }
      : orderedExtras;
  const orderWithDemo =
    mutedDemo && sectionOrder.length > 0 ? ["__demo", ...sectionOrder] : sectionOrder;
  const defaultLeadHref = `/contact?service=${encodeURIComponent(solutionTitle)}&source=solution_detail`;
  const leadHref = (href?: string) => {
    const value = typeof href === "string" ? href.trim() : "";
    return !value || value === "/contact" ? defaultLeadHref : value;
  };

  return (
    <SolutionPageLayout
      solutionSlug={slug}
      metricsPreset={slug as MetricPreset}
      title={solutionTitle}
      subtitle={hero?.subheadline ?? ""}
      categoryBadge={{
        label: categoryLabel,
        icon: <CategoryIcon className="size-4" aria-hidden="true" />,
      }}
      heroVisualization={heroVisualization}
      heroEyebrow={undefined}
      heroProofLabels={hero?.proof_labels ?? hero?.proofLabels}
      heroCtaPrimary={{
        label: "Speak to an Expert",
        href: leadHref(hero?.cta_primary?.href ?? hero?.ctaPrimary?.href),
      }}
      heroCtaSecondary={undefined}
      features={features}
      featuresIntro={{
        eyebrow: sections.features?.eyebrow,
        heading: sections.features?.heading,
        description: sections.features?.description,
      }}
      process={process}
      processIntro={{
        eyebrow: sections.process?.eyebrow,
        heading: sections.process?.heading,
        description: sections.process?.description,
      }}
      benefits={benefits}
      benefitsIntro={{
        eyebrow: sections.benefits?.eyebrow,
        heading: sections.benefits?.heading,
        description: sections.benefits?.description,
      }}
      sectionOrder={orderWithDemo.length > 0 ? orderWithDemo : undefined}
      orderedExtras={orderWithDemo.length > 0 ? extrasWithDemo : undefined}
      extraSections={genericExtras}
      ctaTitle={cta?.heading ?? cta?.headline ?? "Ready to Speak to an Expert?"}
      ctaSubtitle={
        cta?.description ??
        cta?.subheadline ??
        "Contact our enterprise architects to design a solution tailored to your needs."
      }
      ctaButtonLabel="Speak to an Expert"
      ctaPrimaryHref={leadHref(cta?.cta_primary?.href ?? cta?.ctaPrimary?.href)}
      breadcrumbLabel={solutionTitle}
    />
  );
}
