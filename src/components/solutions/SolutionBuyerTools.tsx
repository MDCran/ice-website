"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BookOpen01,
  CheckCircle,
  Clock,
  Dataflow03,
  File02,
  Lock01,
  Zap,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import StickySolutionCta from "@/components/marketing/StickySolutionCta";
import { experienceFor } from "@/lib/solutionExperience";
import { resolveIcon } from "@/lib/iconMap";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

const ARCHITECTURE_NODE_ICONS = [
  Dataflow03,
  Lock01,
  Activity,
  Zap,
  CheckCircle,
];

type SelectOption = { value: string; label: string };
type ResourceItem = { title: string; kind: string; href: string };

export interface BuyerToolsContent {
  enabled?: boolean;
  module_order?: string[];
  proof_strip?: {
    enabled?: boolean;
    outcome_label?: string;
    outcome?: string;
    fit_label?: string;
    fit_items?: string[];
    platforms_label?: string;
    platforms?: string[];
  };
  architecture?: {
    enabled?: boolean;
    eyebrow?: string;
    heading?: string;
    description?: string;
    panel_title?: string;
    panel_description?: string;
    status_label?: string;
    layers_label?: string;
    layers?: Array<string | { label?: string; icon?: string }>;
    active_state_label?: string;
    idle_state_label?: string;
    path_label?: string;
    active_layer_label?: string;
    path_separator?: string;
    summary?: string;
    badges?: Array<{ label?: string; icon?: string }>;
  };
  recovery_planner?: RecoveryPlannerContent;
  resources?: {
    enabled?: boolean;
    eyebrow?: string;
    heading?: string;
    browse_label?: string;
    browse_href?: string;
    items?: ResourceItem[];
  };
  sticky_cta?: {
    enabled?: boolean;
    title?: string;
    phone_href?: string;
    phone_label?: string;
    consult_href?: string;
    consult_label?: string;
  };
}

export interface SolutionBuyerProfile {
  outcome?: string;
  industries?: string[];
  platforms?: string[];
}

interface RecommendationContent {
  title?: string;
  copy?: string;
  href?: string;
}

interface RecoveryPlannerContent {
  enabled?: boolean;
  eyebrow?: string;
  heading?: string;
  description?: string;
  rpo_label?: string;
  rpo_options?: SelectOption[];
  rto_label?: string;
  rto_options?: SelectOption[];
  data_size_label?: string;
  data_size_options?: SelectOption[];
  criticality_label?: string;
  criticality_options?: SelectOption[];
  default_rpo?: string;
  default_rto?: string;
  default_data_size?: string;
  default_criticality?: string;
  recommendation_label?: string;
  validation_note?: string;
  button_label?: string;
  recommendations?: {
    high_availability?: RecommendationContent;
    disaster_recovery?: RecommendationContent;
    backup?: RecommendationContent;
  };
}

function valueOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function SolutionProofStrip({
  slug,
  config = {},
  profile,
}: {
  slug: string;
  config?: NonNullable<BuyerToolsContent["proof_strip"]>;
  profile?: SolutionBuyerProfile;
}) {
  const data = experienceFor(slug);
  const fitItems = Array.isArray(config.fit_items)
    ? config.fit_items
    : Array.isArray(profile?.industries)
      ? profile.industries
      : data.industries;
  const platforms = Array.isArray(config.platforms)
    ? config.platforms
    : Array.isArray(profile?.platforms)
      ? profile.platforms
      : data.platforms;
  const outcome = Object.prototype.hasOwnProperty.call(config, "outcome")
    ? String(config.outcome ?? "")
    : typeof profile?.outcome === "string"
      ? profile.outcome
      : data.outcome;
  return (
    <div className="border-y border-brand/20 bg-brand-primary_alt/55">
      <div className="mx-auto grid max-w-container divide-y divide-brand/15 px-4 md:grid-cols-[1.35fr_1fr_1fr] md:divide-x md:divide-y-0 md:px-8">
        <div className="flex items-start gap-3 py-4 md:pr-8">
          <CheckCircle
            className="mt-0.5 size-5 shrink-0 text-fg-brand-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-secondary uppercase">
              {valueOr(config.outcome_label, "Representative outcome")}
            </p>
            <p className="mt-1 text-sm font-medium leading-snug text-secondary">
              {outcome}
            </p>
          </div>
        </div>
        <div className="py-4 md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-secondary uppercase">
            {valueOr(config.fit_label, "Common fit")}
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-secondary">
            {fitItems.join(" · ")}
          </p>
        </div>
        <div className="py-4 md:pl-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-secondary uppercase">
            {valueOr(config.platforms_label, "Works across")}
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-secondary">
            {platforms.join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
export function SolutionArchitecture({
  slug,
  config = {},
}: {
  slug: string;
  config?: NonNullable<BuyerToolsContent["architecture"]>;
}) {
  const data = experienceFor(slug);
  const reduceMotion = useHydratedReducedMotion();
  const configuredLayers = Array.isArray(config.layers)
    ? config.layers
    : data.architecture;
  const architecture = (
    configuredLayers.length > 0
      ? configuredLayers
      : ["Source", "Secure edge", "Managed platform", "Protected outcome"]
  ).map((item, index) => ({
    label:
      typeof item === "string"
        ? item
        : valueOr(item.label, `Layer ${index + 1}`),
    icon: typeof item === "string" ? undefined : item.icon,
  }));
  const firstLayer = architecture[0]?.label ?? "Source";
  const finalLayer =
    architecture[architecture.length - 1]?.label ?? "Managed outcome";
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || architecture.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % architecture.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [architecture.length, reduceMotion]);

  const activeLayer = architecture[activeIndex]?.label ?? firstLayer;
  const activeProgress =
    architecture.length > 1
      ? (activeIndex / (architecture.length - 1)) * 100
      : 100;

  return (
    <section className="border-b border-secondary bg-primary py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
            {valueOr(config.eyebrow, "Service architecture")}
          </span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">
            {valueOr(config.heading, "How data moves through this service")}
          </h2>
          <p className="mt-4 text-lg text-tertiary">
            {valueOr(
              config.description,
              "A live view of the protected path from source to managed outcome.",
            )}
          </p>
        </div>

        <div className="ice-arch-live-surface relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#07152a] p-5 shadow-[0_24px_80px_rgb(2_12_27/0.26)] md:p-8">
          <div
            aria-hidden="true"
            className="ice-solution-architecture-grid pointer-events-none absolute inset-0 opacity-35"
          />
          {!reduceMotion && (
            <div
              aria-hidden="true"
              className="ice-arch-ambient-flow pointer-events-none absolute inset-0"
            />
          )}
          {!reduceMotion && (
            <div
              aria-hidden="true"
              className="ice-arch-scanner pointer-events-none absolute inset-y-0 left-0 w-1/3"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 left-1/2 h-64 w-3/4 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
          />

          <div className="relative flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-300/25">
                <Dataflow03
                  className="size-5 text-brand-300"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {valueOr(config.panel_title, "ICE managed data path")}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  {valueOr(
                    config.panel_description,
                    "Continuous visibility across every service layer",
                  )}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-3 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex size-2">
                  {!reduceMotion && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                  )}
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                </span>
                {valueOr(config.status_label, "Flow active")}
              </span>
              <span className="h-3 w-px bg-emerald-300/25" aria-hidden="true" />
              <span className="tabular-nums">
                {String(architecture.length).padStart(2, "0")}{" "}
                {valueOr(config.layers_label, "live layers")}
              </span>
            </span>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
            <span
              className={cx(
                "block h-1.5 w-full rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_20px_rgb(4_155_251/0.55)]",
                !reduceMotion && "ice-arch-progress-stream ice-arch-flow-fill",
              )}
              aria-hidden="true"
            />
            {!reduceMotion && (
              <>
                <span
                  aria-hidden="true"
                  className="ice-arch-pipeline-sheen absolute inset-y-0 left-0 w-1/3"
                />
                <span
                  aria-hidden="true"
                  className="ice-arch-pipeline-sheen ice-arch-pipeline-sheen-delayed absolute inset-y-0 left-0 w-1/4"
                />
                <span
                  aria-hidden="true"
                  className="ice-arch-data-packet absolute top-1/2 left-0"
                />
                <span
                  aria-hidden="true"
                  className="ice-arch-data-packet ice-arch-data-packet-delayed absolute top-1/2 left-0"
                />
              </>
            )}
          </div>

          <div className="relative mt-8 hidden md:block">
            <div
              aria-hidden="true"
              className={cx(
                "absolute top-8 right-[9%] left-[9%] z-0 h-[3px] overflow-hidden rounded-full bg-white/15",
                !reduceMotion && "ice-arch-rail-base",
              )}
            >
              <span
                className={cx(
                  "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_18px_rgb(4_155_251/0.7)] transition-[width] duration-1000 ease-out",
                  !reduceMotion &&
                    "ice-arch-progress-stream ice-arch-flow-fill",
                )}
                style={{
                  width: `${reduceMotion ? 100 : Math.max(8, activeProgress)}%`,
                }}
                aria-hidden="true"
              />
              {!reduceMotion && (
                <>
                  <span className="ice-arch-rail-flow absolute inset-y-[-2px] left-0 w-28 rounded-full" />
                  <span className="ice-arch-rail-flow ice-arch-rail-flow-delayed absolute inset-y-[-2px] left-0 w-20 rounded-full" />
                  <span className="ice-arch-rail-flow ice-arch-rail-flow-fast absolute inset-y-[-2px] left-0 w-14 rounded-full" />
                  <span
                    aria-hidden="true"
                    className="ice-arch-data-packet absolute top-1/2 left-0"
                  />
                  <span
                    aria-hidden="true"
                    className="ice-arch-data-packet ice-arch-data-packet-delayed absolute top-1/2 left-0"
                  />
                  <span
                    aria-hidden="true"
                    className="ice-arch-data-packet ice-arch-data-packet-fast absolute top-1/2 left-0"
                  />
                </>
              )}
            </div>
            <ol className="relative z-10 flex gap-3">
              {architecture.map((step, index) => {
                const Icon = step.icon
                  ? resolveIcon(step.icon)
                  : ARCHITECTURE_NODE_ICONS[
                      index % ARCHITECTURE_NODE_ICONS.length
                    ];
                return (
                  <li
                    key={`${step.label}-${index}`}
                    aria-current={index === activeIndex ? "step" : undefined}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <span
                      style={{ animationDelay: `${index * -0.28}s` }}
                      className={cx(
                        "relative z-[2] flex size-16 items-center justify-center rounded-2xl border border-brand-300/40 bg-[#0b2e4b] text-sm font-bold text-white shadow-[0_0_18px_rgb(4_155_251/0.22)] transition-[border-color,box-shadow,transform] duration-700",
                        !reduceMotion && "ice-arch-node-live",
                        index === activeIndex &&
                          "border-brand-200/90 shadow-[0_0_26px_rgb(4_155_251/0.5)]",
                      )}
                    >
                      {!reduceMotion && (
                        <span
                          style={{ animationDelay: `${index * 0.32}s` }}
                          className="ice-arch-node-pulse absolute inset-0 rounded-2xl bg-brand-300/20"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className="relative size-6" aria-hidden="true" />
                    </span>
                    <span
                      className={cx(
                        "mt-4 max-w-36 text-sm font-semibold leading-snug transition-colors duration-500",
                        index === activeIndex ? "text-white" : "text-white/65",
                      )}
                    >
                      {step.label}
                    </span>
                    <span
                      className={cx(
                        "mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-500",
                        index === activeIndex
                          ? "text-brand-200"
                          : "text-brand-300/55",
                      )}
                    >
                      {index === activeIndex
                        ? valueOr(config.active_state_label, "Active")
                        : valueOr(config.idle_state_label, "Live")}
                    </span>
                    <span className="mt-2 h-1 w-10 overflow-hidden rounded-full bg-white/10 opacity-100">
                      <span
                        style={{ animationDelay: `${index * 0.22}s` }}
                        className={cx(
                          "block h-full rounded-full bg-brand-300",
                          !reduceMotion && "ice-arch-node-meter",
                        )}
                      />
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <ol className="relative mt-6 grid gap-3 md:hidden">
            <div
              aria-hidden="true"
              className={cx(
                "absolute top-5 bottom-5 left-5 w-px bg-white/15",
                !reduceMotion && "ice-arch-vertical-flow",
              )}
            />
            {architecture.map((step, index) => {
              const Icon = step.icon
                ? resolveIcon(step.icon)
                : ARCHITECTURE_NODE_ICONS[
                    index % ARCHITECTURE_NODE_ICONS.length
                  ];
              return (
                <li
                  key={`${step.label}-${index}`}
                  aria-current={index === activeIndex ? "step" : undefined}
                  className={cx(
                    "relative flex items-center gap-4 rounded-xl border border-brand-300/25 bg-[#0b2e4b] p-3 transition-colors duration-500",
                    index === activeIndex && "border-brand-200/70 bg-[#103b5d]",
                  )}
                >
                  <span
                    style={{ animationDelay: `${index * -0.22}s` }}
                    className={cx(
                      "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0b2e4b] text-white shadow-[0_0_16px_rgb(4_155_251/0.22)]",
                      !reduceMotion && "ice-arch-node-live",
                    )}
                  >
                    {!reduceMotion && (
                      <span
                        style={{ animationDelay: `${index * 0.3}s` }}
                        className="ice-arch-node-pulse absolute inset-0 rounded-xl bg-brand-300/20"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className="relative size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-white/85">
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div
            className={cx(
              "relative mt-8 grid gap-4 rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4 ring-1 ring-white/[0.04] md:grid-cols-[0.8fr_1.2fr] md:p-5",
              !reduceMotion && "ice-arch-layer-card",
            )}
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-200 uppercase">
                {valueOr(config.path_label, "Live service path")}
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-brand-200/80 uppercase">
                {valueOr(config.active_layer_label, "Active layer")} ·{" "}
                {activeLayer}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {firstLayer} {valueOr(config.path_separator, "to")} {finalLayer}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              {valueOr(
                config.summary,
                "Traffic is continuously flowing across every layer for validation, protection, monitoring, and managed response. The rail stays active instead of stepping through one layer at a time.",
              )}
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            {(Array.isArray(config.badges)
              ? config.badges
              : [
                  { icon: "Lock", label: "Encrypted in transit" },
                  { icon: "Activity", label: "Continuously monitored" },
                  { icon: "Zap", label: "Response-ready" },
                ]
            ).map((item, index) => {
              const Icon = resolveIcon(
                valueOr(item.icon, ["Lock", "Activity", "Zap"][index % 3]),
              );
              const label = valueOr(item.label, `Service signal ${index + 1}`);
              return (
                <div
                  key={`${label}-${index}`}
                  className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.06]"
                >
                  <Icon className="size-4 text-brand-300" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/65">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function recommendation(
  rpo: string,
  rto: string,
  dataSize: string,
  criticality: string,
  config: RecoveryPlannerContent,
) {
  if (criticality === "critical" || rto === "under-1" || rpo === "near-zero") {
    const custom = config.recommendations?.high_availability;
    return {
      title: valueOr(custom?.title, "High Availability + DRaaS"),
      copy: valueOr(
        custom?.copy,
        "Continuous replication, warm standby capacity, and orchestrated failover fit the low-loss, low-downtime target.",
      ),
      href: valueOr(
        custom?.href,
        "/contact?service=High%20Availability%20and%20DRaaS&source=rpo_rto_calculator",
      ),
    };
  }
  if (rto === "under-4" || rpo === "under-1") {
    const custom = config.recommendations?.disaster_recovery;
    return {
      title: valueOr(custom?.title, "ICE Disaster Recovery as a Service"),
      copy: valueOr(
        custom?.copy,
        `Replicated recovery capacity and tested runbooks are the strongest fit for this ${dataSize || "workload"} profile.`,
      ),
      href: valueOr(
        custom?.href,
        "/contact?service=Disaster%20Recovery%20as%20a%20Service&source=rpo_rto_calculator",
      ),
    };
  }
  const custom = config.recommendations?.backup;
  return {
    title: valueOr(custom?.title, "ICE Backup as a Service"),
    copy: valueOr(
      custom?.copy,
      "Managed encrypted backups, retention, and restore validation fit a workload with more recovery-time flexibility.",
    ),
    href: valueOr(
      custom?.href,
      "/contact?service=Backup%20as%20a%20Service&source=rpo_rto_calculator",
    ),
  };
}

export function RpoRtoCalculator({
  config = {},
}: {
  config?: RecoveryPlannerContent;
}) {
  const rpoOptions = config.rpo_options?.length
    ? config.rpo_options
    : [
        { value: "near-zero", label: "Near zero" },
        { value: "under-1", label: "Under 1 hour" },
        { value: "under-4", label: "Under 4 hours" },
        { value: "daily", label: "Up to 24 hours" },
      ];
  const rtoOptions = config.rto_options?.length
    ? config.rto_options
    : [
        { value: "under-1", label: "Under 1 hour" },
        { value: "under-4", label: "Under 4 hours" },
        { value: "same-day", label: "Same business day" },
        { value: "next-day", label: "Next business day" },
      ];
  const dataSizeOptions = config.data_size_options?.length
    ? config.data_size_options
    : [
        { value: "under-1tb", label: "Under 1 TB" },
        { value: "1-10tb", label: "1–10 TB" },
        { value: "10-50tb", label: "10–50 TB" },
        { value: "50tb-plus", label: "50+ TB" },
      ];
  const criticalityOptions = config.criticality_options?.length
    ? config.criticality_options
    : [
        { value: "critical", label: "Revenue / operations stop" },
        { value: "important", label: "Teams are materially blocked" },
        { value: "standard", label: "Temporary interruption is manageable" },
      ];
  const [rpo, setRpo] = useState(() => valueOr(config.default_rpo, "under-4"));
  const [rto, setRto] = useState(() => valueOr(config.default_rto, "under-4"));
  const [dataSize, setDataSize] = useState(() =>
    valueOr(config.default_data_size, "1-10tb"),
  );
  const [criticality, setCriticality] = useState(() =>
    valueOr(config.default_criticality, "important"),
  );
  const result = useMemo(
    () => recommendation(rpo, rto, dataSize, criticality, config),
    [rpo, rto, dataSize, criticality, config],
  );

  const fieldClass =
    "mt-2 w-full rounded-xl border border-secondary bg-primary px-3 py-2.5 text-sm text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
            {valueOr(config.eyebrow, "Recovery planner")}
          </span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">
            {valueOr(config.heading, "Estimate the right recovery model")}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-tertiary">
            {valueOr(
              config.description,
              "Choose business targets—not products. We’ll map them to a practical ICE starting point.",
            )}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-secondary">
              {valueOr(config.rpo_label, "Maximum acceptable data loss (RPO)")}
              <select
                value={rpo}
                onChange={(e) => setRpo(e.target.value)}
                className={fieldClass}
              >
                {rpoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              {valueOr(config.rto_label, "Maximum acceptable downtime (RTO)")}
              <select
                value={rto}
                onChange={(e) => setRto(e.target.value)}
                className={fieldClass}
              >
                {rtoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              {valueOr(config.data_size_label, "Protected data")}
              <select
                value={dataSize}
                onChange={(e) => setDataSize(e.target.value)}
                className={fieldClass}
              >
                {dataSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              {valueOr(config.criticality_label, "Workload criticality")}
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                className={fieldClass}
              >
                {criticalityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <aside className="relative overflow-hidden rounded-2xl bg-secondary p-6 ring-1 ring-secondary md:p-8">
          <Dataflow03
            className="size-8 text-fg-brand-primary"
            aria-hidden="true"
          />
          <p className="mt-6 text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">
            {valueOr(config.recommendation_label, "Recommended starting point")}
          </p>
          <h3 className="mt-2 text-display-xs font-semibold text-primary">
            {result.title}
          </h3>
          <p className="mt-3 text-md text-tertiary">{result.copy}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-secondary">
            <Clock className="size-4 text-fg-brand-primary" />
            {valueOr(
              config.validation_note,
              "Final targets are validated during discovery and testing.",
            )}
          </div>
          <Button
            href={result.href}
            size="lg"
            className="mt-8"
            iconTrailing={ArrowRight}
          >
            {valueOr(config.button_label, "Validate this recommendation")}
          </Button>
        </aside>
      </div>
    </section>
  );
}

export function SolutionResourceTeaser({
  slug,
  config = {},
}: {
  slug: string;
  config?: NonNullable<BuyerToolsContent["resources"]>;
}) {
  const resources = Array.isArray(config.items)
    ? config.items
    : experienceFor(slug).resources;
  return (
    <section className="border-t border-secondary bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {valueOr(config.eyebrow, "Go deeper")}
            </span>
            <h2 className="mt-3 text-display-xs font-semibold text-primary">
              {valueOr(config.heading, "Related runbooks and buyer guides")}
            </h2>
          </div>
          <Link
            href={valueOr(config.browse_href, "/resources")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary"
          >
            {valueOr(config.browse_label, "Browse resources")}{" "}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {resources.map((resource, index) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="ice-lift group flex items-start gap-4 rounded-2xl bg-secondary p-5 ring-1 ring-secondary hover:ring-brand"
            >
              {index === 0 ? (
                <BookOpen01 className="size-6 shrink-0 text-fg-brand-primary" />
              ) : (
                <File02 className="size-6 shrink-0 text-fg-brand-primary" />
              )}
              <span>
                <span className="text-xs font-medium tracking-wide text-brand-secondary uppercase">
                  {resource.kind}
                </span>
                <span className="mt-1 block text-md font-semibold text-primary group-hover:text-brand-secondary">
                  {resource.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionBuyerToolsSection({
  slug,
  pageTitle,
  content,
  defaultConsultHref,
  defaultConsultLabel,
  profile,
}: {
  slug: string;
  pageTitle: string;
  content: BuyerToolsContent;
  defaultConsultHref: string;
  defaultConsultLabel?: string;
  profile?: SolutionBuyerProfile;
}) {
  if (content.enabled === false) return null;

  const proof = content.proof_strip ?? {};
  const architecture = content.architecture ?? {};
  const recovery = content.recovery_planner ?? {};
  const resources = content.resources ?? {};
  const sticky = content.sticky_cta ?? {};
  const recoveryDefault = ["disaster-recovery", "backup-as-a-service"].includes(
    slug,
  );

  const modules: Record<string, ReactNode> = {
    proof_strip:
      proof.enabled === false ? null : (
        <SolutionProofStrip slug={slug} config={proof} profile={profile} />
      ),
    architecture:
      architecture.enabled === false ? null : (
        <SolutionArchitecture slug={slug} config={architecture} />
      ),
    recovery_planner:
      recovery.enabled === true ||
      (recovery.enabled !== false && recoveryDefault) ? (
        <RpoRtoCalculator config={recovery} />
      ) : null,
    resources:
      resources.enabled === false ? null : (
        <SolutionResourceTeaser slug={slug} config={resources} />
      ),
  };
  const defaultOrder = [
    "proof_strip",
    "architecture",
    "recovery_planner",
    "resources",
  ];
  const requestedOrder = Array.isArray(content.module_order)
    ? content.module_order.filter((key) => key in modules)
    : defaultOrder;
  const moduleOrder = [...new Set(requestedOrder)];

  return (
    <>
      {moduleOrder.map((key) =>
        modules[key] ? <div key={key}>{modules[key]}</div> : null,
      )}
      {sticky.enabled !== false && (
        <StickySolutionCta
          title={valueOr(sticky.title, `Talk about ${pageTitle}`)}
          phoneHref={valueOr(sticky.phone_href, "tel:18007869188")}
          phoneLabel={valueOr(sticky.phone_label, "1-800-786-9188")}
          consultHref={valueOr(sticky.consult_href, defaultConsultHref)}
          consultLabel={valueOr(
            sticky.consult_label,
            defaultConsultLabel ?? "Book a consultation",
          )}
        />
      )}
    </>
  );
}
