/**
 * Smart related solutions (#20) — category-aware recommendations when CMS
 * `related` sections are empty or set `auto: true`.
 */

export type SolutionCategory =
  | "Managed Cloud Services"
  | "Managed Data Protection"
  | "Managed Security"
  | "Managed Services";

export interface SolutionRef {
  slug: string;
  title: string;
  description: string;
  category: SolutionCategory;
  icon: string;
  tags: string[];
}

export const SOLUTION_CATALOG: SolutionRef[] = [
  {
    slug: "managed-cloud-hosting",
    title: "Managed Cloud Hosting",
    description: "Enterprise cloud hosting with 24/7 management for mission-critical workloads.",
    category: "Managed Cloud Services",
    icon: "Cloud",
    tags: ["cloud", "hosting", "ibm power", "uptime"],
  },
  {
    slug: "managed-private-cloud",
    title: "Managed Private Cloud",
    description: "Dedicated private cloud with isolation, compliance controls, and ICE operations.",
    category: "Managed Cloud Services",
    icon: "Server",
    tags: ["private cloud", "dedicated", "compliance"],
  },
  {
    slug: "managed-hybrid-cloud",
    title: "Managed Hybrid Cloud",
    description: "Connect on-prem IBM Power with cloud capacity under one operating model.",
    category: "Managed Cloud Services",
    icon: "Layers",
    tags: ["hybrid", "ibm power", "cloud"],
  },
  {
    slug: "cloud-migration",
    title: "Cloud Migration",
    description: "Assess, migrate, and stabilize workloads with a controlled cutover plan.",
    category: "Managed Cloud Services",
    icon: "RefreshCw",
    tags: ["migration", "cutover", "cloud"],
  },
  {
    slug: "backup-as-a-service",
    title: "Backup as a Service",
    description: "Managed backups with defined RPO targets and restore validation.",
    category: "Managed Data Protection",
    icon: "Database",
    tags: ["backup", "rpo", "restore"],
  },
  {
    slug: "disaster-recovery",
    title: "Disaster Recovery",
    description: "Tested DR runbooks with contractual RTO/RPO for IBM i and enterprise systems.",
    category: "Managed Data Protection",
    icon: "Shield",
    tags: ["dr", "rto", "rpo", "ibm i"],
  },
  {
    slug: "high-availability",
    title: "High Availability",
    description: "Redundant architectures designed for continuous operations.",
    category: "Managed Data Protection",
    icon: "Zap",
    tags: ["ha", "failover", "uptime"],
  },
  {
    slug: "ransomware-recovery",
    title: "Ransomware Recovery",
    description: "Immutable recovery paths and incident playbooks for ransomware events.",
    category: "Managed Data Protection",
    icon: "Lock",
    tags: ["ransomware", "recovery", "immutable"],
  },
  {
    slug: "as400",
    title: "AS400 Hosting",
    description: "AS400, AS/400, iSeries, and IBM i hosting, support, security, backup, HA, DR, and modernization planning.",
    category: "Managed Services",
    icon: "Server",
    tags: ["as400", "as400 hosting", "as/400", "ibm i hosting", "iseries", "ibm power", "hosting"],
  },
  {
    slug: "ibm-i-security",
    title: "IBM i Security",
    description: "Hardening, monitoring, and access controls purpose-built for IBM i.",
    category: "Managed Security",
    icon: "Shield",
    tags: ["ibm i", "security", "hardening"],
  },
  {
    slug: "security-monitoring",
    title: "Security Monitoring",
    description: "24/7 US-based monitoring with escalation to ICE security operations.",
    category: "Managed Security",
    icon: "Eye",
    tags: ["soc", "monitoring", "24/7"],
  },
  {
    slug: "threat-detection",
    title: "Threat Detection",
    description: "Detection and response workflows tuned for enterprise environments.",
    category: "Managed Security",
    icon: "AlertTriangle",
    tags: ["threat", "detection", "response"],
  },
  {
    slug: "endpoint-security",
    title: "Endpoint Security",
    description: "Managed endpoint protection for distributed workforces.",
    category: "Managed Security",
    icon: "Monitor",
    tags: ["endpoint", "edr", "devices"],
  },
  {
    slug: "protection-suite",
    title: "Protection Suite",
    description: "Layered security controls packaged for ICE-managed estates.",
    category: "Managed Security",
    icon: "Shield",
    tags: ["suite", "security", "layered"],
  },
  {
    slug: "managed-microsoft",
    title: "Managed Microsoft",
    description: "Microsoft 365 and related services operated by ICE specialists.",
    category: "Managed Services",
    icon: "Globe",
    tags: ["microsoft", "m365", "identity"],
  },
  {
    slug: "automation-suite",
    title: "Automation Suite",
    description: "Operational automation to reduce toil and speed change windows.",
    category: "Managed Services",
    icon: "Zap",
    tags: ["automation", "runbooks", "ops"],
  },
  {
    slug: "systems-management",
    title: "Systems Management",
    description: "Patching, monitoring, and steady-state operations for enterprise systems.",
    category: "Managed Services",
    icon: "Settings",
    tags: ["systems", "patching", "ops"],
  },
  {
    slug: "ibm-power-vs",
    title: "IBM Power VS",
    description: "IBM Power Virtual Server design and managed operations.",
    category: "Managed Services",
    icon: "Server",
    tags: ["ibm power", "power vs", "cloud"],
  },
];

export function getSolutionBySlug(slug: string): SolutionRef | undefined {
  return SOLUTION_CATALOG.find((s) => s.slug === slug);
}

/** Prefer same-category peers, then tag overlap, exclude current slug. */
export function getRelatedSolutions(slug: string, limit = 3): SolutionRef[] {
  const current = getSolutionBySlug(slug);
  const others = SOLUTION_CATALOG.filter((s) => s.slug !== slug);

  const scored = others.map((s) => {
    let score = 0;
    if (current && s.category === current.category) score += 10;
    if (current) {
      for (const tag of current.tags) {
        if (s.tags.includes(tag)) score += 2;
      }
    }
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score || a.s.title.localeCompare(b.s.title));
  return scored.slice(0, limit).map((x) => x.s);
}

export function relatedItemsForCms(slug: string, limit = 3) {
  return getRelatedSolutions(slug, limit).map((s) => ({
    title: s.title,
    description: s.description,
    href: `/solutions/${s.slug}`,
    icon: s.icon,
  }));
}
