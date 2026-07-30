export type IllustrationSizePreset = "thumb" | "card" | "hero" | "full";

/** Recommended render sizes for the illustration registry (#32). */
export const ILLUSTRATION_SIZE_PRESETS: Record<
  IllustrationSizePreset,
  { label: string; className: string; hint: string }
> = {
  thumb: { label: "Thumb", className: "size-16", hint: "Nav / picker" },
  card: { label: "Card", className: "size-40 md:size-48", hint: "Feature cards" },
  hero: { label: "Hero", className: "h-64 w-full max-w-md md:h-80", hint: "Solution heroes" },
  full: { label: "Full", className: "h-auto w-full max-w-xl", hint: "Full-bleed sections" },
};

export interface IllustrationMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  /** Preferred default size when dropping into CMS. */
  defaultSize?: IllustrationSizePreset;
}

export const ILLUSTRATION_CATEGORIES = [
  "All",
  "Cloud & Hosting",
  "Security",
  "Data & Backup",
  "Services & Business",
] as const;

export const ILLUSTRATIONS: IllustrationMeta[] = [
  // Cloud & Hosting
  {
    id: "cloud-server",
    name: "Cloud Server",
    category: "Cloud & Hosting",
    description: "Cloud computing with server infrastructure",
    tags: ["cloud", "server", "hosting", "infrastructure"],
    defaultSize: "hero",
  },
  {
    id: "hybrid-cloud",
    name: "Hybrid Cloud",
    category: "Cloud & Hosting",
    description: "Hybrid cloud architecture connecting on-prem and cloud",
    tags: ["hybrid", "cloud", "architecture", "connection"],
  },
  {
    id: "cloud-migration",
    name: "Cloud Migration",
    category: "Cloud & Hosting",
    description: "Migrating workloads from server to cloud",
    tags: ["migration", "cloud", "transition", "move"],
  },
  {
    id: "data-center",
    name: "Data Center",
    category: "Cloud & Hosting",
    description: "Enterprise data center rack infrastructure",
    tags: ["data center", "rack", "servers", "infrastructure"],
  },
  // Security
  {
    id: "shield-protect",
    name: "Shield Protect",
    category: "Security",
    description: "Enterprise security protection shield",
    tags: ["security", "shield", "protection", "guard"],
  },
  {
    id: "cyber-defend",
    name: "Cyber Defense",
    category: "Security",
    description: "Active cybersecurity defense radar",
    tags: ["cyber", "defense", "radar", "monitor"],
  },
  {
    id: "ransomware-guard",
    name: "Ransomware Guard",
    category: "Security",
    description: "Ransomware protection for files and data",
    tags: ["ransomware", "files", "protection", "block"],
  },
  {
    id: "endpoint-secure",
    name: "Endpoint Security",
    category: "Security",
    description: "Device and endpoint security monitoring",
    tags: ["endpoint", "device", "laptop", "security"],
  },
  // Data & Backup
  {
    id: "database-stack",
    name: "Database Stack",
    category: "Data & Backup",
    description: "Layered data storage architecture",
    tags: ["database", "storage", "data", "stack"],
  },
  {
    id: "backup-restore",
    name: "Backup & Restore",
    category: "Data & Backup",
    description: "Automated data backup and restoration loop",
    tags: ["backup", "restore", "recovery", "loop"],
  },
  {
    id: "disaster-recovery",
    name: "Disaster Recovery",
    category: "Data & Backup",
    description: "Business continuity and disaster recovery",
    tags: ["DR", "recovery", "failover", "continuity"],
  },
  {
    id: "high-availability",
    name: "High Availability",
    category: "Data & Backup",
    description: "Redundant high-availability systems",
    tags: ["HA", "uptime", "redundancy", "failover"],
  },
  // Services & Business
  {
    id: "analytics-dash",
    name: "Analytics Dashboard",
    category: "Services & Business",
    description: "Business intelligence and performance metrics",
    tags: ["analytics", "dashboard", "metrics", "charts"],
  },
  {
    id: "automation-gear",
    name: "IT Automation",
    category: "Services & Business",
    description: "Automated IT workflow and process orchestration",
    tags: ["automation", "gears", "workflow", "orchestration"],
  },
  {
    id: "managed-services",
    name: "Managed Services",
    category: "Services & Business",
    description: "Fully managed enterprise IT services",
    tags: ["managed", "services", "IT", "support"],
  },
  {
    id: "global-network",
    name: "Global Network",
    category: "Services & Business",
    description: "Enterprise global network connectivity",
    tags: ["network", "global", "connectivity", "nodes"],
  },
];

export function getIllustration(id: string): IllustrationMeta | undefined {
  return ILLUSTRATIONS.find((ill) => ill.id === id);
}

export function getIllustrationsByCategory(category: string): IllustrationMeta[] {
  if (category === "All") return ILLUSTRATIONS;
  return ILLUSTRATIONS.filter((ill) => ill.category === category);
}
