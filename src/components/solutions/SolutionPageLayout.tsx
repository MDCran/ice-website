"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, MessageChatCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Grid as GridPattern } from "@/components/shared-assets/background-patterns/grid";
import { BrandOrbs, FloatY, PulseGlow } from "@/components/effects/AmbientMotion";
import { cx } from "@/utils/cx";
import SolutionMetrics, { type MetricPreset } from "./SolutionMetrics";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Thin brand hairline separating major sections. */
function BrandHairline() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-container bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
    />
  );
}

/** Shared section-intro typography: mono eyebrow, display heading, lg supporting. */
function SectionIntroBlock({
  eyebrow,
  heading,
  description,
  align = "center",
}: {
  eyebrow?: string;
  heading: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <>
      {eyebrow && (
        <span className="text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
          {eyebrow}
        </span>
      )}
      <h2
        className={cx(
          "text-display-sm font-semibold tracking-tight text-primary md:text-display-md",
          eyebrow && "mt-3",
        )}
      >
        {heading}
      </h2>
      {description && (
        <p className={cx("mt-4 text-lg text-tertiary md:mt-5", align === "center" && "max-w-3xl")}>
          {description}
        </p>
      )}
    </>
  );
}

/** Optional CMS copy overriding the built-in intro of a known section. */
interface SectionIntro {
  eyebrow?: string;
  heading?: string;
  description?: string;
}

interface CtaLink {
  label?: string;
  href?: string;
}

interface SolutionPageLayoutProps {
  title: string;
  subtitle: string;
  categoryBadge: { label: string; icon: React.ReactNode };
  heroVisualization?: React.ReactNode;
  features: Array<{ icon: React.ReactNode; title: string; description: string; proof?: string }>;
  process: Array<{ step: string; title: string; description: string }>;
  benefits: string[];
  metricsPreset?: MetricPreset;
  extraSections?: React.ReactNode;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel?: string;
  breadcrumbLabel: string;
  /* ── Optional CMS pass-through (all additive) ──────────────────────── */
  heroEyebrow?: string;
  heroProofLabels?: string[];
  heroCtaPrimary?: CtaLink;
  heroCtaSecondary?: CtaLink;
  featuresIntro?: SectionIntro;
  processIntro?: SectionIntro;
  benefitsIntro?: SectionIntro;
  ctaPrimaryHref?: string;
  ctaSecondary?: CtaLink;
  /**
   * CMS section keys in sort order. When provided, the known blocks
   * (features/process/benefits/cta) and `orderedExtras` nodes are rendered
   * interleaved in exactly this order so no seeded section is dropped or
   * displaced. `extraSections` is ignored in that mode.
   */
  sectionOrder?: string[];
  /** Pre-rendered generic CMS sections keyed by section_key. */
  orderedExtras?: Record<string, React.ReactNode>;
}

const KNOWN_SECTION_KEYS = new Set(["hero", "features", "process", "benefits", "cta"]);

export default function SolutionPageLayout({
  title,
  subtitle,
  categoryBadge,
  heroVisualization,
  features,
  process,
  benefits,
  metricsPreset,
  extraSections,
  ctaTitle,
  ctaSubtitle,
  ctaButtonLabel = "Schedule a Consultation",
  breadcrumbLabel,
  heroEyebrow,
  heroProofLabels,
  heroCtaPrimary,
  heroCtaSecondary,
  featuresIntro,
  processIntro,
  benefitsIntro,
  ctaPrimaryHref,
  ctaSecondary,
  sectionOrder,
  orderedExtras,
}: SolutionPageLayoutProps) {
  const reduceMotion = useReducedMotion();

  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 };
  const visible = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const viewportOnce = { once: true, margin: "-80px" } as const;

  const proofLabels = (heroProofLabels ?? []).filter((label) => typeof label === "string" && label.trim());

  /* ── Features Grid ─────────────────────────────────────────────────── */
  const featuresBlock =
    features.length > 0 ? (
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <SectionIntroBlock
              eyebrow={featuresIntro?.eyebrow ?? "Key capabilities"}
              heading={featuresIntro?.heading ?? "Comprehensive features"}
              description={
                featuresIntro?.description ??
                "Purpose-built capabilities designed to deliver measurable results for your enterprise."
              }
            />
          </motion.div>

          <ul className="mt-12 grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 md:gap-y-12 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.li
                key={feature.title}
                initial={hidden}
                whileInView={visible}
                viewport={viewportOnce}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="flex max-w-sm flex-col items-center text-center"
              >
                <FeaturedIcon icon={feature.icon} size="lg" color="brand" theme="light" />
                <h3 className="mt-4 text-lg font-semibold text-primary">{feature.title}</h3>
                <p className="mt-1 text-md text-tertiary">{feature.description}</p>
                {feature.proof && (
                  <p className="mt-3 text-xs font-medium tracking-wide text-brand-secondary">
                    {feature.proof}
                  </p>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    ) : null;

  /* ── How It Works (process steps) ──────────────────────────────────── */
  const processBlock =
    process.length > 0 ? (
      <section className="bg-secondary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          >
            <SectionIntroBlock
              eyebrow={processIntro?.eyebrow ?? "The process"}
              heading={processIntro?.heading ?? "How it works"}
              description={processIntro?.description}
            />
          </motion.div>

          <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {process.map((step, i) => (
              <motion.li
                key={step.step}
                initial={hidden}
                whileInView={visible}
                viewport={viewportOnce}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className="relative flex flex-col items-center text-center"
              >
                {i < process.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-6 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-brand-500/40 to-border-secondary lg:block"
                  />
                )}
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-lg font-semibold text-fg-brand-primary dark:shadow-[0_0_40px_rgb(4_155_251/0.15)]">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary">{step.title}</h3>
                <p className="mt-1 text-md text-tertiary">{step.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    ) : null;

  /* ── Benefits Checklist ────────────────────────────────────────────── */
  const benefitsBlock =
    benefits.length > 0 ? (
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <SectionIntroBlock
                align="left"
                eyebrow={benefitsIntro?.eyebrow ?? "Why choose ICE"}
                heading={benefitsIntro?.heading ?? "The benefits"}
                description={
                  benefitsIntro?.description ??
                  "With over three decades of experience as an IBM Business Partner, ICE delivers enterprise-grade solutions backed by proven expertise and dedicated support."
                }
              />
            </motion.div>

            <ul className="flex flex-col gap-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary">
                    <Check className="size-4 text-fg-brand-primary" aria-hidden="true" />
                  </div>
                  <span className="text-md text-tertiary">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ) : null;

  /* ── Metrics Dashboard ─────────────────────────────────────────────── */
  const metricsBlock = metricsPreset ? (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SolutionMetrics preset={metricsPreset} />
      </div>
    </section>
  ) : null;

  /* ── CTA Banner — distinct brand band so it never reads as footer ──── */
  const ctaBlock = (
    <>
      <BrandHairline />
      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <motion.div
            initial={hidden}
            whileInView={visible}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative isolate overflow-hidden rounded-2xl bg-brand-section px-6 py-12 lg:p-16 dark:shadow-[0_0_60px_rgb(4_155_251/0.15)] dark:ring-1 dark:ring-secondary dark:ring-inset"
          >
            {/* Techy grid overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20"
            >
              <GridPattern size="lg" className="shrink-0 text-primary_on-brand" />
            </div>
            {/* Film-grain matte finish over the brand band */}
            <div
              aria-hidden="true"
              className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
            />
            {/* Oversized consultation glyph bleeding past the card edge */}
            <MessageChatCircle
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-12 -z-10 size-56 -rotate-12 text-brand-400/15 md:size-72 dark:text-brand-500/15"
            />
            {/* Ambient brand orbs — slow continuous drift */}
            <BrandOrbs variant="onBrand" />

            <div className="flex flex-col gap-x-8 gap-y-8 lg:flex-row lg:items-center">
              <div className="flex max-w-3xl flex-1 flex-col">
                <h2
                  className="text-display-sm font-semibold tracking-tight text-primary_on-brand md:text-display-md"
                  dangerouslySetInnerHTML={{ __html: ctaTitle }}
                />
                <p className="mt-4 text-lg text-tertiary_on-brand md:mt-5">{ctaSubtitle}</p>
              </div>
              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start">
                <Button href={ctaSecondary?.href ?? "/solutions"} color="secondary" size="xl">
                  {ctaSecondary?.label ?? "Explore All Solutions"}
                </Button>
                <Button href={ctaPrimaryHref ?? "/contact"} size="xl" iconTrailing={ArrowRight}>
                  {ctaButtonLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );

  /* Blocks for known CMS section keys, interleaved via `sectionOrder`. */
  const knownBlocks: Record<string, React.ReactNode> = {
    features: featuresBlock,
    process: processBlock,
    benefits: benefitsBlock,
  };

  const orderedKeys = (sectionOrder ?? []).filter((key, index, arr) => arr.indexOf(key) === index);
  const useOrderedFlow = orderedKeys.length > 0;

  return (
    <main className="bg-primary">
      {/* ── Hero (split: text + solution visualization) ───────────────── */}
      <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
        {/* Engineering-grid texture, fading out from the top of the band */}
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        {/* Film-grain finish so the band never reads as flat paper */}
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
        />
        {/* Ambient brand orbs — slow continuous drift behind the hero band */}
        <BrandOrbs />

        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          {/* Breadcrumb */}
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-8 flex items-center gap-1.5 text-sm"
          >
            <Link
              href="/solutions"
              className="rounded-xs font-medium text-tertiary outline-focus-ring transition-colors hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Solutions
            </Link>
            <ChevronRight className="size-4 text-fg-quaternary" aria-hidden="true" />
            <span className="font-medium text-secondary">{breadcrumbLabel}</span>
          </motion.nav>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={hidden}
              animate={visible}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex flex-col items-start"
            >
              <Badge size="lg" type="pill-color" color="brand" className="gap-1.5">
                {categoryBadge.icon}
                {categoryBadge.label}
              </Badge>

              {heroEyebrow && (
                <span className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
                  {heroEyebrow}
                </span>
              )}

              <h1
                className={cx(
                  "text-display-md font-semibold tracking-tight text-primary lg:text-display-lg",
                  heroEyebrow ? "mt-3" : "mt-4",
                )}
                dangerouslySetInnerHTML={{ __html: title }}
              />

              <p className="mt-4 max-w-xl text-lg text-tertiary md:mt-6 md:text-xl">{subtitle}</p>

              <div className="mt-8 flex flex-col-reverse items-stretch gap-3 self-stretch sm:flex-row sm:items-start sm:self-auto md:mt-10">
                <Button href={heroCtaSecondary?.href ?? "/solutions"} color="secondary" size="xl">
                  {heroCtaSecondary?.label ?? "All Solutions"}
                </Button>
                <Button href={heroCtaPrimary?.href ?? "/contact"} size="xl" iconTrailing={ArrowRight}>
                  {heroCtaPrimary?.label ?? "Get Started"}
                </Button>
              </div>

              {/* Proof labels — quiet mono trust bar under the CTAs */}
              {proofLabels.length > 0 && (
                <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 md:mt-10">
                  {proofLabels.map((label, index) => (
                    <li key={`${label}-${index}`} className="flex items-center gap-3">
                      {index > 0 && (
                        <span aria-hidden="true" className="size-1 rounded-full bg-fg-brand-secondary/60" />
                      )}
                      <span className="text-xs font-medium tracking-wide text-quaternary uppercase">
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {heroVisualization && (
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                className="relative hidden justify-center lg:flex"
              >
                {/* Soft brand glow disc anchoring the visualization — both themes */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(4_155_251/0.14),transparent_72%)] dark:bg-[radial-gradient(closest-side,rgb(4_155_251/0.22),transparent_72%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-500/15 dark:border-brand-400/20"
                />
                {/* Ambient brand glow behind the visualization — both themes */}
                <PulseGlow
                  className="inset-x-10 inset-y-6 -z-10 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15"
                  duration={7}
                  from={0.5}
                  to={0.9}
                />
                {/* Slow continuous float keeps the graphic alive after entrance */}
                <FloatY distance={10} duration={7}>
                  {heroVisualization}
                </FloatY>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {useOrderedFlow ? (
        <>
          {orderedKeys.map((key) => {
            if (key === "hero") return null;
            if (key === "cta") {
              return (
                <Fragment key="cta">
                  {metricsBlock}
                  {ctaBlock}
                </Fragment>
              );
            }
            if (KNOWN_SECTION_KEYS.has(key)) {
              return <Fragment key={key}>{knownBlocks[key] ?? null}</Fragment>;
            }
            const node = orderedExtras?.[key];
            return node ? <Fragment key={key}>{node}</Fragment> : null;
          })}
          {!orderedKeys.includes("cta") && (
            <>
              {metricsBlock}
              {ctaBlock}
            </>
          )}
        </>
      ) : (
        <>
          {featuresBlock}
          {processBlock}
          {benefitsBlock}
          {metricsBlock}
          {extraSections}
          {ctaBlock}
        </>
      )}
    </main>
  );
}
