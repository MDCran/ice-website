"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CheckCircle, Minus, Plus, XClose, Zap } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Grid as GridPattern } from "@/components/shared-assets/background-patterns/grid";
import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import { BrandOrbs, Drift } from "@/components/effects/AmbientMotion";
import { resolveIcon } from "@/lib/iconMap";
import { cx } from "@/utils/cx";

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

/* ── Stat count-up ─────────────────────────────────────────────────────── */

interface ParsedStat {
  prefix: string;
  target: number;
  decimals: number;
  grouped: boolean;
  rest: string;
}

/** Extracts the first numeric run from a stat value, keeping surrounding text intact. */
function parseStatValue(raw: unknown): ParsedStat | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const decimals = String(raw).split(".")[1]?.length ?? 0;
    return { prefix: "", target: raw, decimals, grouped: false, rest: "" };
  }
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/^([^0-9]*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!match) return null;
  const [, prefix = "", num = "", rest = ""] = match;
  const target = Number.parseFloat(num.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const decimals = num.includes(".") ? (num.split(".")[1]?.length ?? 0) : 0;
  return { prefix, target, decimals, grouped: num.includes(","), rest };
}

function formatStat(value: number, parsed: ParsedStat): string {
  if (parsed.grouped) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    });
  }
  return value.toFixed(parsed.decimals);
}

/** Stat display value that counts up the first time it scrolls into view. */
function StatValue({ value, suffix }: { value: any; suffix: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!parsed || !inView) return;
    if (reduceMotion) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, parsed, reduceMotion]);

  if (!parsed) {
    return (
      <span>
        {value}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className="tabular-nums">
      {parsed.prefix}
      {formatStat(parsed.target * progress, parsed)}
      {parsed.rest}
      {suffix}
    </span>
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
        <span className="font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
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
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-60">
        <GridPattern size="lg" className="-translate-y-1/2" />
      </div>
      <AmbientOrb className="top-1/4 left-1/2 size-96 -translate-x-1/2 bg-brand-solid/10" duration={10} />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
              {eyebrow}
            </span>
          )}
          <h1 className={cx("text-display-md font-semibold tracking-tight text-primary md:text-display-lg", eyebrow && "mt-4")}>
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
            <div className="mt-10 flex w-full flex-col items-center gap-4 md:mt-12">
              <Hairline />
              <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                {proofLabels.map((label, index) => (
                  <li key={`${label}-${index}`} className="flex items-center gap-3">
                    {index > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-fg-brand-secondary/60" />}
                    <span className="font-mono text-xs font-medium tracking-wide text-quaternary uppercase">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Full-width brand statement band — a distinct mid-page brand moment. */
function renderBanner(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const eyebrow = text(content.eyebrow ?? content.label);
  const statement = text(content.text ?? content.heading ?? content.headline, titleFromKey(section.section_key));
  const description = text(content.description ?? content.subheadline);
  const cta = content.cta ?? content.cta_primary ?? content.ctaPrimary;
  const hasCta = Boolean(text(cta?.label) && text(cta?.href));
  const watermarkIconName = text(content.icon);
  const WatermarkIcon = watermarkIconName ? resolveIcon(watermarkIconName) : Zap;

  return (
    <section className="relative isolate overflow-hidden bg-brand-section py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-solid/25 via-transparent to-brand-solid/10"
      />
      {/* Slow-drifting sheen — a diagonal light band that sways across the band */}
      <Drift
        className="absolute inset-y-0 -left-1/4 w-1/2 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent blur-2xl"
        distance={220}
        duration={20}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-[0.08]">
        <GridPattern size="lg" className="-translate-y-1/2 text-primary_on-brand" />
      </div>
      <AmbientOrb className="-top-20 left-[15%] size-72 bg-brand-solid/30" />
      <AmbientOrb className="-bottom-24 right-[10%] size-80 bg-brand-solid/25" duration={9.5} delay={1.6} />
      {/* Matte film grain + rotated icon watermark bleeding past the band edge */}
      <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.05]" />
      <WatermarkIcon
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -bottom-8 size-40 -rotate-12 text-white/[0.07] md:size-48"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          {eyebrow && (
            <span className="mb-3 font-mono text-xs font-semibold tracking-widest text-secondary_on-brand uppercase md:text-sm">
              {eyebrow}
            </span>
          )}
          <p className="text-display-xs font-semibold tracking-tight text-primary_on-brand md:text-display-md">
            {statement}
          </p>
          {description && <p className="mt-4 max-w-2xl text-lg text-tertiary_on-brand md:mt-5">{description}</p>}
          {hasCta && (
            <div className="mt-8">
              <CTAButton button={cta} color="secondary" />
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
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
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
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
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

/** Link cards pointing at related services. */
function renderRelated(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      {/* Engineering grid rising from the bottom edge — reads as a distinct band */}
      <div
        aria-hidden="true"
        className="texture-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_bottom,black_15%,transparent_70%)]"
      />
      <AmbientOrb className="-bottom-28 left-[10%] size-80 bg-brand-solid/10" duration={12} delay={1.5} />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, "Related Services")}
          description={text(content.description)}
        />
        <ul className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const href = text(item.href, "/solutions");
            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.06} className="h-full">
                  <a
                    href={href}
                    className="group flex h-full cursor-pointer flex-col rounded-2xl bg-secondary p-6 ring-1 ring-secondary ring-inset outline-focus-ring transition duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <AmbientIcon icon={Icon} size="md" delay={(index % 3) * 1.2} />
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-1 size-5 text-fg-quaternary transition duration-300 group-hover:translate-x-1 group-hover:text-fg-brand-primary"
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-primary">
                      {text(item.title, `Service ${index + 1}`)}
                    </h3>
                    <p className="mt-1 text-md text-tertiary">{text(item.description ?? item.desc)}</p>
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Numbered operating-model steps. */
function renderProcess(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={`${item.step ?? item.title ?? section.section_key}-${index}`}>
              <Reveal delay={index * 0.06} className="flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-display-xs font-semibold tracking-tight text-brand-tertiary_alt">
                    {text(String(item.step ?? ""), String(index + 1).padStart(2, "0"))}
                  </span>
                  <PulseDot delay={index * 0.9} />
                  <div aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-brand-500/40 to-transparent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary">{text(item.title, `Step ${index + 1}`)}</h3>
                <p className="mt-1 text-md text-tertiary">{text(item.description ?? item.desc)}</p>
              </Reveal>
            </li>
          ))}
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
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
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
        <ul className="mt-12 grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 md:gap-y-16 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = resolveIcon(item.icon);
            const proof = text(item.proof);
            return (
              <li key={`${item.title ?? section.section_key}-${index}`}>
                <Reveal delay={index * 0.06} className="flex max-w-sm flex-col items-center gap-4 text-center">
                  <AmbientIcon icon={Icon} size="lg" delay={(index % 3) * 1.1} />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {text(item.title, `Item ${index + 1}`)}
                    </h3>
                    <p className="mt-1 text-md text-tertiary">
                      {text(item.description ?? item.desc)}
                    </p>
                    {proof && (
                      <p className="mt-3 font-mono text-xs font-medium text-brand-secondary">{proof}</p>
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

function renderStats(section: CMSRenderableSection) {
  const content = section.content ?? {};
  const items = list(content.items);
  if (items.length === 0) return renderContentBlock(section);

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <SectionHeading
          eyebrow={text(content.eyebrow ?? content.label)}
          heading={text(content.heading, titleFromKey(section.section_key))}
          description={text(content.description)}
        />
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-secondary ring-1 ring-secondary ring-inset md:mt-16 dark:shadow-[0_0_40px_rgb(4_155_251/0.08)]">
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
          <dl className="relative grid grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:p-16">
          {items.map((item, index) => {
            const sourceNote = text(item.source_note ?? item.sourceNote);
            return (
              <Reveal
                key={`${item.label ?? section.section_key}-${index}`}
                delay={index * 0.06}
                className="flex flex-1 flex-col-reverse gap-3 text-center"
              >
                {sourceNote && <p className="font-mono text-xs text-quaternary">{sourceNote}</p>}
                <dt className="text-md font-semibold text-primary md:text-lg">{text(item.label)}</dt>
                <dd className="font-mono text-display-md font-semibold tracking-tight text-brand-tertiary_alt md:text-display-lg">
                  <StatValue value={item.value} suffix={text(item.suffix)} />
                </dd>
              </Reveal>
            );
          })}
          </dl>
        </div>
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
    <section className="relative isolate overflow-hidden bg-secondary py-16 md:py-24">
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
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
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

/** The conversion money-band — count-up ROI metrics, before/after proof, and a decisive CTA. */
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

  if (metrics.length === 0 && !hasComparison && !hasCta) {
    return renderContentBlock(section);
  }

  return (
    <section className="relative isolate overflow-hidden bg-brand-section py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-solid/25 via-transparent to-brand-solid/10"
      />
      <BrandOrbs variant="onBrand" />
      {/* Engineering grid + film grain for depth on the brand band */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-[0.08]">
        <GridPattern size="lg" className="-translate-y-1/2 text-primary_on-brand" />
      </div>
      <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {text(content.eyebrow ?? content.label) && (
            <span className="font-mono text-xs font-semibold tracking-widest text-secondary_on-brand uppercase md:text-sm">
              {text(content.eyebrow ?? content.label)}
            </span>
          )}
          <h2 className={cx("text-display-sm font-semibold tracking-tight text-primary_on-brand md:text-display-md", (content.eyebrow || content.label) && "mt-3")}>
            {text(content.heading, titleFromKey(section.section_key))}
          </h2>
          {text(content.description) && (
            <p className="mt-4 max-w-2xl text-lg text-tertiary_on-brand md:mt-5">{text(content.description)}</p>
          )}
        </Reveal>

        {metrics.length > 0 && (
          <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 md:mt-16 md:grid-cols-4">
            {metrics.map((metric, index) => {
              const note = text(metric.note ?? metric.source_note ?? metric.sourceNote);
              return (
                <Reveal
                  key={`${metric.label ?? section.section_key}-${index}`}
                  delay={index * 0.08}
                  className="flex flex-col-reverse gap-2 text-center"
                >
                  {note && <p className="font-mono text-xs text-quaternary_on-brand">{note}</p>}
                  <dt className="text-md font-semibold text-secondary_on-brand">{text(metric.label)}</dt>
                  <dd className="font-mono text-display-md font-semibold tracking-tight text-primary_on-brand md:text-display-lg">
                    <StatValue value={metric.value} suffix={text(metric.suffix)} />
                  </dd>
                </Reveal>
              );
            })}
          </dl>
        )}

        {hasComparison && (
          <Reveal delay={0.12} className="mx-auto mt-12 w-full max-w-2xl md:mt-16">
            <div className="overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-white/15 ring-inset backdrop-blur-sm">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/15 px-5 py-4 md:gap-x-8 md:px-8">
                <span className="text-sm font-semibold text-secondary_on-brand" />
                <span className="text-right font-mono text-xs font-semibold tracking-wide text-quaternary_on-brand uppercase md:text-sm">
                  {text(comparison?.before_label ?? comparison?.beforeLabel, "Before")}
                </span>
                <span className="text-right font-mono text-xs font-semibold tracking-wide text-primary_on-brand uppercase md:text-sm">
                  {text(comparison?.after_label ?? comparison?.afterLabel, "With ICE")}
                </span>
              </div>
              <ul>
                {comparisonRows.map((row, index) => (
                  <li
                    key={`${row.label ?? index}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 not-first:border-t not-first:border-white/10 px-5 py-4 md:gap-x-8 md:px-8"
                  >
                    <span className="text-md font-medium text-primary_on-brand">{text(row.label)}</span>
                    <span className="flex items-center justify-end gap-2 text-right text-md text-quaternary_on-brand">
                      <XClose aria-hidden="true" className="size-4 shrink-0 text-quaternary_on-brand" />
                      <span>{text(row.before)}</span>
                    </span>
                    <span className="flex items-center justify-end gap-2 text-right text-md font-semibold text-primary_on-brand">
                      <Check aria-hidden="true" className="size-4 shrink-0 text-primary_on-brand" />
                      <span>{text(row.after)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {hasCta && (
          <Reveal delay={0.16} className="mt-10 flex justify-center md:mt-12">
            <Button color="secondary" size="xl" href={ctaHref} iconTrailing={ArrowRight}>
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
    <section className="bg-primary py-16 md:py-24">
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
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary font-mono text-md font-semibold text-brand-secondary">
                  <AmbientHalo className="bg-brand-solid/20 blur-sm" delay={index * 0.8} />
                  <span className="relative">{index + 1}</span>
                </div>
                {index < items.length - 1 && <div className="my-1 w-px flex-1 border-l border-secondary" />}
              </div>
              <div className={cx("min-w-0 flex-1", index < items.length - 1 && "pb-8 md:pb-10")}>
                <p className="pt-0.5 font-mono text-sm font-semibold text-brand-secondary">
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
    <section className="bg-primary py-16 md:py-24">
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
    <section className="bg-primary py-16 md:py-24">
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
    <section className="bg-primary py-16 md:py-24">
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
    <section className="bg-primary py-16 md:py-24">
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
        <span className="mb-3 font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
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
    <section className="bg-primary py-16 md:py-24">
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
    <section className="bg-primary py-16 md:py-24">
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
    <section className="bg-primary py-16 md:py-24">
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
