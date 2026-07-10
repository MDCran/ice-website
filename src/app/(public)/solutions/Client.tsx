"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cloud01,
  CpuChip01,
  Database01,
  Dataflow01,
  HardDrive,
  Lock01,
  Monitor01,
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
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { resolveIcon } from "@/lib/iconMap";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { cx } from "@/utils/cx";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

export default function SolutionsPage({
  cmsData,
  orderedSections,
}: {
  cmsData?: Record<string, any>;
  orderedSections?: CMSRenderableSection[];
}) {
  const reduceMotion = useReducedMotion();

  const hero = cmsData?.hero ?? {};
  const categories = (cmsData?.categories?.items ?? DEFAULT_CATEGORIES).map((cat: any) => ({
    ...cat,
    icon: typeof cat.icon === "string" ? resolveIcon(cat.icon) : cat.icon,
    services: (cat.services ?? []).map((svc: any) => ({
      ...svc,
      icon: typeof svc.icon === "string" ? resolveIcon(svc.icon) : svc.icon,
      desc: svc.desc ?? svc.description ?? "",
    })),
  }));
  const finalCta = cmsData?.final_cta ?? cmsData?.cta ?? {};
  const extraSections = (orderedSections ?? []).filter(
    (section) => !["hero", "categories", "final_cta", "cta"].includes(section.section_key)
  );

  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 };
  const visible = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  const totalServices = categories.reduce(
    (sum: number, cat: any) => sum + (cat.services?.length ?? 0),
    0
  );
  const heroProofLabels = [
    totalServices > 0 ? `${totalServices} managed solutions` : null,
    categories.length > 0 ? `${categories.length} practice areas` : null,
    "IBM Business Partner since 1990",
  ].filter((label): label is string => Boolean(label));

  return (
    <main className="bg-primary">
      {/* Page header — distinct hero band, not flat paper */}
      <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
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

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            animate={visible}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
              {hero.eyebrow ?? hero.badge ?? "Our Solutions"}
            </span>
            <h1 className="mt-3 text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              {hero.headline ?? "Enterprise Technology Solutions"}
            </h1>
            <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">
              {hero.subheadline ??
                "From cloud infrastructure to cybersecurity, we deliver end-to-end solutions engineered for reliability, performance, and scale."}
            </p>

            {/* Quiet mono proof row */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:mt-10">
              {heroProofLabels.map((label, index) => (
                <li key={label} className="flex items-center gap-3">
                  {index > 0 && (
                    <span aria-hidden="true" className="size-1 rounded-full bg-fg-brand-secondary/60" />
                  )}
                  <span className="font-mono text-xs font-medium tracking-wide text-quaternary uppercase">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Solution categories — alternating surfaces give the page rhythm */}
      {categories.map((cat: any, catIdx: number) => (
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

            <div
              className={cx(
                "mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-12 md:gap-6",
                cat.services.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-2"
              )}
            >
              {cat.services.map((svc: any, i: number) => (
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
                    className="group flex h-full flex-col items-start rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary transition duration-200 ease-out ring-inset hover:shadow-lg hover:ring-brand motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
                  >
                    <FeaturedIcon icon={svc.icon} size="lg" color="brand" theme="light" />
                    <h3 className="mt-4 text-lg font-semibold text-primary">{svc.title}</h3>
                    <p className="mt-1 flex-1 text-md text-tertiary">{svc.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary transition duration-150 ease-linear group-hover:gap-2.5">
                      Learn more
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <GenericCMSSections sections={extraSections} />

      <BrandHairline />

      {/* CTA — distinct brand band so it never reads as footer content */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative isolate overflow-hidden rounded-2xl bg-brand-section px-6 py-12 lg:p-16 dark:shadow-[0_0_60px_rgb(4_155_251/0.15)] dark:ring-1 dark:ring-secondary dark:ring-inset"
          >
            {/* Techy grid overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20"
            >
              <BackgroundPattern pattern="grid" size="lg" className="shrink-0 text-primary_on-brand" />
            </div>
            {/* Film-grain matte finish over the brand band */}
            <div
              aria-hidden="true"
              className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
            />
            {/* Oversized solution glyph bleeding past the card edge */}
            <Zap
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-12 -z-10 size-56 -rotate-12 text-brand-400/15 md:size-72 dark:text-brand-500/15"
            />
            {/* Ambient brand orbs — slow continuous drift */}
            <BrandOrbs variant="onBrand" />

            <div className="flex flex-col gap-x-8 gap-y-8 lg:flex-row lg:items-center">
              <div className="flex max-w-3xl flex-1 flex-col">
                <h2 className="text-display-sm font-semibold tracking-tight text-primary_on-brand md:text-display-md">
                  {finalCta.heading ?? "Need a Custom Solution?"}
                </h2>
                <p className="mt-4 text-lg text-tertiary_on-brand md:mt-5">
                  {finalCta.description ??
                    "Our enterprise architects will design a tailored solution that fits your business requirements and budget."}
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                <Button
                  size="xl"
                  href={finalCta.cta_primary?.href ?? finalCta.ctaPrimary?.href ?? "/contact"}
                  iconTrailing={ArrowRight}
                >
                  {finalCta.cta_primary?.label ?? finalCta.ctaPrimary?.label ?? "Contact Our Team"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
