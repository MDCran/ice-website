"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CountUpNumber } from "@/components/ui/CountUpValue";
import {
  ChevronRight,
  ArrowRight,
  Server01,
  LayersThree01,
  Building07,
  Bank,
  ActivityHeart,
  ShieldTick,
  Scales01,
  Award01,
  MessageChatCircle,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BrandOrbs, PulseAccent } from "@/components/effects/AmbientMotion";
import ScrollChapter from "@/components/effects/ScrollChapter";
import { resolveIcon } from "@/lib/iconMap";
import { MOTION_EASE } from "@/lib/motion";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { cx } from "@/utils/cx";

const EASE = MOTION_EASE;

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

type IconComponent = FC<{ className?: string }>;

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: Stat[] = [
  { value: 35, suffix: "+", label: "Years of Experience" },
  { value: 1200, suffix: "+", label: "Projects Delivered" },
  { value: 500, suffix: "+", label: "Clients Served" },
  { value: 99.99, suffix: "%", label: "Uptime SLA" },
];

/** Quiet mono proof chips shown under the hero lead. */
const DEFAULT_PROOF: string[] = [
  "IBM Business Partner Since 1990",
  "SOC 2 Type II Data Centers",
  "Tier-3 Infrastructure",
  "24/7/365 U.S. Support",
];

interface Differentiator {
  icon: IconComponent;
  title: string;
  description: string;
}

const DEFAULT_DIFFERENTIATORS: Differentiator[] = [
  {
    icon: Award01,
    title: "IBM Business Partner Since 1990",
    description:
      "Over three decades of trusted expertise as an IBM Business Partner. We bring deep knowledge of IBM Power Systems, IBM i, and enterprise solutions to every engagement.",
  },
  {
    icon: Server01,
    title: "Enterprise-Grade Infrastructure",
    description:
      "Our SOC 2 Type II certified data centers provide the reliability, security, and performance that enterprise workloads demand. Redundant power, cooling, and connectivity ensure maximum uptime.",
  },
  {
    icon: LayersThree01,
    title: "End-to-End Solutions",
    description:
      "From cloud hosting and disaster recovery to hardware procurement and managed services, we provide comprehensive technology solutions that cover your entire IT lifecycle.",
  },
];

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "Why choose International Computer Exchange?",
    answer:
      "International Computer Exchange has been an IBM Business Partner since 1990, providing over 35 years of enterprise technology expertise. We specialize in IBM Power Systems, cloud hosting, disaster recovery, and managed services. Our SOC 2 Type II certified data centers, combined with our deep technical knowledge and personalized service, make us a trusted partner for businesses that demand reliability and performance.",
  },
  {
    id: "faq-2",
    question: "What solutions does ICE offer?",
    answer:
      "ICE offers a comprehensive suite of enterprise technology solutions including Managed Cloud Hosting (private, hybrid, and public cloud), Disaster Recovery as a Service (DRaaS), Backup as a Service (BaaS), IBM i Security solutions, Managed Security services, Hardware sales (new and refurbished IBM Power Systems, Lenovo, Cisco, Dell), and end-to-end IT managed services.",
  },
  {
    id: "faq-3",
    question: "Where is ICE's infrastructure hosted?",
    answer:
      "ICE leverages Tier-3 data centers with geographically separated backup infrastructure. All facilities are PCI, HIPAA, SOX, and GDPR compliant, featuring redundant power systems, enterprise-grade cooling, Flash Systems Storage, multiple network carriers, and 24/7 physical security monitoring to ensure maximum uptime and data protection.",
  },
  {
    id: "faq-4",
    question: "Does ICE resell new hardware?",
    answer:
      "Yes, ICE resells both new and refurbished enterprise hardware. As an authorized partner for IBM, Lenovo, Cisco, Dell, and other leading manufacturers, we can provide the latest servers, storage systems, and networking equipment. We also offer certified refurbished IBM Power Systems for cost-effective solutions without compromising on quality.",
  },
  {
    id: "faq-5",
    question: "How do I get started?",
    answer:
      "Getting started with ICE is simple. Contact us at 1-800-786-9188 or email info@icesales.com to schedule a consultation. Our team will assess your current infrastructure, understand your business requirements, and recommend tailored solutions that fit your needs and budget. We also offer free initial assessments for qualified businesses.",
  },
];

interface Industry {
  icon: IconComponent;
  title: string;
  description: string;
}

const DEFAULT_INDUSTRIES: Industry[] = [
  {
    icon: Building07,
    title: "Manufacturing & Logistics",
    description:
      "Powering supply chains and production systems with reliable IBM infrastructure and cloud solutions.",
  },
  {
    icon: Bank,
    title: "Financial Services",
    description:
      "Secure, compliant hosting and data protection for banks, credit unions, and financial institutions.",
  },
  {
    icon: ActivityHeart,
    title: "Healthcare",
    description:
      "HIPAA-ready infrastructure and managed services for healthcare providers and health systems.",
  },
  {
    icon: ShieldTick,
    title: "Insurance",
    description:
      "High-availability platforms and disaster recovery for insurance carriers and agencies.",
  },
  {
    icon: Scales01,
    title: "Legal & Professional Services",
    description:
      "Secure document management, reliable hosting, and IT support for law firms and professional organizations.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Brand hairline divider                                                     */
/* -------------------------------------------------------------------------- */

function BrandHairline() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-container bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Counter                                                           */
/* -------------------------------------------------------------------------- */

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const numeric = typeof target === "number" ? target : parseFloat(String(target)) || 0;
  const decimals = Number.isInteger(numeric) ? 0 : (String(numeric).split(".")[1]?.length ?? 0);
  return (
    <CountUpNumber
      target={numeric}
      suffix={suffix}
      inView={inView}
      decimals={decimals}
      duration={2000}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ Accordion Item                                                         */
/* -------------------------------------------------------------------------- */

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="not-first:-mt-px not-first:border-t not-first:border-secondary not-first:pt-6">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full cursor-pointer items-start justify-between gap-2 rounded-md text-left outline-focus-ring select-none focus-visible:outline-2 focus-visible:outline-offset-2 md:gap-6"
        >
          <span className="text-md font-semibold text-primary">{faq.question}</span>

          <span aria-hidden="true" className="flex size-6 items-center text-fg-quaternary">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line
                className={cx("origin-center rotate-0 transition duration-150 ease-out", isOpen && "-rotate-90")}
                x1="12"
                y1="8"
                x2="12"
                y2="16"
              ></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </span>
        </button>
      </h3>

      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                damping: 24,
                stiffness: 240,
                bounce: 0.4,
              }
        }
      >
        <div className="pt-1 pr-8 md:pr-12">
          <p className="text-md text-tertiary">{faq.answer}</p>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function WhyICEPage({
  cmsData,
  orderedSections,
}: {
  cmsData?: Record<string, any>;
  orderedSections?: CMSRenderableSection[];
}) {
  const reduceMotion = useReducedMotion();

  const hero = cmsData?.hero ?? {};
  const statsSection = cmsData?.stats ?? {};
  const differentiatorsSection = cmsData?.differentiators ?? {};
  const faqsSection = cmsData?.faqs ?? {};
  const industriesSection = cmsData?.industries ?? {};
  const finalCta = cmsData?.final_cta ?? cmsData?.cta ?? {};
  const stats = statsSection.items ?? DEFAULT_STATS;
  const differentiators = (differentiatorsSection.items ?? DEFAULT_DIFFERENTIATORS).map((d: any) => ({
    ...d,
    icon: typeof d.icon === "string" ? resolveIcon(d.icon) : d.icon,
  }));
  const faqs = faqsSection.items ?? DEFAULT_FAQS;
  const industries = (industriesSection.items ?? DEFAULT_INDUSTRIES).map((d: any) => ({
    ...d,
    icon: typeof d.icon === "string" ? resolveIcon(d.icon) : d.icon,
  }));
  const proofPoints: any[] = hero.proof_points ?? hero.proof ?? DEFAULT_PROOF;
  const extraSections = (orderedSections ?? []).filter(
    (section) => !["hero", "stats", "differentiators", "faqs", "industries", "final_cta", "cta"].includes(section.section_key)
  );

  const { ref: statsRef, inView: statsInView } = useInViewOnce<HTMLDListElement>({
    amount: 0.15,
    rootMargin: "0px",
  });

  // Track open FAQs by array index so each item toggles independently —
  // CMS-provided items may not carry a unique `id`, which previously made
  // every item share the same key and expand/collapse together.
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 };
  const visible = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const viewportOnce = { once: true, margin: "-80px" } as const;

  return (
    <main className="min-h-screen bg-primary">
      {/* ================================================================= */}
      {/*  Page Hero — gradient band + grid texture + drifting brand orbs   */}
      {/* ================================================================= */}
      <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
        {/* Depth layers — decorative only */}
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        />
        <BrandOrbs />

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm font-medium text-quaternary"
            >
              <Link
                href="/"
                className="rounded-xs outline-focus-ring transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Home
              </Link>
              <ChevronRight className="size-4 text-fg-quaternary" />
              <span className="text-brand-secondary">Why ICE</span>
            </motion.nav>

            {/* Eyebrow — pulsing brand dot + mono caps */}
            <motion.p
              initial={hidden}
              animate={visible}
              transition={{ delay: 0.05, duration: 0.5, ease: EASE }}
              className="mt-6 flex items-center gap-2.5"
            >
              <PulseAccent />
              <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                {hero.badge ?? hero.eyebrow ?? "The ICE Advantage"}
              </span>
            </motion.p>

            <motion.h1
              initial={hidden}
              animate={visible}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-4 text-display-md font-semibold tracking-tight text-primary md:text-display-lg"
            >
              {hero.headline ?? "Why ICE"}
            </motion.h1>

            {hero.subheadline && (
              <motion.p
                initial={hidden}
                animate={visible}
                transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
                className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl"
              >
                {hero.subheadline}
              </motion.p>
            )}

            {/* Quiet mono proof chips */}
            {proofPoints.length > 0 && (
              <motion.ul
                initial={hidden}
                animate={visible}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:mt-10"
              >
                {proofPoints.map((point: any) => {
                  const label = typeof point === "string" ? point : (point?.label ?? "");
                  if (!label) return null;
                  return (
                    <li
                      key={label}
                      className="flex items-center gap-2 rounded-full bg-primary/70 py-1.5 pr-3.5 pl-3 text-xs font-medium tracking-[0.15em] text-tertiary uppercase ring-1 ring-secondary backdrop-blur-sm ring-inset"
                    >
                      <span aria-hidden="true" className="size-1 rounded-full bg-brand-solid" />
                      {label}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Value Proposition / Stats — dark brand feature band              */}
      {/* ================================================================= */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="flex flex-col gap-12 md:gap-16">
            <motion.div
              initial={hidden}
              whileInView={visible}
              viewport={viewportOnce}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex w-full flex-col items-center self-center text-center md:max-w-3xl"
            >
              <h2 className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                {statsSection.eyebrow ?? "By the Numbers"}
              </h2>
              {statsSection.description ? (
                <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">{statsSection.description}</p>
              ) : null}
            </motion.div>

            {/* Dark navy band — opaque from first paint so count-up is visible. */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-brand-section shadow-xl ring-1 ring-white/10 ring-inset dark:shadow-[0_0_60px_rgb(4_155_251/0.1)]">
              <div
                aria-hidden="true"
                className="texture-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_85%)]"
              />
              <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.07]" />
              <BrandOrbs variant="onBrand" />

              <dl
                ref={statsRef}
                className="relative grid grid-cols-1 gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4 md:p-16"
              >
                {stats.map((stat: any, i: number) => {
                  const rawValue = typeof stat.value === "number"
                    ? stat.value
                    : parseFloat(String(stat.value).replace(/,/g, "").replace(/[^\d.-]/g, "")) || 0;
                  // Force uptime SLA to 99.99 when CMS still has 100.
                  const value =
                    /uptime/i.test(String(stat.label ?? "")) && rawValue >= 100
                      ? 99.99
                      : rawValue;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col-reverse gap-3 text-center transition-all duration-500 ease-out"
                      style={{
                        opacity: statsInView ? 1 : 0,
                        transform: statsInView ? "translateY(0)" : "translateY(16px)",
                        transitionDelay: statsInView ? `${i * 80}ms` : "0ms",
                      }}
                    >
                      <dt className="text-md font-medium text-secondary_on-brand">{stat.label}</dt>
                      <dd className="text-display-lg font-semibold tracking-tight text-primary_on-brand tabular-nums md:text-display-xl">
                        <AnimatedCounter target={value} suffix={stat.suffix ?? ""} inView={statsInView} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <BrandHairline />

      {/* ================================================================= */}
      {/*  Key Differentiators — bordered cards over a textured backdrop    */}
      {/* ================================================================= */}
      <ScrollChapter className="relative isolate overflow-hidden bg-primary py-16 md:py-24">
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 opacity-[0.45] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
        />
        <BrandOrbs className="opacity-70" />

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {differentiatorsSection.eyebrow ?? "Differentiators"}
            </span>
            <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              {differentiatorsSection.heading ?? "What Sets Us Apart"}
            </h2>
          </motion.div>

          <ul className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {differentiators.map((item: any, i: number) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.title}
                  initial={hidden}
                  whileInView={visible}
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="h-full"
                >
                  <div className="flex h-full flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary transition duration-200 ease-out ring-inset hover:shadow-lg hover:ring-brand motion-safe:hover:-translate-y-1 md:p-8 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]">
                    <FeaturedIcon icon={Icon} size="lg" color="brand" theme="light" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                      <p className="mt-2 text-md text-tertiary">{item.description}</p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </ScrollChapter>

      {/* ================================================================= */}
      {/*  Industries Section                                               */}
      {/* ================================================================= */}
      <section className="relative isolate overflow-hidden bg-primary py-16 md:py-24">
        <div
          aria-hidden="true"
          className="texture-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_bottom,black_10%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {industriesSection.eyebrow ?? "Industries"}
            </span>
            <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              {industriesSection.heading ?? "Industries We Serve"}
            </h2>
            <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
              {industriesSection.description ??
                "Trusted by organizations across critical industries that depend on reliable, secure technology infrastructure."}
            </p>
          </motion.div>

          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {industries.map((industry: any, i: number) => {
              const Icon = industry.icon;
              return (
                <motion.li
                  key={industry.title}
                  initial={hidden}
                  whileInView={visible}
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="flex flex-col gap-4 rounded-2xl bg-secondary p-6 ring-1 ring-secondary transition duration-200 ease-out ring-inset hover:shadow-lg hover:ring-brand motion-safe:hover:-translate-y-1 md:p-8 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
                >
                  <FeaturedIcon icon={Icon} size="lg" color="brand" theme="light" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{industry.title}</h3>
                    <p className="mt-1 text-md text-tertiary">{industry.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      <GenericCMSSections sections={extraSections} />

      {/* ================================================================= */}
      {/*  FAQ Accordion — bottom of page, before final CTA                 */}
      {/* ================================================================= */}
      <section className="relative isolate overflow-hidden border-y border-secondary bg-secondary py-16 md:py-24">
        <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div
          aria-hidden="true"
          className="texture-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {faqsSection.eyebrow ?? "FAQ"}
            </span>
            <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              {faqsSection.heading ?? "Frequently Asked Questions"}
            </h2>
            <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
              {faqsSection.description ??
                "Get answers to common questions about our services, capabilities, and how we can help your business."}
            </p>
          </motion.div>

          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mx-auto mt-12 max-w-3xl md:mt-16"
          >
            <div className="rounded-2xl bg-primary p-6 shadow-sm ring-1 ring-secondary ring-inset md:p-10">
              <div className="flex flex-col gap-8">
                {faqs.map((faq: any, i: number) => (
                  <FAQItem
                    key={faq.id ?? faq.question ?? i}
                    faq={faq}
                    isOpen={openFaqs.has(i)}
                    onToggle={() => toggleFaq(i)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BrandHairline />

      {/* ================================================================= */}
      {/*  CTA Section — icon watermark + texture + drifting orbs           */}
      {/* ================================================================= */}
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative isolate overflow-hidden rounded-3xl bg-secondary px-6 py-10 ring-1 ring-secondary ring-inset lg:p-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.1)]"
          >
            {/* Depth layers */}
            <div
              aria-hidden="true"
              className="texture-grid pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_bottom_right,black_10%,transparent_70%)]"
            />
            <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.05]" />
            <BrandOrbs />
            {/* Oversized rotated icon watermark bleeding past the card edge */}
            <MessageChatCircle
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-12 size-56 -rotate-12 text-brand-500/10 md:size-72 dark:text-brand-500/15"
            />

            <div className="relative flex flex-col gap-x-8 gap-y-8 lg:flex-row lg:items-center">
              <div className="flex max-w-3xl flex-1 flex-col">
                <h2 className="text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
                  {finalCta.heading ?? "Ready to Get Started?"}
                </h2>
                <p className="mt-4 text-lg text-tertiary md:mt-5 lg:text-xl">
                  {finalCta.description ??
                    "Let our team of experts help you find the right technology solution for your business. Contact us today for a free consultation."}
                </p>
              </div>
              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start">
                <Button
                  color="secondary"
                  size="xl"
                  href={finalCta.cta_secondary?.href ?? finalCta.ctaSecondary?.href ?? "/solutions"}
                >
                  {finalCta.cta_secondary?.label ?? finalCta.ctaSecondary?.label ?? "Explore Solutions"}
                </Button>
                <Button
                  size="xl"
                  href={finalCta.cta_primary?.href ?? finalCta.ctaPrimary?.href ?? "/contact"}
                  iconTrailing={ArrowRight}
                >
                  {finalCta.cta_primary?.label ?? finalCta.ctaPrimary?.label ?? "Contact Us Today"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
