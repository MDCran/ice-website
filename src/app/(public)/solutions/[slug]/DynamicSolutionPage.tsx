"use client";

import { resolveIcon } from "@/lib/iconMap";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import type { MetricPreset } from "@/components/solutions/SolutionMetrics";

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

interface SectionData {
  hero?: { headline: string; subheadline: string };
  features?: { items: { icon: string; title: string; description: string }[] };
  process?: { items: { step: string; title: string; description: string }[] };
  benefits?: { items: string[] };
}

export default function DynamicSolutionPage({
  slug,
  sections,
}: {
  slug: string;
  sections: SectionData;
}) {
  const hero = sections.hero;
  const features = (sections.features?.items ?? []).map((f) => ({
    icon: (() => { const Icon = resolveIcon(f.icon); return <Icon className="h-6 w-6" />; })(),
    title: f.title,
    description: f.description,
  }));
  const process = sections.process?.items ?? [];
  const benefits = sections.benefits?.items ?? [];

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
        icon: <CategoryIcon className="h-4 w-4 text-sky-400" />,
      }}
      heroVisualization={HeroComponent ? <HeroComponent /> : undefined}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle={`Ready to Get Started?`}
      ctaSubtitle="Contact our enterprise architects to design a solution tailored to your needs."
      breadcrumbLabel={hero?.headline?.replace(/<[^>]*>/g, "") ?? slug}
    />
  );
}
