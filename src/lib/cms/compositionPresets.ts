/**
 * Page composition presets — starter section stacks so solution / marketing
 * pages don't all reuse the same features→benefits→process→faq→cta pattern.
 */

export type CompositionPresetId =
  | "solution-classic"
  | "solution-proof-first"
  | "solution-geo-dense"
  | "solution-narrative"
  | "marketing-story"
  | "conversion-focused";

export interface CompositionPreset {
  id: CompositionPresetId;
  label: string;
  description: string;
  /** Applies to these page_type values (empty = all). */
  pageTypes?: string[];
  /** Ordered template ids from SECTION_TEMPLATES. */
  templateIds: string[];
}

export const PAGE_COMPOSITION_PRESETS: CompositionPreset[] = [
  {
    id: "solution-classic",
    label: "Solution — Classic",
    description: "Hero, features, benefits, process, FAQ, CTA — the proven layout.",
    pageTypes: ["solution"],
    templateIds: [
      "hero",
      "solution-features",
      "solution-benefits",
      "solution-process",
      "solution-faq",
      "solution-cta",
      "solution-related",
    ],
  },
  {
    id: "solution-proof-first",
    label: "Solution — Proof first",
    description: "Lead with stats and ROI, then capabilities and FAQ.",
    pageTypes: ["solution"],
    templateIds: [
      "hero",
      "solution-stats",
      "roi",
      "value-props",
      "solution-features",
      "solution-faq",
      "solution-cta",
    ],
  },
  {
    id: "solution-geo-dense",
    label: "Solution — GEO dense",
    description:
      "Fact-dense stack for AEO/GEO: SLA table, comparison, case study, FAQ, related.",
    pageTypes: ["solution"],
    templateIds: [
      "hero",
      "sla-table",
      "comparison",
      "case-study",
      "solution-features",
      "solution-faq",
      "solution-related",
      "solution-cta",
    ],
  },
  {
    id: "solution-narrative",
    label: "Solution — Narrative",
    description: "Banner story, use cases, process, related — less grid repetition.",
    pageTypes: ["solution"],
    templateIds: [
      "hero",
      "solution-banner",
      "solution-use-cases",
      "solution-process",
      "solution-benefits",
      "solution-related",
      "solution-cta",
    ],
  },
  {
    id: "marketing-story",
    label: "Marketing — Story",
    description: "Hero, timeline, differentiators, partners, industries CTA.",
    pageTypes: ["static"],
    templateIds: ["hero-generic", "intro", "timeline", "differentiators", "partners-grid", "industries-cta", "final-cta"],
  },
  {
    id: "conversion-focused",
    label: "Conversion — Focused",
    description: "Minimal stack aimed at contact: hero, value props, FAQ, CTA.",
    pageTypes: ["static", "solution"],
    templateIds: ["hero", "value-props", "solution-faq", "final-cta"],
  },
];

export function presetsForPageType(pageType: string): CompositionPreset[] {
  return PAGE_COMPOSITION_PRESETS.filter(
    (p) => !p.pageTypes?.length || p.pageTypes.includes(pageType),
  );
}
