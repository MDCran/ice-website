"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  Cloud01,
  CpuChip01,
  Database01,
  Dataflow01,
  HardDrive,
  Lock01,
  MessageChatCircle,
  Monitor01,
  Phone01,
  RefreshCcw01,
  Scan,
  Server01,
  Settings01,
  Shield01,
  ShieldTick,
  ShieldZap,
  Target04,
  Zap,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { resolveIcon } from "@/lib/iconMap";
import { serviceImageFor } from "@/lib/solutionHeroImages";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { SolutionFinderPromo } from "@/components/marketing/SolutionFinder";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";
import { experienceFor } from "@/lib/solutionExperience";
import SolutionComparisonMatrix, {
  type SolutionComparisonContent,
} from "@/components/solutions/SolutionComparisonMatrix";
import StickySolutionCta from "@/components/marketing/StickySolutionCta";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import type { SolutionCatalogItem } from "@/lib/cms/solutionCatalog";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type CatalogIcon = ComponentProps<typeof FeaturedIcon>["icon"];
type CtaContent = { label?: string; href?: string };

interface BuyerSignal {
  value: string;
  label: string;
  detail: string;
}

interface CatalogServiceInput {
  title?: string;
  href?: string;
  icon?: CatalogIcon | string;
  desc?: string;
  description?: string;
  industries?: string[];
  platforms?: string[];
  outcome?: string;
  link_label?: string;
  hero_image?: string;
  heroImage?: string;
  background_image?: string;
  backgroundImage?: string;
  image?: string;
  image_src?: string;
  imageSrc?: string;
  image_alt?: string;
  imageAlt?: string;
  tags?: string[];
}

interface CatalogService {
  title: string;
  href: string;
  icon?: CatalogIcon;
  desc: string;
  industries?: string[];
  platforms?: string[];
  outcome?: string;
  link_label?: string;
  hero_image?: string;
  heroImage?: string;
  background_image?: string;
  backgroundImage?: string;
  image?: string;
  image_src?: string;
  imageSrc?: string;
  image_alt?: string;
  imageAlt?: string;
  tags?: string[];
  /** Live catalog rows never fall back to legacy slug metadata. */
  authoritative?: boolean;
}

interface CatalogCategoryInput {
  title?: string;
  description?: string;
  icon?: CatalogIcon | string;
  services?: CatalogServiceInput[];
}

interface CatalogCategory {
  title: string;
  description: string;
  icon?: CatalogIcon;
  services: CatalogService[];
}

interface HeroContent {
  eyebrow?: string;
  badge?: string;
  headline?: string;
  subheadline?: string;
  cta_primary?: CtaContent;
  ctaPrimary?: CtaContent;
  cta_secondary?: CtaContent;
  ctaSecondary?: CtaContent;
  buyer_signals?: BuyerSignal[];
  next_steps?: string[];
  buyer_panel?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    cta_primary?: CtaContent;
    cta_secondary?: CtaContent;
  };
}

interface FinderPromoContent {
  eyebrow?: string;
  heading?: string;
  cta?: CtaContent;
}

interface ScopingCtaContent {
  eyebrow?: string;
  heading?: string;
  description?: string;
  cta_primary?: CtaContent;
  cta_secondary?: CtaContent;
}

interface CatalogControlsContent {
  eyebrow?: string;
  heading?: string;
  count_prefix?: string;
  count_suffix?: string;
  industry_label?: string;
  industry_options?: string[];
  platform_label?: string;
  platform_options?: string[];
}

interface FinalCtaContent {
  heading?: string;
  description?: string;
  proof_labels?: string[];
  cta_primary?: CtaContent;
  ctaPrimary?: CtaContent;
  cta_secondary?: CtaContent;
  ctaSecondary?: CtaContent;
}

interface StickyCtaContent {
  enabled?: boolean;
  title?: string;
  cta?: CtaContent;
}

function objectContent<T extends object>(value: unknown): Partial<T> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<T>)
    : {};
}

function textValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringList(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

function normalizeService(value: unknown): CatalogService {
  const service = objectContent<CatalogServiceInput>(value);
  return {
    title: textValue(service.title) ?? "",
    href: textValue(service.href) ?? "",
    icon:
      typeof service.icon === "string"
        ? resolveIcon(service.icon)
        : service.icon,
    desc:
      textValue(service.desc) ?? textValue(service.description) ?? "",
    industries: stringList(service.industries),
    platforms: stringList(service.platforms),
    outcome: textValue(service.outcome),
    link_label: textValue(service.link_label),
    hero_image: textValue(service.hero_image),
    heroImage: textValue(service.heroImage),
    background_image: textValue(service.background_image),
    backgroundImage: textValue(service.backgroundImage),
    image: textValue(service.image),
    image_src: textValue(service.image_src),
    imageSrc: textValue(service.imageSrc),
    image_alt: textValue(service.image_alt),
    imageAlt: textValue(service.imageAlt),
    tags: stringList(service.tags),
  };
}

function normalizeCategory(value: unknown): CatalogCategory {
  const category = objectContent<CatalogCategoryInput>(value);
  return {
    title: textValue(category.title) ?? "",
    description: textValue(category.description) ?? "",
    icon:
      typeof category.icon === "string"
        ? resolveIcon(category.icon)
        : category.icon,
    services: Array.isArray(category.services)
      ? category.services.map(normalizeService)
      : [],
  };
}

function normalizeBuyerSignals(value: unknown): BuyerSignal[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const signal = objectContent<BuyerSignal>(item);
    return {
      value: textValue(signal.value) ?? "",
      label: textValue(signal.label) ?? "",
      detail: textValue(signal.detail) ?? "",
    };
  });
}

function categoryKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * Group the canonical published service collection using the overview page's
 * CMS category rows for category order/copy. Service membership and card data
 * always come from the live catalog so unpublished or deleted pages disappear.
 */
function categoriesFromCatalog(
  catalog: SolutionCatalogItem[],
  definitions: CatalogCategoryInput[],
): CatalogCategory[] {
  const sortedCatalog = catalog
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  const grouped = new Map<string, { category: CatalogCategory; firstOrder: number }>();

  for (const item of sortedCatalog) {
    const title = item.category.trim() || "Solutions";
    const key = categoryKey(title);
    const existing = grouped.get(key);
    const service: CatalogService = {
      title: item.title,
      href: item.href,
      icon: resolveIcon(item.icon),
      desc: item.card_description,
      industries: item.industries,
      platforms: item.platforms,
      outcome: item.outcome,
      link_label: item.link_label,
      hero_image: item.card_image,
      image_alt: item.card_image_alt,
      tags: item.tags,
      authoritative: true,
    };

    if (existing) {
      existing.category.services.push(service);
      continue;
    }

    grouped.set(key, {
      firstOrder: item.sort_order,
      category: {
        title,
        description: item.category_description,
        icon: resolveIcon(item.category_icon || item.icon),
        services: [service],
      },
    });
  }

  const ordered: CatalogCategory[] = [];
  const used = new Set<string>();
  for (const definitionValue of definitions) {
    const definition = objectContent<CatalogCategoryInput>(definitionValue);
    const title = textValue(definition.title) ?? "";
    const key = categoryKey(title);
    const match = grouped.get(key);
    if (!match || used.has(key)) continue;
    used.add(key);
    ordered.push({
      ...match.category,
      title: title || match.category.title,
      description:
        textValue(definition.description) ?? match.category.description,
      icon:
        typeof definition.icon === "string"
          ? resolveIcon(definition.icon)
          : definition.icon ?? match.category.icon,
    });
  }

  const remaining = [...grouped.entries()]
    .filter(([key]) => !used.has(key))
    .sort(
      ([, a], [, b]) =>
        a.firstOrder - b.firstOrder ||
        a.category.title.localeCompare(b.category.title),
    )
    .map(([, value]) => value.category);

  return [...ordered, ...remaining];
}

const AS400_SERVICE = {
  title: "AS400 Hosting",
  href: "/solutions/as400",
  icon: Server01,
  desc: "AS400, AS/400, iSeries, and IBM i hosting, support, security, backup, high availability, and disaster recovery.",
};

const DEFAULT_CATEGORIES = [
  {
    title: "Managed Cloud Services",
    description: "Scalable, reliable cloud infrastructure tailored to enterprise workloads.",
    icon: Cloud01,
    services: [
      { title: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting", icon: Cloud01, desc: "Enterprise-grade cloud hosting with 24/7 management and support." },
      { title: "Managed Private Cloud", href: "/solutions/managed-private-cloud", icon: Server01, desc: "Dedicated private cloud environments built for security and compliance." },
      { title: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud", icon: Database01, desc: "Seamlessly bridge on-premises and cloud infrastructure." },
      { title: "Cloud Migration Services", href: "/solutions/cloud-migration", icon: RefreshCcw01, desc: "Zero-downtime migration strategy and execution for any workload." },
    ],
  },
  {
    title: "Managed Data Protection",
    description: "Comprehensive data resilience and business continuity strategies.",
    icon: Shield01,
    services: [
      { title: "Backup as a Service", href: "/solutions/backup-as-a-service", icon: HardDrive, desc: "Automated, encrypted backups with rapid restore capabilities." },
      { title: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery", icon: RefreshCcw01, desc: "Full disaster recovery with guaranteed RTOs and RPOs." },
      { title: "High Availability as a Service", href: "/solutions/high-availability", icon: Database01, desc: "Real-time replication and automatic failover for critical systems." },
      { title: "Ransomware Recovery", href: "/solutions/ransomware-recovery", icon: ShieldZap, desc: "Immutable backups and rapid recovery from ransomware attacks." },
    ],
  },
  {
    title: "Managed Security",
    description: "End-to-end cybersecurity for the modern enterprise threat landscape.",
    icon: Lock01,
    services: [
      { title: "IBM i Security", href: "/solutions/ibm-i-security", icon: ShieldTick, desc: "Comprehensive security assessments and hardening for IBM i environments." },
      { title: "Protection Suite", href: "/solutions/protection-suite", icon: Shield01, desc: "Multi-layered endpoint and network protection suite." },
      { title: "Security Monitoring", href: "/solutions/security-monitoring", icon: Activity, desc: "24/7 SOC monitoring with real-time threat intelligence." },
      { title: "Threat Detection & Response", href: "/solutions/threat-detection", icon: Target04, desc: "Advanced threat hunting and automated incident response." },
      { title: "Endpoint Security", href: "/solutions/endpoint-security", icon: Scan, desc: "Next-gen endpoint protection with AI-driven threat prevention." },
    ],
  },
  {
    title: "Managed Services",
    description: "Fully managed IT operations so you can focus on your business.",
    icon: Server01,
    services: [
      AS400_SERVICE,
      { title: "Managed Microsoft Services", href: "/solutions/managed-microsoft", icon: Monitor01, desc: "Complete Microsoft 365 and Azure management and optimization." },
      { title: "Automation Suite", href: "/solutions/automation-suite", icon: Dataflow01, desc: "AI-powered patch management, vulnerability remediation, and security automation." },
      { title: "Systems Management", href: "/solutions/systems-management", icon: Settings01, desc: "Proactive monitoring, patching, and performance management." },
      { title: "IBM Power VS", href: "/solutions/ibm-power-vs", icon: CpuChip01, desc: "IBM Power Virtual Server management in the cloud." },
    ],
  },
];

/** Thin brand hairline separating major sections. */
function BrandHairline() {
  return (
    <div
      aria-hidden="true"
      className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
    />
  );
}

const SOLUTIONS_CONSULT_HREF =
  "/contact?service=Solution%20Architecture%20Review&source=solutions_index";

const BUYER_SIGNALS = [
  {
    value: "35+",
    label: "years in enterprise IT",
    detail: "IBM Business Partner since 1990",
  },
  {
    value: "24/7",
    label: "operations coverage",
    detail: "NOC, SOC, escalation, and managed service ownership",
  },
  {
    value: "99.99%",
    label: "target uptime SLA",
    detail: "Validated per service scope and architecture",
  },
];

const SALES_NEXT_STEPS = [
  "Current-state and risk review",
  "Recommended service path",
  "Budgetary scope and next actions",
];

export default function SolutionsPage({
  cmsData,
  orderedSections,
  catalog,
}: {
  cmsData?: Record<string, unknown>;
  orderedSections?: CMSRenderableSection[];
  catalog: SolutionCatalogItem[] | null;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const [industryFilter, setIndustryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");
    const initialPlatform =
      platform === "ibm-i" ? "IBM i" : platform === "azure" ? "Azure" : platform === "hybrid" ? "Hybrid" : null;
    if (!initialPlatform) return;
    const timer = window.setTimeout(() => setPlatformFilter(initialPlatform), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const hero = objectContent<HeroContent>(cmsData?.hero);
  const categorySection = objectContent<{ items?: CatalogCategoryInput[] }>(
    cmsData?.categories,
  );
  const categoryDefinitions = Array.isArray(categorySection.items)
    ? categorySection.items
    : [];
  const categories =
    catalog === null
      ? (
          Array.isArray(categorySection.items)
            ? categorySection.items
            : DEFAULT_CATEGORIES
        ).map(normalizeCategory)
      : categoriesFromCatalog(catalog, categoryDefinitions);
  const finderPromo = objectContent<FinderPromoContent>(
    cmsData?.finder_promo,
  );
  const comparison = objectContent<SolutionComparisonContent>(
    cmsData?.comparison,
  );
  const scopingCta = objectContent<ScopingCtaContent>(cmsData?.scoping_cta);
  const catalogControls = objectContent<CatalogControlsContent>(
    cmsData?.catalog_controls,
  );
  const finalCta = objectContent<FinalCtaContent>(
    cmsData?.final_cta ?? cmsData?.cta,
  );
  const stickyCta = objectContent<StickyCtaContent>(cmsData?.sticky_cta);
  const extraSections = (orderedSections ?? []).filter(
    (section) => !["hero", "finder_promo", "comparison", "scoping_cta", "catalog_controls", "categories", "final_cta", "cta", "sticky_cta"].includes(section.section_key)
  );
  const show = (...keys: string[]) => isCmsSectionVisible(orderedSections, ...keys);
  const buyerSignals =
    hero.buyer_signals !== undefined
      ? normalizeBuyerSignals(hero.buyer_signals)
      : BUYER_SIGNALS;
  const salesNextSteps =
    hero.next_steps !== undefined
      ? (stringList(hero.next_steps) ?? [])
      : SALES_NEXT_STEPS;

  const hidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const visible = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      services: category.services.filter((service) => {
        const slug = String(service.href ?? "").split("/").filter(Boolean).at(-1) ?? "";
        const experience = experienceFor(slug);
        const industries = Array.isArray(service.industries)
          ? service.industries
          : service.authoritative
            ? []
            : experience.industries;
        const platforms = Array.isArray(service.platforms)
          ? service.platforms
          : service.authoritative
            ? []
            : experience.platforms;
        return (
          (industryFilter === "All" || industries.includes(industryFilter)) &&
          (platformFilter === "All" || platforms.includes(platformFilter))
        );
      }),
    }))
    .filter((category) => category.services.length > 0);
  const visibleCount = filteredCategories.reduce(
    (total, category) => total + category.services.length,
    0,
  );
  const industryOptions = [
    "All",
    ...new Set([
      ...(catalogControls.industry_options ?? ["Manufacturing", "Finance", "Healthcare"])
        .filter((option) => option !== "All"),
      ...(catalog === null
        ? []
        : categories.flatMap((category) =>
            category.services.flatMap((service) => service.industries ?? []),
          )),
    ]),
  ];
  const platformOptions = [
    "All",
    ...new Set([
      ...(catalogControls.platform_options ?? ["IBM i", "Azure", "Hybrid"])
        .filter((option) => option !== "All"),
      ...(catalog === null
        ? []
        : categories.flatMap((category) =>
            category.services.flatMap((service) => service.platforms ?? []),
          )),
    ]),
  ];

  return (
    <main className="bg-primary">
      {/* Page header — distinct hero band, not flat paper */}
      {show("hero") && <section
        id="solutions-hero"
        className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32"
      >
        {/* Engineering-grid texture, fading out from the top of the band */}
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        {/* Film-grain finish over the band */}
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
        />
        {/* Ambient brand orbs — slow continuous drift */}
        <BrandOrbs />

        <div className="relative mx-auto grid max-w-container gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)] lg:items-center">
          <motion.div
            initial={hidden}
            animate={visible}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex max-w-4xl flex-col items-start text-left"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
              {hero.eyebrow ?? hero.badge ?? "Our Solutions"}
            </span>
            <h1 className="mt-3 max-w-4xl text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              {hero.headline ?? "Enterprise Technology Solutions"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-tertiary md:mt-6 md:text-xl">
              {hero.subheadline ??
                "From cloud infrastructure to cybersecurity, we deliver end-to-end solutions engineered for reliability, performance, and scale."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="xl" href={hero.cta_primary?.href ?? hero.ctaPrimary?.href ?? SOLUTIONS_CONSULT_HREF} iconTrailing={ArrowRight}>
                {hero.cta_primary?.label ?? hero.ctaPrimary?.label ?? "Talk to an architect"}
              </Button>
              <Button color="secondary" size="xl" href={hero.cta_secondary?.href ?? hero.ctaSecondary?.href ?? "/solutions/find"} iconLeading={Target04}>
                {hero.cta_secondary?.label ?? hero.ctaSecondary?.label ?? "Use guided finder"}
              </Button>
            </div>
            <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
              {buyerSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-lg bg-primary/70 p-4 ring-1 ring-secondary backdrop-blur"
                >
                  <p className="text-display-xs font-semibold tracking-tight text-primary">{signal.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-secondary">{signal.label}</p>
                  <p className="mt-2 text-xs leading-5 text-tertiary">{signal.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={hidden}
            animate={visible}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="relative isolate overflow-hidden rounded-lg bg-primary/80 p-6 ring-1 ring-secondary backdrop-blur-xl dark:shadow-[0_0_40px_rgb(4_155_251/0.12)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.08] via-transparent to-brand-600/[0.06]"
            />
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-white shadow-[0_0_24px_rgb(4_155_251/0.25)]">
                <MessageChatCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
                  {hero.buyer_panel?.eyebrow ?? "Buyer-ready next step"}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-primary">
                  {hero.buyer_panel?.heading ?? "Turn requirements into a scoped service plan."}
                </h2>
                <p className="mt-2 text-sm leading-6 text-tertiary">
                  {hero.buyer_panel?.description ?? "ICE architects help qualify the best-fit solution, deployment path, risk profile, and budgetary next step."}
                </p>
              </div>
            </div>
            <ol className="mt-6 space-y-3">
              {salesNextSteps.map((step: string, index: number) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-brand-secondary ring-1 ring-secondary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-secondary">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Button size="md" href={hero.buyer_panel?.cta_primary?.href ?? SOLUTIONS_CONSULT_HREF} iconLeading={Calendar} className="justify-center">
                {hero.buyer_panel?.cta_primary?.label ?? "Book review"}
              </Button>
              <Button color="secondary" size="md" href={hero.buyer_panel?.cta_secondary?.href ?? "tel:18007869188"} iconLeading={Phone01} className="justify-center">
                {hero.buyer_panel?.cta_secondary?.label ?? "Call ICE"}
              </Button>
            </div>
          </motion.aside>
        </div>
      </section>}

      {show("finder_promo") && <section className="border-b border-secondary bg-primary py-10 md:py-12">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <SolutionFinderPromo eyebrow={finderPromo.eyebrow} heading={finderPromo.heading} cta={finderPromo.cta} />
        </div>
      </section>}

      {show("comparison") && <SolutionComparisonMatrix content={comparison} />}

      {show("scoping_cta") && <section className="border-b border-secondary bg-secondary py-8 md:py-10">
        <div className="mx-auto grid max-w-container gap-6 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-white ring-1 ring-brand/20">
              <CheckCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
                {scopingCta.eyebrow ?? "Sales-ready scoping"}
              </p>
              <h2 className="mt-2 text-display-xs font-semibold tracking-tight text-primary">
                {scopingCta.heading ?? "Get a shortlist your team can actually evaluate."}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-tertiary">
                {scopingCta.description ?? "Use the finder, compare solution families, or send your requirements to ICE for an architect-led recommendation with fit, risk, and budget guidance."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <Button href={scopingCta.cta_primary?.href ?? SOLUTIONS_CONSULT_HREF} size="lg" iconTrailing={ArrowRight}>
              {scopingCta.cta_primary?.label ?? "Request scoped recommendation"}
            </Button>
            <Button href={scopingCta.cta_secondary?.href ?? "tel:18007869188"} size="lg" color="secondary" iconLeading={Phone01}>
              {scopingCta.cta_secondary?.label ?? "1-800-786-9188"}
            </Button>
          </div>
        </div>
      </section>}

      {show("catalog_controls", "categories") && <section className="border-b border-secondary bg-primary py-7 md:py-8">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(520px,1fr)] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">{catalogControls.eyebrow ?? "Who this is for"}</p>
              <h2 className="mt-2 text-display-xs font-semibold text-primary">{catalogControls.heading ?? "Narrow the catalog live"}</h2>
              <p className="mt-2 text-sm text-tertiary" aria-live="polite">
                {(catalogControls.count_prefix ?? "Showing")} {visibleCount} solution{visibleCount === 1 ? "" : "s"} {catalogControls.count_suffix ?? "for this environment."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-full lg:max-w-2xl lg:justify-self-end">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold tracking-wide text-quaternary uppercase">{catalogControls.industry_label ?? "Industry"}</legend>
                <div className="flex flex-wrap gap-2">
                  {industryOptions.map((filter: string) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={industryFilter === filter}
                      onClick={() => setIndustryFilter(filter)}
                      className={cx(
                        "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                        industryFilter === filter
                          ? "bg-brand-solid text-white ring-brand"
                          : "bg-secondary text-secondary ring-secondary hover:ring-brand",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-xs font-semibold tracking-wide text-quaternary uppercase">{catalogControls.platform_label ?? "Platform"}</legend>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((filter: string) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={platformFilter === filter}
                      onClick={() => setPlatformFilter(filter)}
                      className={cx(
                        "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                        platformFilter === filter
                          ? "bg-brand-solid text-white ring-brand"
                          : "bg-secondary text-secondary ring-secondary hover:ring-brand",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </section>}

      {/* Solution categories — alternating surfaces give the page rhythm */}
      {show("categories") && filteredCategories.map((cat, catIdx) => (
        <section
          key={cat.title}
          className={cx(
            "relative isolate overflow-hidden py-16 md:py-24",
            catIdx % 2 === 1 ? "border-y border-secondary bg-secondary" : "bg-primary"
          )}
        >
          {/* Subtle texture layer — dots on raised bands, grid corners on base bands */}
          {catIdx % 2 === 1 ? (
            <div
              aria-hidden="true"
              className="texture-dots pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_65%)]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_bottom_right,black_5%,transparent_55%)]"
            />
          )}

          <div className="mx-auto max-w-container px-4 md:px-8">
            <motion.div
              initial={hidden}
              {...(catIdx === 0
                ? { animate: visible }
                : { whileInView: visible, viewport: { once: true, margin: "-80px" } })}
              transition={{ duration: 0.6, ease: EASE, delay: catIdx === 0 ? 0.15 : 0 }}
              className="flex max-w-3xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"
            >
              <FeaturedIcon icon={cat.icon} size="xl" color="brand" theme="light" />
              <div>
                <h2 className="text-display-sm font-semibold tracking-tight text-primary">{cat.title}</h2>
                <p className="mt-1 text-lg text-tertiary">{cat.description}</p>
              </div>
            </motion.div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-12 md:gap-6">
              {cat.services.map((svc, i) => {
                const serviceImage = svc.authoritative
                  ? (svc.hero_image?.trim() || undefined)
                  : serviceImageFor(svc);
                const slug = String(svc.href ?? "").split("/").filter(Boolean).at(-1) ?? "";
                const serviceExperience = experienceFor(slug);
                const serviceOutcome =
                  svc.outcome ??
                  (svc.authoritative ? "" : serviceExperience.outcome);
                const servicePlatforms = Array.isArray(svc.platforms)
                  ? svc.platforms
                  : svc.authoritative
                    ? []
                    : serviceExperience.platforms;
                const serviceTags = Array.isArray(svc.tags) ? svc.tags : [];
                const serviceBadges = [...new Set([...servicePlatforms, ...serviceTags])].slice(0, 4);

                return (
                  <motion.div
                    key={svc.title}
                    initial={hidden}
                    {...(catIdx === 0
                      ? { animate: visible }
                      : { whileInView: visible, viewport: { once: true, margin: "-80px" } })}
                    transition={{ duration: 0.5, ease: EASE, delay: catIdx === 0 ? 0.25 + i * 0.06 : i * 0.06 }}
                    className="h-full"
                  >
                    <Link
                      href={svc.href}
                      aria-label={serviceOutcome ? `${svc.title}: ${serviceOutcome}` : svc.title}
                      className="group relative isolate flex h-full min-h-64 overflow-hidden rounded-lg border border-secondary bg-primary p-6 shadow-xs transition duration-200 ease-out hover:border-brand hover:shadow-lg motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
                    >
                      {/* Right-side hero wash — faint at rest, clearer on hover (no pan/zoom) */}
                      {serviceImage && (
                        <div
                          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[58%] overflow-hidden sm:w-[62%]"
                        >
                          <img
                            src={serviceImage}
                            alt={svc.image_alt ?? svc.imageAlt ?? ""}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full translate-x-[12%] object-cover object-center opacity-[0.18] transition-opacity duration-500 ease-out group-hover:opacity-[0.55] dark:opacity-[0.22] dark:group-hover:opacity-[0.62]"
                          />
                          {/* Soft left fade so the image blends into the card — stronger in light mode */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] from-0% via-[var(--color-bg-primary)]/90 via-35% to-transparent to-85%" />
                          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/40 via-transparent to-[var(--color-bg-primary)]/50 dark:from-[var(--color-bg-primary)]/20 dark:to-[var(--color-bg-primary)]/30" />
                        </div>
                      )}

                      <div className="relative z-10 flex h-full max-w-[70%] flex-col items-start sm:max-w-[74%]">
                        <FeaturedIcon icon={svc.icon} size="lg" color="brand" theme="light" />
                        <h3 className="mt-4 text-lg font-semibold text-primary">{svc.title}</h3>
                        <p className="mt-1 flex-1 text-md text-tertiary">{svc.desc}</p>
                        {serviceOutcome && (
                          <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-brand-secondary">
                            {serviceOutcome}
                          </p>
                        )}
                        {serviceBadges.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">
                          {serviceBadges.map((label: string) => (
                            <span
                              key={label}
                              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-tertiary ring-1 ring-secondary"
                            >
                              {label}
                            </span>
                          ))}
                        </div>}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary transition duration-150 ease-linear group-hover:gap-2.5">
                          {svc.link_label ?? "Learn more"}
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      <GenericCMSSections sections={extraSections} />

      <BrandHairline />

      {/* CTA — soft secondary card so it never reads as a loud blue wash */}
      {show("final_cta", "cta") && <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative isolate overflow-hidden rounded-lg bg-secondary px-6 py-12 ring-1 ring-secondary ring-inset lg:p-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.08)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.08] via-transparent to-brand-600/[0.06]"
            />
            <div
              aria-hidden="true"
              className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
            />
            <Zap
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-12 -z-10 size-56 -rotate-12 text-brand-500/10 md:size-72"
            />
            <BrandOrbs />

            <div className="flex flex-col gap-x-8 gap-y-8 lg:flex-row lg:items-center">
              <div className="flex max-w-3xl flex-1 flex-col">
                <h2 className="text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
                  {finalCta.heading ?? "Need a Custom Solution?"}
                </h2>
                <p className="mt-4 text-lg text-tertiary md:mt-5">
                  {finalCta.description ??
                    "Our enterprise architects will design a tailored solution that fits your business requirements and budget."}
                </p>
                <ul className="mt-6 grid gap-2 text-sm text-secondary sm:grid-cols-3">
                  {(finalCta.proof_labels ?? ["30-minute discovery", "Budgetary fit guidance", "Clear next steps"]).map((item: string) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                <Button
                  size="xl"
                  href={finalCta.cta_primary?.href ?? finalCta.ctaPrimary?.href ?? SOLUTIONS_CONSULT_HREF}
                  iconTrailing={ArrowRight}
                >
                  {finalCta.cta_primary?.label ?? finalCta.ctaPrimary?.label ?? "Contact Our Team"}
                </Button>
                <Button size="xl" color="secondary" href={finalCta.cta_secondary?.href ?? finalCta.ctaSecondary?.href ?? "tel:18007869188"} iconLeading={Phone01}>
                  {finalCta.cta_secondary?.label ?? finalCta.ctaSecondary?.label ?? "Call 1-800-786-9188"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>}
      {show("sticky_cta") && stickyCta.enabled !== false && <StickySolutionCta
        title={stickyCta.title ?? "Need help choosing a solution?"}
        consultHref={stickyCta.cta?.href ?? SOLUTIONS_CONSULT_HREF}
        consultLabel={stickyCta.cta?.label ?? "Book solution review"}
        heroId="solutions-hero"
      />}
    </main>
  );
}
