/**
 * Shared CMS content blocks — edit once on site-settings, reuse across pages.
 *
 * Keys live under the `shared_blocks` section on the `site-settings` page.
 * Page sections can set `use_shared: "proof_labels" | "partners" | "final_cta"`
 * (or omit local copy) to pull from the shared source.
 */

export type SharedBlockKey = "proof_labels" | "partners" | "final_cta";

export interface SharedBlocksContent {
  proof_labels?: string[];
  partners?: Array<string | { name?: string; logo_src?: string; logoSrc?: string }>;
  final_cta?: {
    heading?: string;
    description?: string;
    cta_primary?: { label: string; href: string };
    cta_secondary?: { label: string; href: string };
  };
}

export const DEFAULT_SHARED_BLOCKS: SharedBlocksContent = {
  proof_labels: [
    "35+ Years Enterprise IT",
    "SOC 2 Type II Certified",
    "99.99% Uptime SLA",
    "24/7/365 NOC + SOC",
    "IBM Business Partner Since 1990",
    "US-Based Support Team",
    "IBM Power & IBM i Specialists",
    "Hybrid & Private Cloud",
    "Defined RPO / RTO Targets",
    "Tier-3 Data Centers",
    "Zero-Trust Security",
    "500+ Enterprise Clients",
    "Flash Systems Storage",
    "Boca Raton Headquarters",
    "PCI & HIPAA Ready Environments",
    "Dedicated Account Management",
  ],
  partners: [
    { name: "IBM", logo_src: "/images/v3/b_1.png" },
    { name: "Lenovo", logo_src: "/images/v3/b_2.png" },
    { name: "Cisco", logo_src: "/images/v3/b_3.png" },
    { name: "Dell", logo_src: "/images/v3/b_4.png" },
  ],
  final_cta: {
    heading: "Ready to Modernize Your IT Infrastructure?",
    description:
      "Talk with an ICE specialist about managed cloud, data protection, security, and IBM Power environments.",
    cta_primary: { label: "Speak to an Expert", href: "/contact" },
    cta_secondary: { label: "Call 1-800-786-9188", href: "tel:18007869188" },
  },
};

/** Merge site-settings shared_blocks with hardcoded defaults. */
export function resolveSharedBlocks(
  settingsSections?: Record<string, unknown> | null,
): SharedBlocksContent {
  const raw = (settingsSections?.shared_blocks ?? {}) as SharedBlocksContent;
  return {
    proof_labels:
      Array.isArray(raw.proof_labels) && raw.proof_labels.length > 0
        ? raw.proof_labels
        : DEFAULT_SHARED_BLOCKS.proof_labels,
    partners:
      Array.isArray(raw.partners) && raw.partners.length > 0
        ? raw.partners
        : DEFAULT_SHARED_BLOCKS.partners,
    final_cta: {
      ...DEFAULT_SHARED_BLOCKS.final_cta,
      ...(raw.final_cta ?? {}),
      cta_primary: raw.final_cta?.cta_primary ?? DEFAULT_SHARED_BLOCKS.final_cta?.cta_primary,
      cta_secondary: raw.final_cta?.cta_secondary ?? DEFAULT_SHARED_BLOCKS.final_cta?.cta_secondary,
    },
  };
}

/**
 * Prefer page-local content; fall back to a named shared block when local is empty
 * or when `use_shared` matches the block key.
 */
export function withSharedFallback<T>(
  local: T | undefined | null,
  shared: T | undefined,
  useShared?: string | boolean,
  blockKey?: SharedBlockKey,
): T | undefined {
  if (useShared === true || (blockKey && useShared === blockKey)) {
    return shared ?? local ?? undefined;
  }
  if (local == null) return shared;
  if (Array.isArray(local) && local.length === 0) return shared;
  return local;
}
