// ─── CMS Section Content JSONB Shapes ────────────────────────────────────────
// Each interface describes the shape of the `content` jsonb column
// for a specific section_type / section_key.

import type { SalesEnablementConfig } from "@/lib/salesEnablement";

export interface HeroSectionContent {
  badge?: string;
  heading: string;
  headingHighlight?: string;
  subheading: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  videoUrl?: string;
  posterUrl?: string;
  backgroundImageUrl?: string;
}

export interface StatsSectionContent {
  label: string;
  heading: string;
  items: {
    value: number;
    suffix: string;
    label: string;
    icon: string;
  }[];
}

export interface ServicesGridContent {
  label: string;
  heading: string;
  items: {
    icon: string;
    title: string;
    description: string;
    href: string;
    gradient: string;
    glowColor: string;
  }[];
}

export interface TimelineSectionContent {
  heading: string;
  items: {
    year: string;
    title: string;
    description: string;
  }[];
}

export interface DataCentersSectionContent {
  image: string;
  badge: string;
  heading: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
}

export interface PartnersMarqueeContent {
  partners: {
    name: string;
    logoSrc?: string;
  }[];
}

export interface IndustriesSectionContent {
  heading: string;
  items: {
    name: string;
    icon: string;
  }[];
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

export interface TrustBadgesContent {
  heading: string;
  items: {
    title: string;
    value: string;
    description: string;
    icon: string;
  }[];
}

export interface MetricsSectionContent {
  heading: string;
  subheading?: string;
}

export interface CtaSectionContent {
  heading: string;
  description: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string; isPhone?: boolean };
}

export interface SolutionHeroContent {
  badge: string;
  badgeIcon: string;
  title: string;
  titleGradient: string;
  subtitle: string;
  heroComponent: string;
}

export interface SolutionFeaturesContent {
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface SolutionProcessContent {
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
}

export interface SolutionBenefitsContent {
  benefits: {
    text: string;
  }[];
}

export interface SolutionMetricsContent {
  preset: string;
}

export interface FAQSectionContent {
  items: {
    question: string;
    answer: string;
  }[];
}

export interface PartnerCardsContent {
  partners: {
    name: string;
    description: string;
    logoSrc: string;
    specializations: string[];
    partnerSince: string;
    fullWidth?: boolean;
  }[];
}

export interface ContactInfoContent {
  items: {
    icon: string;
    title: string;
    value: string;
    href?: string;
    isLive?: boolean;
  }[];
}

// ─── Union type covering all section content shapes ─────────────────────────

export type SectionContent =
  | HeroSectionContent
  | StatsSectionContent
  | ServicesGridContent
  | TimelineSectionContent
  | DataCentersSectionContent
  | PartnersMarqueeContent
  | IndustriesSectionContent
  | TrustBadgesContent
  | MetricsSectionContent
  | CtaSectionContent
  | SolutionHeroContent
  | SolutionFeaturesContent
  | SolutionProcessContent
  | SolutionBenefitsContent
  | SolutionMetricsContent
  | FAQSectionContent
  | PartnerCardsContent
  | ContactInfoContent
  | SalesEnablementConfig;
