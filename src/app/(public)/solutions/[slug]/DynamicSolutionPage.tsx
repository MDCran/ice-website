"use client";

import { useEffect } from "react";
import { resolveIcon } from "@/lib/iconMap";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import type { MetricPreset } from "@/components/solutions/SolutionMetrics";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { pushEvent } from "@/lib/analytics";

// Hero component map — lazy loaded
import dynamic from "next/dynamic";

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

// Category badge config per solution
const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  "managed-cloud-hosting": { label: "Cloud Services", icon: "Cloud" },
  "managed-private-cloud": { label: "Cloud Services", icon: "Cloud" },
  "managed-hybrid-cloud": { label: "Cloud Services", icon: "Cloud" },
  "cloud-migration": { label: "Cloud Services", icon: "Cloud" },
  "backup-as-a-service": { label: "Data Protection", icon: "Shield" },
  "disaster-recovery": { label: "Data Protection", icon: "Shield" },
  "high-availability": { label: "Data Protection", icon: "Shield" },
  "ransomware-recovery": { label: "Data Protection", icon: "Shield" },
  "ibm-i-security": { label: "Security", icon: "Lock" },
  "protection-suite": { label: "Security", icon: "Lock" },
  "security-monitoring": { label: "Security", icon: "Lock" },
  "threat-detection": { label: "Security", icon: "Lock" },
  "endpoint-security": { label: "Security", icon: "Lock" },
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
    proof_labels?: string[];
    proofLabels?: string[];
    cta_primary?: CtaLink;
    ctaPrimary?: CtaLink;
    cta_secondary?: CtaLink;
    ctaSecondary?: CtaLink;
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
    items: { step: string; title: string; description: string }[];
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

export default function DynamicSolutionPage({
  slug,
  sections,
  orderedSections,
}: {
  slug: string;
  sections: SectionData;
  orderedSections?: CMSRenderableSection[];
}) {
  const hero = sections.hero;
  const features = (sections.features?.items ?? []).map((f) => ({
    icon: (() => { const Icon = resolveIcon(f.icon); return <Icon className="size-6" aria-hidden="true" />; })(),
    title: f.title,
    description: f.description,
    proof: f.proof,
  }));
  const process = sections.process?.items ?? [];
  const benefits = (sections.benefits?.items ?? [])
    .map((item) => (typeof item === "string" ? item : (item?.text ?? item?.label ?? item?.title ?? "")))
    .filter(Boolean);
  const cta = sections.cta;

  // Fire a single `solution_viewed` event when this solution page mounts.
  const solutionTitle = hero?.headline?.replace(/<[^>]*>/g, "") ?? slug;
  useEffect(() => {
    pushEvent("solution_viewed", { slug, title: solutionTitle });
    // Intentionally keyed to `slug` only: one event per solution navigated to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Every visible seeded section, in sort_order — nothing gets dropped.
  const visibleOrdered = (orderedSections ?? [])
    .filter((section) => section.is_visible !== false)
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const sectionOrder = visibleOrdered.map((section) => section.section_key);
  const orderedExtras: Record<string, React.ReactNode> = {};
  for (const section of visibleOrdered) {
    if (!KNOWN_KEYS.includes(section.section_key)) {
      orderedExtras[section.section_key] = <GenericCMSSections sections={[section]} />;
    }
  }
  // Legacy fallback path (no ordered data): render extras as one block.
  const extraSections = visibleOrdered.filter((section) => !KNOWN_KEYS.includes(section.section_key));

  const HeroComponent = HERO_MAP[slug];
  const category = CATEGORY_MAP[slug] ?? { label: "Solutions", icon: "Globe" };
  const CategoryIcon = resolveIcon(category.icon);

  return (
    <SolutionPageLayout
      metricsPreset={slug as MetricPreset}
      title={hero?.headline ?? ""}
      subtitle={hero?.subheadline ?? ""}
      categoryBadge={{
        label: category.label,
        icon: <CategoryIcon className="size-4" aria-hidden="true" />,
      }}
      heroVisualization={HeroComponent ? <HeroComponent /> : undefined}
      heroEyebrow={hero?.eyebrow}
      heroProofLabels={hero?.proof_labels ?? hero?.proofLabels}
      heroCtaPrimary={hero?.cta_primary ?? hero?.ctaPrimary}
      heroCtaSecondary={hero?.cta_secondary ?? hero?.ctaSecondary}
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
      sectionOrder={sectionOrder.length > 0 ? sectionOrder : undefined}
      orderedExtras={sectionOrder.length > 0 ? orderedExtras : undefined}
      extraSections={
        sectionOrder.length > 0 ? undefined : <GenericCMSSections sections={extraSections} />
      }
      ctaTitle={cta?.heading ?? cta?.headline ?? "Ready to Get Started?"}
      ctaSubtitle={
        cta?.description ??
        cta?.subheadline ??
        "Contact our enterprise architects to design a solution tailored to your needs."
      }
      ctaButtonLabel={cta?.cta_primary?.label ?? cta?.ctaPrimary?.label}
      ctaPrimaryHref={cta?.cta_primary?.href ?? cta?.ctaPrimary?.href}
      ctaSecondary={cta?.cta_secondary ?? cta?.ctaSecondary}
      breadcrumbLabel={solutionTitle}
    />
  );
}
