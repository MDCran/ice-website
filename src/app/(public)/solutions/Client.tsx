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
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
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

  return (
    <main className="bg-primary">
      {/* Page header */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        {/* Subtle techy grid backdrop */}
        <BackgroundPattern
          pattern="grid"
          size="lg"
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3"
        />

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            animate={visible}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <span className="font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
              {hero.eyebrow ?? hero.badge ?? "Our Solutions"}
            </span>
            <h1 className="mt-3 text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              {hero.headline ?? "Enterprise Technology Solutions"}
            </h1>
            <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">
              {hero.subheadline ??
                "From cloud infrastructure to cybersecurity, we deliver end-to-end solutions engineered for reliability, performance, and scale."}
            </p>
          </motion.div>
        </div>
      </section>

      <BrandHairline />

      {/* Solution categories */}
      {categories.map((cat: any, catIdx: number) => (
        <section key={cat.title} className={cx("py-16 md:py-24", catIdx % 2 === 1 ? "bg-secondary" : "bg-primary")}>
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
            {/* Ambient brand blooms — slow continuous pulse */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-brand-400/40 blur-3xl"
              animate={reduceMotion ? undefined : { opacity: [0.5, 0.95, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-72 rounded-full bg-brand-600/50 blur-3xl"
              animate={reduceMotion ? undefined : { opacity: [0.9, 0.5, 0.9] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

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
