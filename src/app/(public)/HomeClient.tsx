"use client";

import { useRef, type FC } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { CountUpNumber, CountUpText } from "@/components/ui/CountUpValue";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Cloud01,
  Database01,
  MessageChatCircle,
  Phone01,
  RefreshCw01,
  Server01,
  ShieldTick,
  LayersThree01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { BrandOrbs, PulseGlow } from "@/components/effects/AmbientMotion";
import ParallaxLayer from "@/components/effects/ParallaxLayer";
import SectionBloom from "@/components/effects/SectionBloom";
import OptimizedHeroMedia from "@/components/media/OptimizedHeroMedia";
import ProofTicker from "@/components/marketing/ProofTicker";
import InteractiveArchitecture from "@/components/marketing/InteractiveArchitecture";
import InfiniteMarquee from "@/components/effects/InfiniteMarquee";
import { resolveIcon } from "@/lib/iconMap";
import {
  AMBIENT_CYCLE_SECONDS,
  MOTION_EASE,
  MOTION_STAGGER,
} from "@/lib/motion";
import { useAbVariant, trackAbConversion } from "@/hooks/useAbVariant";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { FaqPreview } from "@/components/marketing/FaqHub";

type IconComponent = FC<{ className?: string }>;

/** Premium ease curve used across all entrance reveals. */
const EASE = MOTION_EASE;

/* ══════════════════════════════════════════════════════════════════════════
   PROPS — data comes from server via CMS database
   ══════════════════════════════════════════════════════════════════════════ */

export interface HomePageData {
  services_grid?: { eyebrow?: string; heading?: string; description?: string; items: { icon: string; title: string; description: string; href: string }[] };
  stats?: { eyebrow?: string; heading?: string; description?: string; items: { value: number; suffix: string; label: string }[] };
  timeline?: { eyebrow?: string; heading?: string; items: { year: string; title: string; description: string }[] };
  industries_cta?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { name: string; icon: string }[];
    cta_primary?: { label: string; href: string };
    cta_secondary?: { label: string; href: string };
    badge_note?: string;
  };
  partners_marquee?: {
    eyebrow?: string;
    heading?: string;
    partners: Array<string | { name?: string; logo_src?: string; logoSrc?: string }>;
  };
  hero?: {
    badge?: string;
    headline: string;
    headline_highlight?: string;
    headline_b?: string;
    headline_highlight_b?: string;
    subheadline: string;
    subheadline_b?: string;
    experiment_id?: string;
    cta_primary?: { label: string; href: string };
    cta_primary_b?: { label: string; href: string };
    cta_secondary?: { label: string; href: string };
    proof_labels?: string[];
  };
  data_centers?: {
    eyebrow?: string;
    heading: string;
    description: string;
    features: string[];
    badge_label?: string;
    badge_value?: string;
    cta?: { label: string; href: string };
  };
  infrastructure?: { eyebrow?: string; heading?: string; description?: string };
  trust_badges?: { eyebrow?: string; heading?: string; items: { icon: string; title: string; description: string }[] };
  metrics?: { eyebrow?: string; heading?: string; description?: string };
  final_cta?: { heading: string; description: string; cta_primary?: { label: string; href: string }; cta_secondary?: { label: string; href: string } };
}

/* ══════════════════════════════════════════════════════════════════════════
   DEFAULTS (fallback when DB has no data)
   ══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_SERVICES = [
  { icon: "Cloud", title: "Managed Cloud Services", description: "Scalable cloud hosting, private cloud, hybrid cloud, and seamless migration services for enterprise workloads.", href: "/solutions/managed-cloud-hosting" },
  { icon: "Shield", title: "Data Protection", description: "Enterprise backup, disaster recovery, high availability, and ransomware recovery to safeguard critical data.", href: "/solutions/backup-as-a-service" },
  { icon: "Lock", title: "Managed Security", description: "IBM i security, endpoint protection, threat detection, and 24/7 security monitoring for complete coverage.", href: "/solutions/ibm-i-security" },
  { icon: "Server", title: "Managed Services", description: "Microsoft services, automation, systems management, and IBM Power VS — fully managed by our experts.", href: "/solutions/managed-microsoft" },
];

const DEFAULT_STATS = [
  { value: 35, suffix: "+", label: "Years of Experience" },
  { value: 1200, suffix: "+", label: "Successful Projects" },
  { value: 500, suffix: "+", label: "Enterprise Clients" },
  { value: 99.99, suffix: "%", label: "Uptime SLA" },
];

const DEFAULT_TIMELINE = [
  { year: "1990", title: "Founded", description: "Established as an IBM Business Partner in Boca Raton, Florida." },
  { year: "2000", title: "Cloud Pioneer", description: "Early adoption of cloud infrastructure and managed hosting solutions." },
  { year: "2010", title: "Security Focus", description: "Expanded into managed security, threat detection, and data protection." },
  { year: "2020", title: "Hybrid Cloud Era", description: "Full-suite hybrid cloud, disaster recovery, and automation services." },
  { year: "2025", title: "35+ Years Strong", description: "Serving 500+ enterprises across manufacturing, finance, healthcare, and more." },
  { year: "2026", title: "Enterprise AI Innovation", description: "Delivering advanced AI receptionists, intelligent workflows, and next-generation analytics to our partners." },
];

const DEFAULT_INDUSTRIES = [
  { name: "Manufacturing", icon: "Factory" },
  { name: "Financial Services", icon: "Landmark" },
  { name: "Healthcare", icon: "HeartPulse" },
  { name: "Insurance", icon: "Shield" },
  { name: "Legal", icon: "Scale" },
];

const DEFAULT_PARTNERS: { name: string; logo_src: string }[] = [
  { name: "IBM", logo_src: "/images/v3/b_1.png" },
  { name: "Lenovo", logo_src: "/images/v3/b_2.png" },
  { name: "Cisco", logo_src: "/images/v3/b_3.png" },
  { name: "Dell", logo_src: "/images/v3/b_4.png" },
  { name: "Printronix", logo_src: "/images/v3/b_5.png" },
  { name: "Acronis", logo_src: "/images/v3/b_6.png" },
  { name: "Cybernetics", logo_src: "/images/v3/b_7.png" },
  { name: "DASCOM", logo_src: "/images/v3/b_8.png" },
];

const PARTNER_CAPABILITIES: Record<string, string> = {
  IBM: "Power & IBM i since 1990",
  Lenovo: "Enterprise compute",
  Cisco: "Secure networking",
  Dell: "Servers & storage",
  Printronix: "Industrial printing",
  Acronis: "Cyber protection",
  Cybernetics: "Backup & archive",
  DASCOM: "Document infrastructure",
};

const DECISION_PATHS = [
  {
    eyebrow: "IBM i",
    title: "I’m running IBM i",
    description: "Modernize, secure, host, or protect Power workloads without losing platform expertise.",
    href: "/solutions?platform=ibm-i",
    icon: Server01,
  },
  {
    eyebrow: "Continuity",
    title: "I need disaster recovery",
    description: "Compare backup, DR, and high availability by the recovery target your business needs.",
    href: "/solutions/disaster-recovery",
    icon: RefreshCw01,
  },
  {
    eyebrow: "Cloud operations",
    title: "I want managed cloud",
    description: "Move infrastructure responsibility to a US-based team with measurable service levels.",
    href: "/solutions/managed-cloud-hosting",
    icon: Cloud01,
  },
  {
    eyebrow: "Guided path",
    title: "I'm not sure yet",
    description: "Use the interactive finder to narrow options by urgency, platform, risk, budget, and business goals.",
    href: "/solutions/find",
    icon: MessageChatCircle,
  },
];

function normalizeMarqueePartners(
  partners: Array<string | { name?: string; logo_src?: string; logoSrc?: string }> | undefined,
): { name: string; logo_src: string }[] {
  if (!partners?.length) return DEFAULT_PARTNERS;
  return partners.map((p, i) => {
    if (typeof p === "string") {
      return {
        name: p,
        logo_src: DEFAULT_PARTNERS[i]?.logo_src ?? `/images/v3/b_${(i % 8) + 1}.png`,
      };
    }
    return {
      name: p.name?.trim() || DEFAULT_PARTNERS[i]?.name || `Partner ${i + 1}`,
      logo_src:
        p.logo_src ||
        p.logoSrc ||
        DEFAULT_PARTNERS[i]?.logo_src ||
        `/images/v3/b_${(i % 8) + 1}.png`,
    };
  });
}

/** Static proof points shown under the hero CTAs. */
/** Proof claims under the hero — long enough to fill wide viewports without gaps. */
const HERO_PROOF = [
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
];

function resolveProofLabels(cms?: string[]): string[] {
  const fromCms = (cms ?? []).map((s) => s.trim()).filter(Boolean);
  if (fromCms.length >= 10) return fromCms;
  const seen = new Set(fromCms.map((s) => s.toLowerCase()));
  const merged = [...fromCms];
  for (const item of HERO_PROOF) {
    if (!seen.has(item.toLowerCase())) merged.push(item);
  }
  return merged;
}

/** Most-requested solutions — card treatment matches /solutions. */
const POPULAR_SOLUTIONS: {
  title: string;
  href: string;
  desc: string;
  icon: IconComponent;
  image: string;
}[] = [
  {
    title: "Managed Cloud Hosting",
    href: "/solutions/managed-cloud-hosting",
    desc: "Enterprise-grade cloud hosting with 24/7 management and support.",
    icon: Cloud01,
    image: "/images/solutions/heroes/managed-cloud-hosting.webp",
  },
  {
    title: "Managed Private Cloud",
    href: "/solutions/managed-private-cloud",
    desc: "Dedicated private cloud environments built for security and compliance.",
    icon: Server01,
    image: "/images/solutions/heroes/managed-private-cloud.webp",
  },
  {
    title: "Disaster Recovery as a Service",
    href: "/solutions/disaster-recovery",
    desc: "Full disaster recovery with guaranteed RTOs and RPOs.",
    icon: RefreshCw01,
    image: "/images/solutions/heroes/disaster-recovery.webp",
  },
  {
    title: "High Availability as a Service",
    href: "/solutions/high-availability",
    desc: "Real-time replication and automatic failover for critical systems.",
    icon: Database01,
    image: "/images/solutions/heroes/high-availability.webp",
  },
  {
    title: "IBM i Security",
    href: "/solutions/ibm-i-security",
    desc: "Comprehensive security assessments and hardening for IBM i environments.",
    icon: ShieldTick,
    image: "/images/solutions/heroes/ibm-i-security.webp",
  },
];

/** Performance indicators — distinct from By The Numbers (years / projects / clients / uptime). */
const PERFORMANCE_METRICS = [
  { value: "15", suffix: " min", label: "Mean Incident Response" },
  { value: "24/7/365", label: "Always-On Operations" },
  { value: "14,723", label: "Threats Blocked (30d)" },
  { value: "0", label: "Active Threats" },
];

/* ══════════════════════════════════════════════════════════════════════════
   SHARED SECTION HEADER
   ══════════════════════════════════════════════════════════════════════════ */

function SectionHeader({
  eyebrow,
  heading,
  description,
}: {
  eyebrow?: string;
  heading: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {eyebrow && (
        <span className="text-sm font-semibold tracking-wider text-brand-secondary uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
        {heading}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — @/components/ui/CountUpValue + @/hooks/useCountUp
   ══════════════════════════════════════════════════════════════════════════ */

function StatItem({
  value,
  suffix,
  label,
  inView,
  index = 0,
  reduceMotion = false,
}: {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
  index?: number;
  reduceMotion?: boolean;
}) {
  return (
    <div
      className="flex flex-1 flex-col-reverse gap-3 text-center transition-all duration-500 ease-out"
      style={{
        opacity: reduceMotion || inView ? 1 : 0,
        transform: reduceMotion || inView ? "translateY(0)" : "translateY(16px)",
        transitionDelay:
          !reduceMotion && inView ? `${index * MOTION_STAGGER * 1000}ms` : "0ms",
      }}
    >
      <dt className="text-md font-semibold text-primary md:text-lg">{label}</dt>
      <dd className="text-display-lg font-semibold tracking-tight text-brand-tertiary_alt tabular-nums md:text-display-xl">
        <CountUpNumber target={value} suffix={suffix} inView={inView} duration={2000} />
      </dd>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════════════════════ */

export default function Home({
  data,
  orderedSections,
}: {
  data?: HomePageData;
  orderedSections?: CMSRenderableSection[];
}) {
  const reduceMotion = useHydratedReducedMotion();

  /** Entrance reveal for below-the-fold content. */
  const reveal = (delay = 0) =>
    reduceMotion
      ? {
          initial: false as const,
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" as const },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" as const },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  /** Entrance reveal for above-the-fold hero content (plays on mount). */
  const heroReveal = (delay = 0) =>
    reduceMotion
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  /* ── Resolve CMS data with fallbacks ── */
  const heroDefaults = {
    badge: "Trusted IBM Business Partner for over 35 years",
    headline: "You Know Your Business.",
    headline_highlight: "We Know Technology.",
    subheadline:
      "Together, we create innovative solutions. We support IBM Power environments, cloud infrastructure, cybersecurity, data protection, and managed services.",
    cta_primary: { label: "Call 1-800-786-9188", href: "tel:18007869188" },
    cta_secondary: { label: "Explore Solutions", href: "/solutions" },
  };
  const hero = {
    ...heroDefaults,
    ...data?.hero,
  };
  const normalizedHeroHeadline = hero.headline?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normalizedHeroHeadline === "enterprise technology redefined") {
    hero.headline = heroDefaults.headline;
    hero.headline_highlight = heroDefaults.headline_highlight;
  }

  const experimentId = data?.hero?.experiment_id?.trim() || "";
  const abEnabled = Boolean(
    experimentId &&
      (data?.hero?.headline_b?.trim() ||
        data?.hero?.headline_highlight_b?.trim() ||
        data?.hero?.cta_primary_b?.label?.trim()),
  );
  const abVariant = useAbVariant(experimentId || undefined, abEnabled);
  const displayHeadline =
    abEnabled && abVariant === "b" && data?.hero?.headline_b?.trim()
      ? data.hero.headline_b
      : hero.headline;
  const displayHighlight =
    abEnabled && abVariant === "b" && data?.hero?.headline_highlight_b?.trim()
      ? data.hero.headline_highlight_b
      : hero.headline_highlight;
  const displaySubheadline =
    abEnabled && abVariant === "b" && data?.hero?.subheadline_b?.trim()
      ? data.hero.subheadline_b
      : hero.subheadline;
  const displayPrimaryCta =
    abEnabled && abVariant === "b" && data?.hero?.cta_primary_b?.label
      ? data.hero.cta_primary_b
      : hero.cta_primary;
  const servicesSection = data?.services_grid;
  const statsSection = data?.stats;
  const dataCentersSection = data?.data_centers;
  const infrastructureSection = data?.infrastructure;
  const timelineSection = data?.timeline;
  const partnersSection = data?.partners_marquee;
  const industriesSection = data?.industries_cta;
  const trustBadgesSection = data?.trust_badges;
  const metricsSection = data?.metrics;
  const finalCta = data?.final_cta;

  const services = (data?.services_grid?.items ?? DEFAULT_SERVICES).map((s) => ({
    icon: resolveIcon(s.icon) as IconComponent,
    title: s.title,
    description: s.description,
    href: s.href,
  }));
  const stats: { value: number; suffix: string; label: string }[] = (
    data?.stats?.items ?? DEFAULT_STATS
  ).map((s) => ({
    value:
      typeof s.value === "number"
        ? s.value
        : parseFloat(String(s.value).replace(/,/g, "").replace(/[^\d.-]/g, "")) || 0,
    suffix: s.suffix ?? "",
    label: s.label,
  }));
  const timeline = data?.timeline?.items ?? DEFAULT_TIMELINE;
  const industries = (data?.industries_cta?.items ?? DEFAULT_INDUSTRIES).map((ind) => ({
    name: ind.name,
    icon: resolveIcon(ind.icon) as IconComponent,
  }));
  const partnerLogos = normalizeMarqueePartners(data?.partners_marquee?.partners);
  const dataCenterFeatures = dataCentersSection?.features ?? [
    "Tier-3 data centers with guaranteed uptime",
    "PCI, HIPAA, SOX, and GDPR compliant",
    "Geographically separated backup data centers",
    "Redundant power, cooling, and Flash Systems Storage",
  ];
  const trustBadges = (trustBadgesSection?.items ?? [
    { icon: "Shield", title: "SOC 2 Certified", description: "SSAE 18 Type II audited data centers" },
    { icon: "Lock", title: "Zero-Trust Security", description: "Multi-layered threat detection and response" },
    { icon: "Database", title: "99.99% Uptime", description: "Redundant infrastructure with failover" },
    { icon: "Globe", title: "24/7 Monitoring", description: "Round-the-clock NOC and SOC operations" },
  ]).map((item) => ({ ...item, icon: resolveIcon(item.icon) as IconComponent }));
  const extraSections = (orderedSections ?? []).filter(
    (section) =>
      ![
        "hero",
        "services_grid",
        "stats",
        "data_centers",
        "infrastructure",
        "timeline",
        "partners_marquee",
        "industries_cta",
        "trust_badges",
        "metrics",
        "final_cta",
      ].includes(section.section_key)
  );

  // Plain elements so count-up visibility isn't gated by motion opacity.
  const { ref: statsRef, inView: statsInView } = useInViewOnce<HTMLDListElement>({
    amount: 0.15,
    rootMargin: "0px",
  });
  const { ref: metricsRef, inView: metricsInView } = useInViewOnce<HTMLDListElement>({
    amount: 0.15,
    rootMargin: "0px",
  });
  const timelineRailRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRailRef,
    offset: ["start 78%", "end 32%"],
  });
  const smoothTimelineProgress = useSpring(timelineProgress, {
    stiffness: 82,
    damping: 24,
    mass: 0.55,
    restDelta: 0.0005,
  });
  const timelineBeamTop = useTransform(smoothTimelineProgress, [0, 1], ["-22%", "100%"]);
  const timelineBeamOpacity = useTransform(
    smoothTimelineProgress,
    [0, 0.04, 0.94, 1],
    [0, 1, 1, 0],
  );
  const timelineTipTop = useTransform(smoothTimelineProgress, [0, 1], ["0%", "100%"]);
  const timelineEndOpacity = useTransform(smoothTimelineProgress, [0.9, 1], [0, 1]);
  const timelineEndScale = useTransform(smoothTimelineProgress, [0.9, 1], [0.65, 1]);

  return (
    <main className="bg-primary">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — cinematic full-bleed background video
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col overflow-hidden border-b border-secondary">
        {/* LCP poster + cinematic background video */}
        <div aria-hidden="true" className="absolute inset-0">
          <OptimizedHeroMedia startDelayMs={150} />
          {/* Scrim: top-weighted dark wash for text legibility only — the hero
              ends in a hard edge (border-b on the section), no fade-out. */}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 to-transparent" />
          {/* Only the atmosphere drifts; hero copy stays locked to the page. */}
          <ParallaxLayer className="absolute inset-[-12px]" distance={8}>
            <BackgroundPattern
              pattern="grid"
              size="lg"
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 text-white opacity-[0.06]"
            />
          </ParallaxLayer>
          <ParallaxLayer className="absolute inset-[-12px]" distance={6} reverse>
            <div className="texture-noise absolute inset-0 opacity-[0.025] mix-blend-soft-light" />
          </ParallaxLayer>
          <ParallaxLayer className="absolute inset-[-12px]" distance={12} reverse>
            <PulseGlow
              className="top-[-10%] left-[8%] size-[28rem] bg-brand-500/20"
              duration={AMBIENT_CYCLE_SECONDS}
            />
          </ParallaxLayer>
          <ParallaxLayer className="absolute inset-[-12px]" distance={8}>
            <PulseGlow
              className="right-[6%] bottom-[-14%] size-[26rem] bg-brand-400/16"
              duration={AMBIENT_CYCLE_SECONDS}
              delay={-AMBIENT_CYCLE_SECONDS / 2}
            />
          </ParallaxLayer>
        </div>

        <div className="relative flex flex-1 flex-col justify-center px-4 py-20 md:px-8 md:py-24">
          <div className="mx-auto flex w-full max-w-container flex-col items-center">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
              {/* Quiet eyebrow — mono caps, no pill / no bullet */}
              <motion.p
                {...heroReveal(MOTION_STAGGER)}
                className="text-xs font-medium tracking-[0.2em] text-white/70 uppercase"
              >
                {hero.badge}
              </motion.p>

              {/* Hardcoded white is intentional here — text sits over the video in both themes */}
              <motion.h1
                {...heroReveal(MOTION_STAGGER * 2)}
                className="mt-4 text-display-md font-semibold text-white md:text-display-lg lg:text-display-xl"
                data-ab-variant={abEnabled ? abVariant : undefined}
              >
                {displayHeadline}
                {displayHighlight && (
                  <>
                    <br />
                    <span className="ice-gradient-text">{displayHighlight}</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                {...heroReveal(MOTION_STAGGER * 3)}
                className="mt-4 max-w-2xl text-lg text-white/80 md:mt-6 md:text-xl"
              >
                {displaySubheadline}
              </motion.p>

              <motion.div
                {...heroReveal(MOTION_STAGGER * 4)}
                className="mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start md:mt-12"
              >
                <Button color="secondary" size="xl" href={hero.cta_secondary?.href ?? "/solutions"}>
                  {hero.cta_secondary?.label ?? "Explore Solutions"}
                </Button>
                <Button
                  size="xl"
                  href={displayPrimaryCta?.href ?? "tel:18007869188"}
                  iconLeading={Phone01}
                  className="shadow-[0_0_40px_rgb(4_155_251/0.3)]"
                  onClick={() => {
                    if (abEnabled) trackAbConversion(experimentId, abVariant);
                  }}
                >
                  {displayPrimaryCta?.label ?? "Call 1-800-786-9188"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll cue — pinned near the bottom of the first viewport */}
        <motion.a
          {...heroReveal(MOTION_STAGGER * 6)}
          href="#services"
          aria-label="Scroll to explore"
          className="ice-hero-scroll-cue relative z-10 mb-4 flex flex-col items-center gap-2 self-center pb-[max(0.5rem,env(safe-area-inset-bottom))] text-white/70 transition hover:text-white md:mb-6"
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Scroll</span>
          <span
            aria-hidden="true"
            className="flex flex-col items-center gap-1"
          >
            <span className="relative flex h-11 w-5 justify-center overflow-hidden rounded-full border border-white/25 bg-white/5 py-1 shadow-[0_0_20px_rgb(4_155_251/0.22)]">
              <span className="ice-hero-scroll-wheel h-2.5 w-1 rounded-full bg-brand-solid shadow-[0_0_10px_rgb(4_155_251/0.7)]" />
            </span>
            <ChevronDown className="ice-hero-scroll-chevron size-6 drop-shadow-[0_0_8px_rgb(4_155_251/0.45)]" />
          </span>
        </motion.a>
      </section>

      <ProofTicker items={resolveProofLabels(data?.hero?.proof_labels)} />

      <section className="relative isolate overflow-hidden border-b border-secondary bg-secondary py-14 md:py-18">
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_18%,transparent_72%)]"
        />
        <div className="relative mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <motion.div {...reveal()} className="max-w-xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">Choose your starting point</span>
            <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">What are you trying to solve?</h2>
            <p className="mt-4 text-lg leading-relaxed text-tertiary">
              Start from the business pressure you feel first. Each route narrows the services, proof points, and next steps that fit the situation.
            </p>
            <Button
              href="/solutions/find"
              color="secondary"
              size="lg"
              iconTrailing={ArrowRight}
              className="mt-7"
            >
              Open guided finder
            </Button>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DECISION_PATHS.map((path, i) => (
              <motion.div key={path.title} {...reveal((i + 1) * MOTION_STAGGER)} className="h-full">
                <Link
                  href={path.href}
                  className="ice-lift group relative flex h-full min-h-52 overflow-hidden rounded-lg bg-primary p-5 ring-1 ring-secondary transition hover:ring-brand"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand-500/12 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                  />
                  <div className="relative flex h-full flex-col">
                    <FeaturedIcon icon={path.icon} size="md" color="brand" theme="light" />
                    <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">{path.eyebrow}</p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-primary">{path.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-tertiary">{path.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-secondary transition group-hover:gap-2.5">
                      Follow this path <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SERVICES GRID
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="services" className="relative scroll-mt-20 overflow-hidden bg-primary py-16 md:py-24">
        {/* Depth: engineering grid fading down from the hero's hard edge + grain */}
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        />
        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow={servicesSection?.eyebrow ?? "What We Do"}
            heading={servicesSection?.heading ?? "Enterprise-Grade Solutions"}
            description={
              servicesSection?.description ??
              "End-to-end technology solutions engineered for reliability, security, and performance across every layer of your infrastructure."
            }
          />

          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.li
                key={s.title}
                {...reveal(i * MOTION_STAGGER)}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className="h-full"
              >
                <Link
                  href={s.href}
                  className="group relative flex h-full flex-col items-start gap-5 overflow-hidden rounded-2xl bg-primary p-6 ring-1 ring-secondary ring-inset outline-focus-ring transition duration-200 hover:ring-brand hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:shadow-[0_0_30px_rgb(4_155_251/0.12)]"
                >
                  {/* Subtle brand wash that fades in on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/[0.04] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                  <FeaturedIcon icon={s.icon} size="lg" color="brand" theme="modern" />
                  <div className="relative flex flex-1 flex-col gap-1.5">
                    <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                    <p className="text-md text-tertiary">{s.description}</p>
                  </div>
                  <span className="relative inline-flex items-center gap-1.5 text-sm leading-none font-semibold text-brand-secondary transition-all duration-200 group-hover:gap-2.5 group-hover:text-brand-secondary_hover">
                    <span>Learn more</span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          POPULAR SOLUTIONS — same card treatment as /solutions
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden border-y border-secondary bg-secondary py-16 md:py-24">
        <div
          aria-hidden="true"
          className="texture-dots pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_65%)]"
        />
        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow="Most Popular"
            heading="Solutions Teams Ask For First"
            description="High-demand services that keep enterprise workloads available, recoverable, and secure."
          />

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-3">
            {POPULAR_SOLUTIONS.map((svc, i) => (
              <motion.div key={svc.title} {...reveal(i * MOTION_STAGGER)} className="h-full">
                <Link
                  href={svc.href}
                  className="group relative isolate flex h-full min-h-56 overflow-hidden rounded-2xl border border-secondary bg-primary p-6 shadow-xs transition duration-200 ease-out hover:border-brand hover:shadow-lg motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
                >
                  {/* Right-side hero wash — matches /solutions (opacity only, no pan) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[58%] overflow-hidden sm:w-[62%]"
                  >
                    <Image
                      src={svc.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full translate-x-[12%] object-cover object-center opacity-[0.18] transition-opacity duration-500 ease-out group-hover:opacity-[0.55] dark:opacity-[0.22] dark:group-hover:opacity-[0.62]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] from-0% via-[var(--color-bg-primary)]/90 via-35% to-transparent to-85%" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/40 via-transparent to-[var(--color-bg-primary)]/50 dark:from-[var(--color-bg-primary)]/20 dark:to-[var(--color-bg-primary)]/30" />
                  </div>

                  <div className="relative z-10 flex h-full max-w-[70%] flex-col items-start sm:max-w-[74%]">
                    <FeaturedIcon icon={svc.icon} size="lg" color="brand" theme="light" />
                    <h3 className="mt-4 text-lg font-semibold text-primary">{svc.title}</h3>
                    <p className="mt-1 flex-1 text-md text-tertiary">{svc.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary transition duration-150 ease-linear group-hover:gap-2.5">
                      Learn more
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* 6th tile — View All Solutions CTA */}
            <motion.div {...reveal(POPULAR_SOLUTIONS.length * MOTION_STAGGER)} className="h-full">
              <Link
                href="/solutions"
                className="group relative isolate flex h-full min-h-56 overflow-hidden rounded-2xl border border-secondary bg-primary p-6 shadow-xs transition duration-200 ease-out hover:border-brand hover:shadow-lg motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
              >
                <div
                  aria-hidden="true"
                  className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-60 transition-opacity duration-300 group-hover:opacity-90 [mask-image:radial-gradient(ellipse_at_bottom_right,black_25%,transparent_75%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.06] via-transparent to-brand-600/[0.08]"
                />
                <LayersThree01
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -bottom-6 -z-10 size-44 -rotate-12 text-brand-500/15 transition duration-500 ease-out group-hover:text-brand-500/25 md:size-52"
                />

                <div className="relative z-10 flex h-full flex-col items-start justify-between">
                  <div>
                    <FeaturedIcon icon={LayersThree01} size="lg" color="brand" theme="light" />
                    <h3 className="mt-4 text-lg font-semibold text-primary">View All Solutions</h3>
                    <p className="mt-1 text-md text-tertiary">
                      Browse the full catalog of managed cloud, security, and data protection services.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary transition duration-150 ease-linear group-hover:gap-2.5">
                    Explore solutions
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-primary py-16 md:py-24">
        <SectionBloom align="left" />
        <div className="relative z-10 mx-auto w-full max-w-container px-4 md:px-8">
          <div className="flex flex-col gap-8 md:gap-16">
            <SectionHeader
              eyebrow={statsSection?.eyebrow ?? "By The Numbers"}
              heading={statsSection?.heading ?? "Proven Enterprise Track Record"}
              description={statsSection?.description}
            />

            <dl
              ref={statsRef}
              className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4"
            >
              {stats.map((s, i) => (
                <StatItem
                  key={s.label}
                  {...s}
                  inView={statsInView}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DATA CENTERS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative"
            >
              <Image
                src="/images/service/data_center.jpg"
                alt="ICE high-security data center"
                width={720}
                height={480}
                className="h-auto w-full rounded-2xl object-cover dark:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
              />
              {/* Floating certification badge */}
              <div className="absolute -bottom-4 right-4 rounded-xl bg-primary px-5 py-3 shadow-lg ring-1 ring-secondary ring-inset lg:bottom-6 lg:-right-6">
                <p className="text-xs font-medium tracking-wider text-tertiary uppercase">{dataCentersSection?.badge_label ?? "Certified"}</p>
                <p className="text-sm font-semibold text-primary">{dataCentersSection?.badge_value ?? "SOC 2 Type II"}</p>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="text-sm font-semibold tracking-wider text-brand-secondary uppercase">
                {dataCentersSection?.eyebrow ?? "Infrastructure"}
              </span>
              <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                {dataCentersSection?.heading ?? "High-Security Data Centers"}
              </h2>
              <p className="mt-4 text-lg text-tertiary md:mt-5">
                {dataCentersSection?.description ??
                  "Our SOC 2 Type II certified data centers deliver the reliability, redundancy, and security your mission-critical workloads demand."}
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {dataCenterFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                    <span className="text-md text-tertiary">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 md:mt-10">
                <Button
                  size="lg"
                  href={dataCentersSection?.cta?.href ?? "/solutions/managed-cloud-hosting"}
                  iconTrailing={ArrowRight}
                >
                  {dataCentersSection?.cta?.label ?? "Learn More"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INFRASTRUCTURE DATA FLOW
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-primary py-16 md:py-24">
        <SectionBloom align="right" />
        <div className="relative z-10 mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow={infrastructureSection?.eyebrow ?? "Architecture"}
            heading={infrastructureSection?.heading ?? "Enterprise Data Flow"}
            description={
              infrastructureSection?.description ??
              "From client to backup, every layer of your infrastructure is protected, monitored, and optimized."
            }
          />

          <div className="mt-12 md:mt-16">
            <InteractiveArchitecture />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          COMPANY TIMELINE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-secondary py-16 md:py-24">
        <SectionBloom align="left" />
        <div className="relative z-10 mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow={timelineSection?.eyebrow ?? "Our Journey"}
            heading={timelineSection?.heading ?? "35+ Years of Innovation"}
          />

          <div ref={timelineRailRef} className="relative mx-auto mt-12 max-w-4xl md:mt-16">
            {/* Rail + beam stop at the endcap center (bottom-2.5 = half of size-5). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 bottom-2.5 overflow-hidden"
            >
              {/* Pipeline rail — a subtle brand-tinted track the beam runs along */}
              <div className="absolute inset-y-0 left-4 w-[3px] -translate-x-px rounded-full bg-gradient-to-b from-brand-500/20 via-brand-500/25 to-transparent md:left-1/2" />
              <span
                aria-hidden="true"
                className="ice-timeline-auto-beam absolute left-[calc(1rem-1px)] z-[2] h-[24%] w-[3px] rounded-full md:left-[calc(50%-1px)]"
              />
              <span
                aria-hidden="true"
                className="ice-timeline-auto-tip absolute left-4 z-[3] -translate-x-1/2 -translate-y-1/2 md:left-1/2"
              >
                <span className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-solid/20 blur-lg" />
                <span className="relative block size-2.5 rounded-full bg-brand-solid shadow-[0_0_18px_5px_rgb(4_155_251/0.55)]" />
              </span>
              {/* Reading-progress line. Centering stays on the wrapper so Motion
                  can own the inner transform without clobbering it. */}
              <div className="absolute inset-y-0 left-4 w-[3px] -translate-x-px md:left-1/2">
                <motion.div
                  className="h-full w-full origin-top rounded-full bg-border-brand"
                  style={{ scaleY: smoothTimelineProgress }}
                />
              </div>

              {/* The spring-smoothed glow beam advances with reading pace. */}
              <motion.span
                className="ice-timeline-beam absolute left-4 z-[1] h-[22%] w-[3px] -translate-x-px rounded-full md:left-1/2"
                style={{
                  top: timelineBeamTop,
                  opacity: timelineBeamOpacity,
                  background:
                    "linear-gradient(to bottom, transparent, var(--color-brand-solid) 40%, rgb(124 212 253) 55%, transparent)",
                  boxShadow: "0 0 18px 3px rgb(4 155 251 / 0.55)",
                }}
              />

              {/* A restrained pulse marks the exact reading position. */}
              <motion.span
                className="absolute left-4 z-[2] -translate-x-1/2 -translate-y-1/2 md:left-1/2"
                style={{
                  top: timelineTipTop,
                  opacity: timelineBeamOpacity,
                }}
              >
                <span className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-solid/20 blur-md" />
                <span className="relative block size-2.5 rounded-full bg-brand-solid shadow-[0_0_16px_4px_rgb(4_155_251/0.5)]">
                  <motion.span
                    className="absolute inset-0 rounded-full ring-1 ring-brand-solid/70"
                    animate={{ scale: [1, 2.1], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                </span>
              </motion.span>
            </div>

            {timeline.map((item, i) => {
              const isLast = i === timeline.length - 1;
              return (
                <div
                  key={item.year}
                  className={`relative mb-12 flex items-start gap-8 last:mb-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot — pops in with a spring; the latest milestone pulses gently */}
                  <motion.div
                    initial={{ opacity: 0.32, scale: 0.68 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.35, margin: "0px 0px -12% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 210,
                      damping: 18,
                      mass: 0.65,
                      delay: 0.08 + i * MOTION_STAGGER,
                    }}
                    className="absolute left-4 z-10 -translate-x-1/2 md:left-1/2"
                  >
                    <span className="relative flex size-5 items-center justify-center rounded-full bg-brand-secondary shadow-[0_0_0_4px_var(--color-bg-secondary)]">
                      {isLast && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-brand-solid/40"
                          animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <span className="size-1.5 rounded-full bg-brand-solid" />
                    </span>
                  </motion.div>

                  {/* Content — slides in from its own side of the line */}
                  <motion.div
                    initial={{ opacity: 0.18, x: i % 2 === 0 ? -32 : 32, y: 14 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.28, margin: "0px 0px -12% 0px" }}
                    transition={{
                      duration: 0.76,
                      delay: i * MOTION_STAGGER,
                      ease: EASE,
                    }}
                    className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                      i % 2 === 0 ? "md:pr-8 md:text-right" : "md:ml-auto md:pl-8 md:text-left"
                    }`}
                  >
                    <div
                      className={`group relative overflow-hidden rounded-2xl border border-secondary bg-primary/80 p-5 text-left shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg md:p-6 ${
                        i % 2 === 0 ? "md:text-right" : "md:text-left"
                      }`}
                    >
                      <motion.span
                        aria-hidden="true"
                        className={`absolute top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-solid/70 to-transparent ${
                          i % 2 === 0 ? "right-0 origin-right" : "left-0 origin-left"
                        }`}
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.12 + i * MOTION_STAGGER,
                          ease: EASE,
                        }}
                      />
                      <div
                        className={`flex items-center gap-3 ${
                          i % 2 === 0 ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        <span className="rounded-full bg-brand-primary_alt px-3 py-1 text-sm font-semibold tracking-wider text-brand-secondary ring-1 ring-brand/20">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-primary">{item.title}</h3>
                      <p className="mt-2 text-md leading-relaxed text-tertiary">{item.description}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {/* Pipeline endcap — same size as milestone dots; rail ends on its center */}
            <div className="relative h-5">
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-4 z-10 -translate-x-1/2 md:left-1/2"
              >
                <motion.span
                  className="flex size-5 items-center justify-center rounded-full bg-brand-secondary shadow-[0_0_12px_2px_rgb(4_155_251/0.45)]"
                  style={{
                    opacity: timelineEndOpacity,
                    scale: timelineEndScale,
                  }}
                >
                  <span className="size-1.5 rounded-full bg-brand-solid" />
                </motion.span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TECHNOLOGY PARTNERS (social proof marquee)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow={partnersSection?.eyebrow ?? "Technology Partners"}
            heading={partnersSection?.heading ?? "Trusted Partners"}
          />
          <div className="mx-auto mt-12 h-px max-w-4xl bg-gradient-to-r from-transparent via-brand-500/40 to-transparent md:mt-16" />
        </div>

        <div className="mt-10 md:mt-12">
          <InfiniteMarquee
            durationSec={AMBIENT_CYCLE_SECONDS * 2}
            pauseOnHover={false}
            renderTrack={() => (
              <>
                {/* Duplicate once inside the track so the strip is always wider than the viewport */}
                {[0, 1].flatMap((copy) =>
                  partnerLogos.map((partner, i) => (
                    <div
                      key={`${copy}-${partner.name}-${i}`}
                      className="mx-4 flex h-24 w-56 shrink-0 items-center gap-4 rounded-xl bg-secondary px-5 ring-1 ring-secondary md:mx-5"
                    >
                      <Image
                        src={partner.logo_src}
                        alt={copy === 0 ? partner.name : ""}
                        width={180}
                        height={64}
                        className="h-9 w-auto max-w-[6.5rem] object-contain opacity-60 brightness-[0.5] dark:opacity-55 dark:brightness-100"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-primary">{partner.name}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-tertiary">
                          {PARTNER_CAPABILITIES[partner.name] ?? "Enterprise technology"}
                        </span>
                      </span>
                    </div>
                  )),
                )}
              </>
            )}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INDUSTRIES + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <motion.div
            {...reveal()}
            className="relative isolate overflow-hidden rounded-2xl bg-[rgb(4_11_25)] px-6 py-10 text-white md:p-12 lg:p-16"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(4_155_251/0.25),transparent_55%)]"
            />
            <BrandOrbs variant="onBrand" />
            <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="text-sm font-semibold tracking-wider text-brand-300 uppercase">
                  {industriesSection?.eyebrow ?? "Why Choose ICE"}
                </span>
                <h2 className="mt-3 text-display-sm font-semibold text-white md:text-display-md">
                  {industriesSection?.heading ?? "Ready to Modernize Your IT Infrastructure?"}
                </h2>
                <p className="mt-4 text-lg text-white/70 md:mt-5">
                  {industriesSection?.description ??
                    "Let our experts conduct a free assessment of your current IT environment and show you how we can reduce costs, improve performance, and strengthen security."}
                </p>

                <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start md:mt-10">
                  <Button color="secondary" size="xl" href={industriesSection?.cta_secondary?.href ?? "/why-ice"}>
                    {industriesSection?.cta_secondary?.label ?? "Why ICE"}
                  </Button>
                  <Button size="xl" href={industriesSection?.cta_primary?.href ?? "/contact"} iconTrailing={ArrowRight}>
                    {industriesSection?.cta_primary?.label ?? "Get Free Assessment"}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wider text-brand-300 uppercase">Industries We Serve</h3>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {industries.map((ind, i) => (
                    <motion.div
                      key={ind.name}
                      {...reveal(i * MOTION_STAGGER)}
                      className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10 transition-shadow duration-200 hover:bg-white/10"
                    >
                      <ind.icon className="size-5 shrink-0 text-brand-300" />
                      <span className="text-sm font-medium text-white/85">{ind.name}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <Image
                    src="/images/ibm.svg"
                    alt="IBM Business Partner"
                    width={44}
                    height={44}
                    className="h-9 w-auto brightness-0 invert"
                  />
                  <p className="text-sm text-white/70">
                    {industriesSection?.badge_note ??
                      "Proud IBM Business Partner, delivering enterprise solutions since 1990."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST & SECURITY BADGES
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <SectionHeader
            eyebrow={trustBadgesSection?.eyebrow ?? "Enterprise Trust"}
            heading={trustBadgesSection?.heading ?? "Built for Reliability"}
          />

          <ul className="mt-12 grid grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {trustBadges.map((item, i) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * MOTION_STAGGER, ease: EASE }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <div className="flex max-w-sm flex-col items-center gap-4 text-center">
                  <FeaturedIcon icon={item.icon} size="lg" color="brand" theme="light" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      <CountUpText value={item.title} className="tabular-nums" duration={1600} />
                    </h3>
                    <p className="mt-1 text-md text-tertiary">{item.description}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PERFORMANCE METRICS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        {/* Depth: faint centered dot field behind the metrics panel */}
        <div
          aria-hidden="true"
          className="texture-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]"
        />
        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          <div className="flex flex-col gap-8 md:gap-16">
            <SectionHeader
              eyebrow={metricsSection?.eyebrow ?? "Performance"}
              heading={metricsSection?.heading ?? "Enterprise Metrics"}
              description={
                metricsSection?.description ??
                "Real-time performance indicators that reflect our commitment to reliability and security."
              }
            />

            {/* Panel stays fully opaque — opacity reveals hide count-up. */}
            <div className="relative overflow-hidden rounded-3xl bg-secondary ring-1 ring-secondary ring-inset dark:shadow-[0_0_40px_rgb(4_155_251/0.08)]">
              {/* Panel depth: brand hairline, masked grid, film grain */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
              />
              <div
                aria-hidden="true"
                className="texture-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]"
              />
              <div
                aria-hidden="true"
                className="texture-noise pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
              />
              <dl
                ref={metricsRef}
                className="relative grid grid-cols-2 gap-x-4 gap-y-8 px-6 py-10 md:grid-cols-4 md:p-16"
              >
                {PERFORMANCE_METRICS.map((metric, i) => (
                  <div
                    key={metric.label}
                    className="flex flex-col-reverse gap-3 text-center transition-all duration-500 ease-out"
                    style={{
                      opacity: reduceMotion || metricsInView ? 1 : 0,
                      transform:
                        reduceMotion || metricsInView
                          ? "translateY(0)"
                          : "translateY(12px)",
                      transitionDelay: !reduceMotion && metricsInView
                        ? `${i * MOTION_STAGGER * 1000}ms`
                        : "0ms",
                    }}
                  >
                    <dt className="text-md font-semibold text-primary md:text-lg">{metric.label}</dt>
                    <dd className="text-display-md font-semibold tracking-tight text-brand-tertiary_alt tabular-nums md:text-display-lg">
                      <CountUpText
                        value={metric.value}
                        suffix={"suffix" in metric ? metric.suffix : ""}
                        inView={metricsInView}
                        duration={2000}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <GenericCMSSections sections={extraSections} />
      <FaqPreview heading="Answers before you schedule a call" />

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-primary py-16 md:py-24">
        <SectionBloom />
        <div className="relative z-10 mx-auto w-full max-w-container px-4 md:px-8">
          <div className="mx-auto mb-12 h-px max-w-4xl bg-gradient-to-r from-transparent via-brand-500/40 to-transparent md:mb-16" />
          <div className="relative isolate flex flex-col gap-x-8 gap-y-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-bg-secondary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] px-6 py-10 ring-1 ring-secondary ring-inset lg:flex-row lg:items-center lg:p-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.1)]">
            {/* Depth layers: masked grid, film grain, and a large rotated icon
                watermark bleeding past the card corner. */}
            <div
              aria-hidden="true"
              className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_75%)]"
            />
            <div
              aria-hidden="true"
              className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.07]"
            />
            <MessageChatCircle
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-12 -z-10 size-56 -rotate-12 text-brand-500/10 md:size-72 dark:text-brand-500/15"
            />
            <BrandOrbs />
            <div className="relative flex max-w-3xl flex-1 flex-col">
              <motion.h2
                {...reveal()}
                className="text-display-sm font-semibold text-primary md:text-display-md"
              >
                {finalCta?.heading ?? "Let's Build Your Future Together"}
              </motion.h2>
              <motion.p
                {...reveal(MOTION_STAGGER)}
                className="mt-4 text-lg text-tertiary md:mt-5 lg:text-xl"
              >
                {finalCta?.description ??
                  "Schedule a free consultation with our enterprise architects and discover how ICE can transform your infrastructure."}
              </motion.p>
            </div>
            <motion.div
              {...reveal(MOTION_STAGGER * 2)}
              className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start"
            >
              {finalCta?.cta_secondary ? (
                <Button color="secondary" size="xl" href={finalCta.cta_secondary.href}>
                  {finalCta.cta_secondary.label}
                </Button>
              ) : (
                <Button color="secondary" size="xl" href="tel:18007869188">
                  Call 1-800-786-9188
                </Button>
              )}
              <Button size="xl" href={finalCta?.cta_primary?.href ?? "/contact"} iconTrailing={ArrowRight}>
                {finalCta?.cta_primary?.label ?? "Get Started"}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
