"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CheckCircle, Minus, Plus, XClose, Zap } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Grid as GridPattern } from "@/components/shared-assets/background-patterns/grid";
import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { CountUpStat } from "@/components/ui/CountUpValue";
import { resolveIcon } from "@/lib/iconMap";
import { serviceImageFor } from "@/lib/solutionHeroImages";
import { cx } from "@/utils/cx";

/** Shared vertical rhythm for CMS section bands on solution (and other) pages. */
const SECTION_Y = "py-16 md:py-24";

export interface CMSRenderableSection {
  id?: string;
  section_key: string;
  section_type: string;
  content: Record<string, any>;
  sort_order?: number;
  is_visible?: boolean;
}

interface GenericCMSSectionsProps {
  sections?: CMSRenderableSection[];
  excludeKeys?: string[];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function list(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function titleFromKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* ── Motion primitives ─────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Entrance reveal: fades/slides content in the first time it scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Thin brand gradient hairline. */
function Hairline({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent", className)}
    />
  );
}

/** Slow continuous glow pulse layered behind a decorative accent (6-8s loop). */
function AmbientHalo({
  className,
  delay = 0,
  duration = 7,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <motion.span
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0 rounded-full", className)}
      animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.15, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Large soft brand orb that slowly breathes behind a section. */
function AmbientOrb({
  className,
  delay = 0,
  duration = 8,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cx("pointer-events-none absolute rounded-full bg-brand-solid/20 blur-3xl", className)}
      animate={reduceMotion ? undefined : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Small brand dot emitting a slow sonar ping. */
function PulseDot({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <span aria-hidden="true" className={cx("relative inline-flex size-2 shrink-0", className)}>
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-brand-solid"
          animate={{ scale: [1, 2.4], opacity: [0.45, 0] }}
          transition={{ duration: 4, delay, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative inline-flex size-2 rounded-full bg-brand-solid/80" />
    </span>
  );
}

/** Gentle continuous float for decorative graphics. */
function FloatWrap({
  children,
  className,
  duration = 7,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

type FeaturedIconProps = ComponentProps<typeof FeaturedIcon>;

/** FeaturedIcon wrapped with a slow ambient brand glow. */
function AmbientIcon({
  icon,
  size = "lg",
  delay = 0,
  className,
}: {
  icon: FeaturedIconProps["icon"];
  size?: FeaturedIconProps["size"];
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cx("relative inline-flex", className)}>
      <AmbientHalo className="bg-brand-solid/25 blur-md" delay={delay} />
      <FeaturedIcon icon={icon} size={size} color="brand" theme="light" className="relative" />
    </span>
  );
}

/* ── Stat count-up (shared CountUpStat — never wrap in opacity:0 Reveal) ── */

const DEFAULT_PROCESS_ICONS = ["Radar", "Cloud", "Monitor", "RefreshCw"];

function RoiMetricsGrid({ sectionKey, metrics }: { sectionKey: string; metrics: any[] }) {
  const gridRef = useRef<HTMLDListElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.35 });

  return (
    <dl
      ref={gridRef}
      className={cx(
        "mt-12 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl bg-secondary ring-1 ring-secondary md:mt-16",
        metrics.length === 3
          ? "md:grid-cols-3"
          : metrics.length === 2
            ? "md:grid-cols-2"
            : metrics.length === 1
              ? "md:grid-cols-1"
              : "md:grid-cols-4",
      )}
    >
      {metrics.map((metric, index) => {
        const note = text(metric.note ?? metric.source_note ?? metric.sourceNote);
        return (
          <div
            key={`${metric.label ?? sectionKey}-${index}`}
            className="flex flex-col items-center justify-center gap-2 bg-primary px-5 py-8 text-center md:px-6 md:py-10"
          >
            <dd className="text-display-md font-semibold tracking-tight text-brand-tertiary_alt md:text-display-lg">
              <CountUpStat value={metric.value} suffix={text(metric.suffix)} inView={inView} duration={1400} />
            </dd>
            <dt className="text-sm font-semibold text-primary">{text(metric.label)}</dt>
            {note && <p className="text-xs text-quaternary">{note}</p>}
          </div>
        );
      })}
    </dl>
  );
}

function renderStats(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <StatsSection section={section} items={items} content={content} />
  );
}

function StatsSection({
  section,
  items,
  content,
}: {
  section: CMSRenderableSection;
  items: any[];
  content: Record<string, any>;
}) {
  const gridRef = useRef<HTMLDListElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.35 });

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <div className="relative mt-12 overflow-hidden rounded-2xl bg-secondary ring-1 ring-secondary ring-inset md:mt-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.08)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
          />
          <dl
            ref={gridRef}
            className={cx(
              "relative grid grid-cols-2 divide-y divide-secondary sm:divide-y-0 md:divide-x",
              items.length === 3
                ? "md:grid-cols-3"
                : items.length === 2
                  ? "md:grid-cols-2"
                  : items.length === 1
                    ? "md:grid-cols-1"
                    : "md:grid-cols-4",
            )}
          >
            {items.map((item, index) => {
              const sourceNote = text(item.source_note ?? item.sourceNote);
              return (
                <div
                  key={`${item.label ?? section.section_key}-${index}`}
                  className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center md:px-8 md:py-14"
                >
                  <dd className="text-display-md font-semibold tracking-tight text-brand-tertiary_alt md:text-display-lg">
                    <CountUpStat value={item.value} suffix={text(item.suffix)} inView={inView} duration={1400} />
                  </dd>
                  <dt className="text-sm font-semibold text-primary md:text-md">{text(item.label)}</dt>
                  {sourceNote && <p className="text-xs text-quaternary">{sourceNote}</p>}
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ── Shared building blocks ────────────────────────────────────────────── */

function CTAButton({
  button,
  color = "primary",
}: {
  button?: { label?: string; href?: string };
  color?: "primary" | "secondary";
}) {
  const label = text(button?.label);
  const href = text(button?.href);
  if (!label || !href) return null;

  return (
    <Button color={color} size="xl" href={href} iconTrailing={color === "primary" ? ArrowRight : undefined}>
      {label}
    </Button>
  );
}

function SectionHeading({
  eyebrow,
  heading,
  description,
}: {
  eyebrow?: string;
  heading: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {eyebrow && (
        <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className={cx("text-display-sm font-semibold tracking-tight text-primary md:text-display-md", eyebrow && "mt-3")}>
        {heading}
      </h2>
      {description && <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">{description}</p>}
    </Reveal>
  );
}

/* ── Section renderers ─────────────────────────────────────────────────── */

/** Generic page-header hero with optional proof-label trust bar. */
function renderHero(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const eyebrow = text(content.eyebrow ?? content.label ?? content.badge);
  const headline = text(content.headline ?? content.heading, titleFromKey(section.section_key));
  const highlight = text(content.headline_highlight);
  const subheadline = text(content.subheadline ?? content.description);
  const proofLabels = list(content.proof_labels).filter((label) => typeof label === "string" && label.trim());
  const ctaPrimary = content.cta_primary ?? content.ctaPrimary;
  const ctaSecondary = content.cta_secondary ?? content.ctaSecondary;
  const hasCta = Boolean(
    (text(ctaPrimary?.label) && text(ctaPrimary?.href)) ||
      (text(ctaSecondary?.label) && text(ctaSecondary?.href)),
  );

  return (
    <section className={cx("relative overflow-hidden bg-primary", SECTION_Y)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-60">
        <GridPattern size="lg" className="-translate-y-1/2" />
      </div>
      <AmbientOrb className="top-1/4 left-1/2 size-96 -translate-x-1/2 bg-brand-solid/10" duration={10} />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className={cx("text-display-lg font-semibold tracking-tight text-primary md:text-display-xl", eyebrow && "mt-4")}>
            {headline}
            {highlight && <span className="text-brand-tertiary_alt"> {highlight}</span>}
          </h1>
          {subheadline && <p className="mt-4 max-w-2xl text-lg text-tertiary md:mt-6 md:text-xl">{subheadline}</p>}
          {hasCta && (
            <div className="mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-10">
              <CTAButton button={ctaSecondary} color="secondary" />
              <CTAButton button={ctaPrimary} />
            </div>
          )}
          {proofLabels.length > 0 && (
            <ul className="mt-10 flex w-full max-w-2xl flex-col gap-3 border-t border-secondary pt-6 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-0 sm:divide-x sm:divide-secondary">
              {proofLabels.map((label) => (
                <li
                  key={label}
                  className="flex flex-1 items-center justify-center gap-2.5 sm:px-4"
                >
                  <Check className="size-4 shrink-0 text-fg-brand-primary dark:text-white" aria-hidden="true" />
                  <span className="text-sm font-medium text-secondary">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Statement band — restrained secondary surface, not a loud blue wash. */
function renderBanner(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const eyebrow = text(content.eyebrow ?? content.label);
  const statement = text(content.text ?? content.heading ?? content.headline, titleFromKey(section.section_key));
  const description = text(content.description ?? content.subheadline);
  const cta = content.cta ?? content.cta_primary ?? content.ctaPrimary;
  const hasCta = Boolean(text(cta?.label) && text(cta?.href));

  return (
    <section className={cx("relative isolate overflow-hidden bg-secondary", SECTION_Y)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/[0.06] via-transparent to-brand-600/[0.04]"
      />
      <div
        aria-hidden="true"
        className="texture-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]"
      />
      <BrandOrbs />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="mb-3 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {eyebrow}
            </span>
          )}
          <p className="text-display-xs font-semibold tracking-tight text-primary md:text-display-sm">
            {statement}
          </p>
          {description && <p className="mt-4 max-w-2xl text-lg text-tertiary md:mt-5">{description}</p>}
          {hasCta && (
            <div className="mt-8">
              <CTAButton button={cta} color="primary" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Icon cards grid for use cases. */
function renderUseCases(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("relative overflow-hidden bg-primary", SECTION_Y)}>
      {/* Soft dot-matrix backdrop fading from the top so cards sit on a surface */}
      <div
        aria-hidden="true"
        className="texture-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]"
      />
      <AmbientOrb className="-top-24 right-[12%] size-80 bg-brand-solid/10" duration={11} />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul
          className={cx(
            "mt-12 grid grid-cols-1 gap-5 md:mt-16",
            items.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : items.length === 3
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.06} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl bg-secondary p-6 ring-1 ring-secondary ring-inset transition duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-brand md:p-8">
                    <AmbientIcon icon={Icon} size="lg" delay={(index % 3) * 1.1} className="self-start" />
                    <h3 className="mt-5 text-lg font-semibold text-primary">
                      {text(item.title, `Use Case ${index + 1}`)}
                    </h3>
                    <p className="mt-1 text-md text-tertiary">{text(item.description ?? item.desc)}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Link cards pointing at related services — matches /solutions + home popular cards. */
function renderRelated(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("relative overflow-hidden bg-primary", SECTION_Y)}>
      {/* Engineering grid rising from the bottom edge — reads as a distinct band */}
      <div
        aria-hidden="true"
        className="texture-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_bottom,black_15%,transparent_70%)]"
      />
      <AmbientOrb className="bottom-0 left-[10%] size-72 bg-brand-solid/10" duration={12} delay={1.5} />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, "Related Services")}
          description={text(content.description)}
        />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 md:gap-6 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const href = text(item.href, "/solutions");
            const serviceImage = serviceImageFor(item);
            const desc = text(item.description ?? item.desc);

            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.06} className="h-full">
                  <Link
                    href={href}
                    className="group relative isolate flex h-full min-h-56 overflow-hidden rounded-2xl border border-secondary bg-primary p-6 shadow-xs transition duration-200 ease-out hover:border-brand hover:shadow-lg motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
                  >
                    {serviceImage && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[58%] overflow-hidden sm:w-[62%]"
                      >
                        <img
                          src={serviceImage}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full translate-x-[12%] object-cover object-center opacity-[0.18] transition-opacity duration-500 ease-out group-hover:opacity-[0.55] dark:opacity-[0.22] dark:group-hover:opacity-[0.62]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] from-0% via-[var(--color-bg-primary)]/90 via-35% to-transparent to-85%" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/40 via-transparent to-[var(--color-bg-primary)]/50 dark:from-[var(--color-bg-primary)]/20 dark:to-[var(--color-bg-primary)]/30" />
                      </div>
                    )}

                    <div className="relative z-10 flex h-full max-w-[70%] flex-col items-start sm:max-w-[74%]">
                      <FeaturedIcon icon={Icon} size="lg" color="brand" theme="light" />
                      <h3 className="mt-4 text-lg font-semibold text-primary">
                        {text(item.title, `Service ${index + 1}`)}
                      </h3>
                      {desc && <p className="mt-1 flex-1 text-md text-tertiary">{desc}</p>}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary transition duration-150 ease-linear group-hover:gap-2.5">
                        Learn more
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Numbered operating-model steps — FeaturedIcon per step (CMS icon or defaults). */
function renderProcess(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-secondary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {items.map((item, index) => {
            const stepLabel = text(String(item.step ?? ""), String(index + 1).padStart(2, "0"));
            const iconName = text(item.icon, DEFAULT_PROCESS_ICONS[index % DEFAULT_PROCESS_ICONS.length]);
            const Icon = resolveIcon(iconName);

            return (
              <li key={`${item.step ?? item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.1} className="relative flex h-full flex-col items-center text-center">
                  {index < items.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-6 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-brand-500/50 to-border-secondary lg:block"
                    />
                  )}
                  <div className="relative">
                    <FeaturedIcon icon={Icon} size="lg" color="brand" theme="light" />
                    <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-[10px] font-bold text-white ring-2 ring-secondary">
                      {stepLabel.replace(/^0/, "")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-primary">
                    {text(item.title, `Step ${index + 1}`)}
                  </h3>
                  <p className="mt-1 text-md text-tertiary">{text(item.description ?? item.desc)}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function renderFeatureGrid(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("relative overflow-hidden bg-primary", SECTION_Y)}>
      {/* Faint centered dot field so the icon columns float on a textured surface */}
      <div
        aria-hidden="true"
        className="texture-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul
          className={cx(
            "mt-12 grid w-full justify-items-center gap-x-8 gap-y-10 md:mt-16 md:gap-y-12",
            items.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : items.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : items.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const proof = text(item.proof);
            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal
                  delay={index * 0.06}
                  className={cx(
                    "flex flex-col items-center gap-4 text-center",
                    items.length === 4 ? "max-w-xs" : "max-w-sm",
                  )}
                >
                  <AmbientIcon icon={Icon} size="lg" delay={(index % 3) * 1.1} />
                  <div className="w-full min-w-0">
                    <h3 className="truncate text-lg font-semibold whitespace-nowrap text-primary">
                      {text(item.title, `Item ${index + 1}`)}
                    </h3>
                    <p className="mt-1 text-md text-tertiary">
                      {text(item.description ?? item.desc)}
                    </p>
                    {proof && (
                      <p className="mt-3 text-xs font-medium text-brand-secondary">{proof}</p>
                    )}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Scannable outcome band — 3-4 payoff pillars on a textured brand-tinted surface. */
function renderValueProps(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("relative isolate overflow-hidden bg-secondary", SECTION_Y)}>
      <BrandOrbs />
      {/* Engineering grid rising from the center, masked so the pillars float on a surface */}
      <div
        aria-hidden="true"
        className="texture-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul
          className={cx(
            "mt-12 grid grid-cols-1 gap-5 md:mt-16",
            items.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : items.length === 3
                ? "sm:grid-cols-3"
                : items.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const outcome = text(item.outcome ?? item.description ?? item.desc ?? item.text);
            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.08} className="h-full">
                  <div className="flex h-full flex-col items-start rounded-2xl bg-primary p-6 ring-1 ring-secondary ring-inset transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand md:p-8">
                    <AmbientIcon icon={Icon} size="lg" delay={(index % 4) * 1.1} />
                    <h3 className="mt-5 text-lg font-semibold text-primary md:text-xl">
                      {text(item.title, `Value ${index + 1}`)}
                    </h3>
                    {outcome && <p className="mt-2 text-md text-tertiary">{outcome}</p>}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** ROI band — clean secondary surface with a proper comparison table. */
function renderRoi(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const metrics = list(content.metrics);
  const comparison =
    content.comparison && typeof content.comparison === "object" ? content.comparison : null;
  const comparisonRows = comparison ? list(comparison.rows) : [];
  const hasComparison = comparisonRows.length > 0;
  const cta = content.cta ?? content.cta_primary ?? content.ctaPrimary;
  const ctaLabel = text(cta?.label);
  const ctaHref = text(cta?.href, "/contact");
  const hasCta = Boolean(ctaLabel);
  const beforeLabel = text(comparison?.before_label ?? comparison?.beforeLabel, "In-House / DIY");
  const afterLabel = text(comparison?.after_label ?? comparison?.afterLabel, "With ICE");

  if (metrics.length === 0 && !hasComparison && !hasCta) {
    return renderContentBlock(section);
  }

  return (
    <section className={cx("relative isolate overflow-hidden bg-secondary", SECTION_Y)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/[0.05] via-transparent to-transparent"
      />
      <BrandOrbs />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {text(content.eyebrow ?? content.label) && (
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {text(content.eyebrow ?? content.label)}
            </span>
          )}
          <h2
            className={cx(
              "text-display-sm font-semibold tracking-tight text-primary md:text-display-md",
              (content.eyebrow || content.label) && "mt-3",
            )}
          >
            {text(content.heading, titleFromKey(section.section_key))}
          </h2>
          {text(content.description) && (
            <p className="mt-4 max-w-2xl text-lg text-tertiary md:mt-5">{text(content.description)}</p>
          )}
        </Reveal>

        {metrics.length > 0 && (
          <RoiMetricsGrid sectionKey={section.section_key} metrics={metrics} />
        )}

        {hasComparison && (
          <div className="mt-12 w-full md:mt-16">
            <div className="overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary bg-secondary/60">
                    <th scope="col" className="px-5 py-4 text-xs font-medium tracking-[0.15em] text-quaternary uppercase md:px-6">
                      Capability
                    </th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-medium tracking-[0.15em] text-quaternary uppercase md:px-5">
                      {beforeLabel}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-medium tracking-[0.15em] text-brand-secondary uppercase md:px-5">
                      {afterLabel}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={`${row.label ?? index}`}
                      className="border-b border-secondary last:border-b-0"
                    >
                      <th scope="row" className="px-5 py-4 text-md font-medium text-primary md:px-6">
                        {text(row.label)}
                      </th>
                      <td className="px-4 py-4 text-center md:px-5">
                        <span className="inline-flex items-center justify-center gap-1.5 text-sm text-tertiary">
                          <XClose aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />
                          <span className="hidden sm:inline">{text(row.before)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center md:px-5">
                        <span className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary">
                          <Check aria-hidden="true" className="size-4 shrink-0 text-fg-brand-primary dark:text-white" />
                          <span className="hidden sm:inline">{text(row.after)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasCta && (
          <Reveal delay={0.16} className="mt-10 flex justify-center md:mt-12">
            <Button color="primary" size="xl" href={ctaHref} iconTrailing={ArrowRight}>
              {ctaLabel}
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function renderTimeline(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <div className="mx-auto mt-12 flex max-w-3xl flex-col md:mt-16">
          {items.map((item, index) => (
            <Reveal
              key={`${item.year ?? item.step ?? index}`}
              delay={index * 0.06}
              className="relative flex gap-4 md:gap-6"
            >
              <div className="flex flex-col items-center">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-solid text-md font-semibold text-white">
                  <AmbientHalo className="bg-brand-solid/20 blur-sm" delay={index * 0.8} />
                  <span className="relative">{index + 1}</span>
                </div>
                {index < items.length - 1 && <div className="my-1 w-px flex-1 border-l border-secondary" />}
              </div>
              <div className={cx("min-w-0 flex-1", index < items.length - 1 && "pb-8 md:pb-10")}>
                <p className="pt-0.5 text-sm font-semibold text-brand-secondary">
                  {text(item.year ?? item.step, `Step ${index + 1}`)}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-primary">{text(item.title)}</h3>
                <p className="mt-1 text-md text-tertiary">{text(item.description)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderBenefits(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul className="mx-auto mt-12 grid w-full max-w-4xl grid-cols-1 gap-x-8 gap-y-6 md:mt-16 md:grid-cols-2">
          {items.map((item, index) => {
            const isRich =
              typeof item === "object" && item !== null && Boolean(text(item.title) || text(item.icon));

            if (!isRich) {
              return (
                <li key={index}>
                  <Reveal delay={index * 0.04} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                    <span className="text-md text-tertiary">
                      {typeof item === "string" ? item : text(item?.text ?? item?.label ?? item?.title)}
                    </span>
                  </Reveal>
                </li>
              );
            }

            const Icon = resolveIcon(item.icon);
            const body = text(item.text ?? item.description ?? item.desc);
            return (
              <li key={index}>
                <Reveal delay={index * 0.04} className="flex items-start gap-4">
                  <AmbientIcon icon={Icon} size="md" delay={(index % 4) * 1.3} className="shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-md font-semibold text-primary">{text(item.title, `Benefit ${index + 1}`)}</h3>
                    {body && <p className="mt-0.5 text-md text-tertiary">{body}</p>}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function renderFaq(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <Reveal delay={0.1} className="mx-auto mt-12 flex max-w-3xl flex-col gap-6 md:mt-16">
          {items.map((item, index) => (
            <details
              key={`${item.question ?? index}`}
              className="group not-first:border-t not-first:border-secondary not-first:pt-6"
            >
              <summary className="flex w-full cursor-pointer list-none items-start justify-between gap-2 rounded-md text-left outline-focus-ring select-none focus-visible:outline-2 focus-visible:outline-offset-2 md:gap-6 [&::-webkit-details-marker]:hidden">
                <span className="text-md font-semibold text-primary">
                  {text(item.question, `Question ${index + 1}`)}
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-6 items-center justify-center text-fg-quaternary transition-colors duration-200 group-open:text-fg-brand-primary"
                >
                  <Plus className="size-5 group-open:hidden" />
                  <Minus className="hidden size-5 group-open:block" />
                </span>
              </summary>
              <p className="mt-2 pr-8 text-md text-tertiary md:pr-12">{text(item.answer)}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function renderPartners(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.partners ?? content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
          {items.map((item, index) => {
            const name = typeof item === "string" ? item : text(item.name, `Partner ${index + 1}`);
            const logo = typeof item === "object" ? text(item.logo_src ?? item.logoSrc) : "";
            return (
              <li key={`${name}-${index}`}>
                <Reveal
                  delay={index * 0.06}
                  className="flex h-full flex-col rounded-2xl bg-secondary p-6 ring-1 ring-secondary ring-inset transition duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-brand md:p-8"
                >
                  <div className="flex items-center gap-4">
                    {logo && (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary p-2 ring-1 ring-primary ring-inset">
                        <img src={logo} alt="" className="max-h-10 max-w-10 object-contain" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-primary">{name}</h3>
                  </div>
                  {typeof item === "object" && (
                    <>
                      {text(item.description) && (
                        <p className="mt-4 text-md text-tertiary">{text(item.description)}</p>
                      )}
                      {list(item.specializations).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {list(item.specializations).map((specialization, specIndex) => (
                            <Badge key={`${specialization}-${specIndex}`} size="sm" color="brand">
                              {specialization}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function renderContact(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ul className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const href = text(item.href);
            const value = text(item.value);
            const subValue = text(item.subValue ?? item.sub_value);
            return (
              <li key={`${item.label ?? index}`}>
                <Reveal
                  delay={index * 0.06}
                  className="flex h-full flex-col items-start rounded-2xl bg-secondary p-6 ring-1 ring-secondary ring-inset transition duration-300 hover:-translate-y-1 hover:ring-brand"
                >
                  <AmbientIcon size="lg" icon={Icon} delay={(index % 4) * 1.2} />
                  <h3 className="mt-6 text-lg font-semibold text-primary md:mt-8">
                    {text(item.label ?? item.title)}
                  </h3>
                  {value &&
                    (href ? (
                      <Button color="link-color" size="lg" href={href} className="mt-1 whitespace-pre-line">
                        {value}
                      </Button>
                    ) : (
                      <p className="mt-1 text-md font-medium text-primary">{value}</p>
                    ))}
                  {subValue && <p className="mt-1 text-sm text-tertiary">{subValue}</p>}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function renderContentBlock(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const features = list(content.features);
  const options = list(content.options);
  const heading = text(content.heading ?? content.headline, titleFromKey(section.section_key));
  const description = text(content.description ?? content.subheadline);
  const illustrationId = text(content.illustration ?? content.graphic);
  const illustrationPos = text(content.illustration_position ?? content.graphic_position, "right");
  const ctaPrimary = content.cta_primary ?? content.ctaPrimary;
  const ctaSecondary = content.cta_secondary ?? content.ctaSecondary;
  const hasCta = Boolean(
    (text(ctaPrimary?.label) && text(ctaPrimary?.href)) ||
      (text(ctaSecondary?.label) && text(ctaSecondary?.href)),
  );

  const textBlock = (
    <div className="flex flex-col items-start">
      {(content.eyebrow || content.label) && (
        <span className="mb-3 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
          {text(content.eyebrow ?? content.label)}
        </span>
      )}
      <h2 className="text-display-sm font-semibold tracking-tight text-primary md:text-display-md">{heading}</h2>
      {description && <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">{description}</p>}
      {features.length > 0 && (
        <ul className="mt-8 grid w-full gap-x-6 gap-y-4 sm:grid-cols-2">
          {features.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
              <span className="text-md text-tertiary">
                {typeof item === "string" ? item : text(item.label ?? item.title)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {options.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {options.map((item, index) => (
            <Badge key={`${item}-${index}`} size="md" color="gray">
              {typeof item === "string" ? item : text(item.label ?? item.title)}
            </Badge>
          ))}
        </div>
      )}
      {hasCta && (
        <div className="mt-8 flex flex-col-reverse items-stretch gap-3 self-stretch sm:flex-row sm:items-start md:mt-12">
          <CTAButton button={content.cta_secondary ?? content.ctaSecondary} color="secondary" />
          <CTAButton button={content.cta_primary ?? content.ctaPrimary} />
        </div>
      )}
    </div>
  );

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal>
          {illustrationId ? (
            <div
              className={cx(
                "grid grid-cols-1 items-center gap-12 lg:gap-16",
                illustrationPos === "left" ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[1fr_320px]",
              )}
            >
              {illustrationPos === "left" && (
                <FloatWrap className="mx-auto w-full max-w-80 lg:mx-0">
                  <IllustrationRenderer id={illustrationId} className="h-auto w-full" />
                </FloatWrap>
              )}
              {textBlock}
              {illustrationPos !== "left" && (
                <FloatWrap className="mx-auto hidden w-full max-w-80 lg:mx-0 lg:block">
                  <IllustrationRenderer id={illustrationId} className="h-auto w-full" />
                </FloatWrap>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">{textBlock}</div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function renderCta(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const illustrationId = text(content.illustration ?? content.graphic);
  const watermarkIconName = text(content.icon);
  const WatermarkIcon = watermarkIconName ? resolveIcon(watermarkIconName) : Zap;

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal>
          <div className="relative isolate flex flex-col gap-x-8 gap-y-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-bg-secondary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] px-6 py-10 ring-1 ring-secondary ring-inset lg:flex-row lg:items-center lg:p-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.15)]">
            {/* Depth layers: engineering grid fading from the top-left, film grain,
                and a large rotated icon watermark bleeding past the card corner. */}
            <div
              aria-hidden="true"
              className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_75%)]"
            />
            <div
              aria-hidden="true"
              className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.07]"
            />
            <WatermarkIcon
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-10 -z-10 size-56 -rotate-12 text-brand-500/10 md:size-64 dark:text-brand-500/15"
            />
            <BrandOrbs />
            {illustrationId && (
              <FloatWrap className="relative w-40 shrink-0 self-center lg:self-auto">
                <IllustrationRenderer id={illustrationId} className="h-auto w-full" />
              </FloatWrap>
            )}
            <div className="relative flex max-w-3xl flex-1 flex-col">
              <h2 className="text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
                {text(content.heading ?? content.headline, titleFromKey(section.section_key))}
              </h2>
              <p className="mt-4 text-lg text-tertiary md:mt-5 lg:text-xl">
                {text(content.description ?? content.subheadline)}
              </p>
            </div>
            <div className="relative flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start">
              <CTAButton button={content.cta_secondary ?? content.ctaSecondary} color="secondary" />
              <CTAButton button={content.cta_primary ?? content.ctaPrimary} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function renderIllustration(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const illustrationId = text(content.illustration ?? content.graphic ?? content.id);
  if (!illustrationId) return null;

  return (
    <section className={cx("bg-primary", SECTION_Y)}>
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto max-w-md">
          <FloatWrap>
            <IllustrationRenderer id={illustrationId} className="h-auto w-full" />
          </FloatWrap>
          {(content.caption || content.label) && (
            <p className="mt-4 text-center text-sm text-tertiary">{text(content.caption ?? content.label)}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function renderSection(section: CMSRenderableSection) {
  const type = section.section_type;

  if (type === "hero") return renderHero(section);
  if (type === "banner") return renderBanner(section);
  if (type === "value_props") return renderValueProps(section);
  if (type === "roi") return renderRoi(section);
  if (type === "use_cases") return renderUseCases(section);
  if (type === "related") return renderRelated(section);
  if (type === "process") return renderProcess(section);
  if (type === "features" || type === "industries") {
    return renderFeatureGrid(section);
  }
  if (type === "stats" || type === "metrics") return renderStats(section);
  if (type === "timeline") return renderTimeline(section);
  if (type === "benefits") return renderBenefits(section);
  if (type === "faq") return renderFaq(section);
  if (type === "partners" || type === "gallery") return renderPartners(section);
  if (type === "contact") return renderContact(section);
  if (type === "cta") return renderCta(section);
  if (type === "illustration" || type === "graphic") return renderIllustration(section);

  return renderContentBlock(section);
}

export default function GenericCMSSections({
  sections = [],
  excludeKeys = [],
}: GenericCMSSectionsProps) {
  const excluded = new Set(excludeKeys);
  const visibleSections = sections
    .filter((section) => section.is_visible !== false && !excluded.has(section.section_key))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((section) => (
        <div key={section.id ?? section.section_key}>{renderSection(section)}</div>
      ))}
    </>
  );
}
