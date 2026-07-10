/**
 * Hardcoded fallbacks for solution detail pages when CMS content is
 * unavailable (missing env, unpublished rows, RLS, etc.). Keeps
 * `/solutions/[slug]` rendering instead of hard-404ing.
 */

export const SOLUTION_SLUGS = [
  "managed-cloud-hosting",
  "managed-private-cloud",
  "managed-hybrid-cloud",
  "cloud-migration",
  "backup-as-a-service",
  "disaster-recovery",
  "high-availability",
  "ransomware-recovery",
  "ibm-i-security",
  "protection-suite",
  "security-monitoring",
  "threat-detection",
  "endpoint-security",
  "managed-microsoft",
  "automation-suite",
  "systems-management",
  "ibm-power-vs",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export function isSolutionSlug(slug: string): slug is SolutionSlug {
  return (SOLUTION_SLUGS as readonly string[]).includes(slug);
}

type SectionMap = {
  hero: {
    headline: string;
    subheadline: string;
    proof_labels: string[];
  };
  features?: {
    eyebrow?: string;
    heading?: string;
    items: { icon: string; title: string; description: string }[];
  };
  process: {
    items: { step: string; title: string; description: string }[];
  };
  benefits: {
    items: string[];
  };
  cta: {
    heading: string;
    description: string;
  };
};

export type SolutionFallbackPage = {
  title: string;
  meta_title: string;
  meta_description: string;
  sections: SectionMap;
  orderedSections: {
    section_key: string;
    section_type: string;
    content: Record<string, unknown>;
    sort_order: number;
    is_visible: boolean;
  }[];
};

const DEFAULT_PROCESS = {
  items: [
    { step: "01", title: "Assessment", description: "We analyze your environment, requirements, and success criteria." },
    { step: "02", title: "Design", description: "Our architects design a solution tailored to your workloads and SLAs." },
    { step: "03", title: "Deploy", description: "We implement, migrate, and validate with minimal business disruption." },
    { step: "04", title: "Manage", description: "24/7 monitoring, optimization, and dedicated support from ICE." },
  ],
};

const DEFAULT_BENEFITS = {
  items: [
    "Enterprise SLAs backed by Tier-3 data centers",
    "Dedicated US-based engineers who know your environment",
    "Predictable operating expense instead of capital spend",
    "Compliance-ready infrastructure (SOC 2, HIPAA, PCI, GDPR)",
  ],
};

const PROOF = ["99.99% Uptime SLA", "24/7 Engineer-Led Operations", "SOC 2 Type II", "US-Based Support"];

function buildOrdered(sections: SectionMap): SolutionFallbackPage["orderedSections"] {
  const order: SolutionFallbackPage["orderedSections"] = [];
  let i = 0;
  for (const key of ["hero", "features", "process", "benefits", "cta"] as const) {
    const content = sections[key];
    if (!content) continue;
    order.push({
      section_key: key,
      section_type: key,
      content: content as Record<string, unknown>,
      sort_order: i++,
      is_visible: true,
    });
  }
  return order;
}

function page(
  title: string,
  subheadline: string,
  features?: SectionMap["features"],
): SolutionFallbackPage {
  const sections: SectionMap = {
    hero: { headline: title, subheadline, proof_labels: PROOF },
    features,
    process: DEFAULT_PROCESS,
    benefits: DEFAULT_BENEFITS,
    cta: {
      heading: `Ready to modernize with ${title}?`,
      description: "Talk with our enterprise architects about a solution tailored to your workloads and budget.",
    },
  };

  return {
    title,
    meta_title: title,
    meta_description: subheadline.slice(0, 155),
    sections,
    orderedSections: buildOrdered(sections),
  };
}

const FALLBACKS: Record<SolutionSlug, SolutionFallbackPage> = {
  "managed-cloud-hosting": page(
    "Managed Cloud Hosting",
    "Enterprise-grade cloud hosting with 24/7 proactive monitoring, Tier-3 data centers, and dedicated support.",
    {
      eyebrow: "Key capabilities",
      heading: "Comprehensive features",
      items: [
        { icon: "Monitor", title: "24/7 Proactive Monitoring", description: "Round-the-clock infrastructure monitoring with automated alerting and rapid incident response." },
        { icon: "Server", title: "Tier-3 Data Centers", description: "SOC 2 Type II certified facilities with redundant power, cooling, and multiple network carriers." },
        { icon: "Database", title: "Redundant Infrastructure", description: "Geographically separated data centers with automatic failover and data replication." },
        { icon: "Zap", title: "Scalable Resources", description: "Instantly scale compute, storage, and bandwidth to match your workload demands." },
        { icon: "Users", title: "Dedicated Support Team", description: "Named account managers and certified engineers who know your environment." },
        { icon: "Lock", title: "Multi-Tenant Isolation", description: "Complete workload isolation with dedicated resources and network segmentation." },
      ],
    },
  ),
  "managed-private-cloud": page(
    "Managed Private Cloud",
    "Dedicated private cloud environments with complete isolation, custom configurations, and enterprise SLAs.",
  ),
  "managed-hybrid-cloud": page(
    "Managed Hybrid Cloud",
    "Seamlessly bridge on-premises and cloud infrastructure with unified management and security.",
  ),
  "cloud-migration": page(
    "Cloud Migration Services",
    "Plan and execute cloud migrations with minimal downtime, full data integrity, and clear cutover runbooks.",
  ),
  "backup-as-a-service": page(
    "Backup as a Service",
    "Managed backup with verified recoverability, retention policies, and offsite protection for critical data.",
  ),
  "disaster-recovery": page(
    "Disaster Recovery",
    "Business continuity with defined RPO/RTO targets, tested failover, and geographically separated recovery sites.",
  ),
  "high-availability": page(
    "High Availability",
    "Always-on architectures that eliminate single points of failure and keep mission-critical systems online.",
  ),
  "ransomware-recovery": page(
    "Ransomware Recovery",
    "Immutable backups, rapid restore paths, and incident response to get operations back online after an attack.",
  ),
  "ibm-i-security": page(
    "IBM i Security",
    "Hardened IBM i environments with monitoring, access controls, and compliance-ready security operations.",
  ),
  "protection-suite": page(
    "Protection Suite",
    "Layered security controls that protect endpoints, networks, and critical workloads end to end.",
  ),
  "security-monitoring": page(
    "Security Monitoring",
    "Continuous detection and response with 24/7 monitoring of threats across your infrastructure.",
  ),
  "threat-detection": page(
    "Threat Detection and Response",
    "Identify, contain, and remediate threats quickly with engineer-led detection and response workflows.",
  ),
  "endpoint-security": page(
    "Endpoint Security",
    "Protect laptops, servers, and devices with managed endpoint controls and continuous oversight.",
  ),
  "managed-microsoft": page(
    "Managed Microsoft Services",
    "Expert management of Microsoft environments — from infrastructure to productivity platforms.",
  ),
  "automation-suite": page(
    "Automation Suite",
    "Reduce manual operations with automation that improves reliability, speed, and consistency.",
  ),
  "systems-management": page(
    "Systems Management",
    "Proactive monitoring, patching, and performance management for enterprise systems.",
  ),
  "ibm-power-vs": page(
    "IBM Power VS",
    "IBM Power Virtual Server management in the cloud with enterprise reliability and support.",
  ),
};

export function getSolutionFallback(slug: string): SolutionFallbackPage | null {
  if (!isSolutionSlug(slug)) return null;
  return FALLBACKS[slug];
}
