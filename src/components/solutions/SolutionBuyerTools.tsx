"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BookOpen01,
  ChevronDown,
  CheckCircle,
  Cloud01,
  Clock,
  Database01,
  Dataflow03,
  File02,
  Monitor04,
  RefreshCw01,
  Server03,
  Shield01,
  Zap,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import StickySolutionCta from "@/components/marketing/StickySolutionCta";
import { experienceFor } from "@/lib/solutionExperience";
import { resolveIcon } from "@/lib/iconMap";
import { cx } from "@/utils/cx";

const GENERIC_ARCHITECTURE_LAYERS = [
  "workloads",
  "connectivity",
  "protection",
  "operations",
  "reporting",
];

function ArchitectureNodeIcon({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const value = label.toLowerCase();
  if (/monitor|report|operation|response|validation|management|escalation|health|triage/.test(value)) return <Activity className={className} aria-hidden="true" />;
  if (/migrat|cutover|failover|restore|recovery|remediat|orchestrat/.test(value)) return <RefreshCw01 className={className} aria-hidden="true" />;
  if (/backup|replicat|storage|database|data|vault|immutable/.test(value)) return <Database01 className={className} aria-hidden="true" />;
  if (/automation|workflow|scheduled task/.test(value)) return <Zap className={className} aria-hidden="true" />;
  if (/threat|detect|security|firewall|identity|policy|secure|connect|network|link/.test(value)) return <Shield01 className={className} aria-hidden="true" />;
  if (/endpoint|device|user|workstation|client/.test(value)) return <Monitor04 className={className} aria-hidden="true" />;
  if (/ibm.?power|power.?vs|server|platform|workload|production|system|source|infrastructure|environment/.test(value)) return <Server03 className={className} aria-hidden="true" />;
  if (/cloud|cluster|hosting|compute|site/.test(value)) return <Cloud01 className={className} aria-hidden="true" />;
  return <Dataflow03 className={className} aria-hidden="true" />;
}

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
  pageTitle,
  config = {},
}: {
  slug: string;
  pageTitle: string;
  config?: NonNullable<BuyerToolsContent["architecture"]>;
}) {
  const data = experienceFor(slug);
  const reduceMotion = true;
  const isGenericLayerSet =
    Array.isArray(config.layers) &&
    config.layers.length === GENERIC_ARCHITECTURE_LAYERS.length &&
    config.layers.every((item, index) => {
      const label = typeof item === "string" ? item : valueOr(item.label, "");
      const hasCustomIcon =
        typeof item === "object" &&
        typeof item.icon === "string" &&
        item.icon.trim().length > 0;
      return !hasCustomIcon && label.trim().toLowerCase() === GENERIC_ARCHITECTURE_LAYERS[index];
    });
  const configuredLayers =
    Array.isArray(config.layers) && config.layers.length > 0 && !isGenericLayerSet
      ? config.layers
      : data.architecture;
  const architecture = (
    configuredLayers.length > 0 ? configuredLayers : data.architecture
  ).map((item, index) => ({
    label:
      typeof item === "string"
        ? item
        : valueOr(item.label, `Layer ${index + 1}`),
    icon: typeof item === "string" ? undefined : item.icon,
  }));
  const panelDescription = valueOr(
    config.panel_description &&
      !/^(select a layer to inspect the operating flow\.|a straightforward view from your systems through protection and ongoing support\.)$/i.test(config.panel_description.trim())
      ? config.panel_description
      : undefined,
    "Typical service components are shown below; final scope is confirmed for your environment.",
  );
  const firstLayer = architecture[0]?.label ?? "Source";
  const finalLayer = architecture[architecture.length - 1]?.label ?? "Managed outcome";
  const activeLayer = firstLayer;
  const activeProgress = 100;
  const architectureSummary =
    config.summary &&
    !/^(ice coordinates the platform, protection, monitoring, and reporting layers under one operating model\.|confirm platform, connectivity, protection, operations, and reporting responsibilities during assessment\.)$/i.test(config.summary.trim())
      ? config.summary
      : `Typical service components: ${architecture.map((step) => step.label).join(" → ")}. Final platforms, coverage, and responsibilities are agreed after assessment.`;
  const architectureHeading =
    /^(see how the service fits together|how ice supports your environment)$/i.test(config.heading ?? "")
      ? `${pageTitle} architecture`
      : valueOr(config.heading, `How ${pageTitle} works`);
  const architectureDescription =
    /^(explore the operating layers ice manages for this solution\.|see the systems, protection, and ongoing support included with this service\.)$/i.test(config.description ?? "")
      ? `A practical view of the systems and service components associated with ${pageTitle}.`
      : valueOr(config.description, "Review the service components and operating responsibilities involved.");

  return (
    <section className="border-b border-secondary bg-primary py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
            {valueOr(config.eyebrow, "Service overview")}
          </span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">
            {architectureHeading}
          </h2>
          <p className="mt-4 text-lg text-tertiary">
            {architectureDescription}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-2xl border border-secondary bg-primary_alt p-5 shadow-sm md:p-8">
          <div
            aria-hidden="true"
            className="hidden"
          />
          {!reduceMotion && (
            <div
              aria-hidden="true"
              className="hidden"
            />
          )}
          {!reduceMotion && (
            <div
              aria-hidden="true"
              className="hidden"
            />
          )}
          <div
            aria-hidden="true"
            className="hidden"
          />

          <div className="relative flex flex-col gap-3 border-b border-secondary pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary_alt ring-1 ring-brand/25">
                <ArchitectureNodeIcon label={firstLayer} className="size-5 text-fg-brand-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">
                  {/^(managed service path|how the service is managed)$/i.test(config.panel_title ?? "")
                    ? `${pageTitle} service path`
                    : valueOr(config.panel_title, `${pageTitle} service path`)}
                </p>
                <p className="mt-0.5 text-xs text-tertiary">
                  {panelDescription}
                </p>
              </div>
            </div>
            <span className="hidden">
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

          <div className="hidden">
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
              className="absolute top-7 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
              style={{ left: `${50 / architecture.length}%`, right: `${50 / architecture.length}%` }}
            />
            <div
              aria-hidden="true"
              className="hidden"
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
                const Icon = step.icon ? resolveIcon(step.icon) : undefined;
                return (
                  <li
                    key={`${step.label}-${index}`}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <span className="group relative z-[2] flex size-14 items-center justify-center rounded-2xl border border-brand/25 bg-primary text-fg-brand-primary shadow-[0_4px_16px_rgb(15_23_42/0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-brand/50">
                      {Icon ? <Icon className="size-6" aria-hidden="true" /> : <ArchitectureNodeIcon label={step.label} className="size-6" />}
                    </span>
                    <span className="mt-4 max-w-36 text-sm font-semibold leading-snug text-primary">
                      {step.label}
                    </span>
                    <span className="hidden">
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
              className="hidden"
            />
            {architecture.map((step, index) => {
              const Icon = step.icon ? resolveIcon(step.icon) : undefined;
              return (
                <li
                  key={`${step.label}-${index}`}
                  className="relative flex items-center gap-4 rounded-xl border border-secondary bg-primary p-3"
                >
                  <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary_alt text-fg-brand-primary">
                    {Icon ? <Icon className="size-4" aria-hidden="true" /> : <ArchitectureNodeIcon label={step.label} className="size-4" />}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="relative mt-6 border-t border-secondary pt-5 text-sm leading-relaxed text-tertiary">
            {architectureSummary}
          </p>

          <div
            className="hidden"
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

          <div className="hidden">
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

function RecoverySelect({
  question,
  context,
  value,
  onChange,
  options,
}: {
  question: string;
  context: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="rounded-2xl border border-secondary bg-secondary/30 p-4 transition-colors duration-200 hover:border-brand/35 sm:p-5">
      <label htmlFor={id} className="block text-sm font-semibold leading-snug text-primary">
        {question}
      </label>
      <p id={descriptionId} className="mt-1.5 min-h-10 text-xs leading-relaxed text-tertiary">
        {context}
      </p>
      <div className="relative mt-3">
        <select
          id={id}
          aria-describedby={descriptionId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-secondary bg-primary py-3 pr-10 pl-3.5 text-sm font-medium text-primary shadow-xs outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-quaternary"
        />
      </div>
      <p className="mt-2 text-[11px] font-medium tracking-wide text-fg-quaternary uppercase">
        Choose one option
      </p>
    </div>
  );
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
            <RecoverySelect
              question="How much recent data could you afford to lose?"
              context={`${valueOr(config.rpo_label, "Recovery point objective (RPO)")} — the recovery point sets how far back restored data may go.`}
              value={rpo}
              onChange={setRpo}
              options={rpoOptions}
            />
            <RecoverySelect
              question="How long can this service be unavailable?"
              context={`${valueOr(config.rto_label, "Recovery time objective (RTO)")} — your target time to restore service.`}
              value={rto}
              onChange={setRto}
              options={rtoOptions}
            />
            <RecoverySelect
              question="Approximately how much data needs protection?"
              context="A rough estimate is enough to compare recovery approaches."
              value={dataSize}
              onChange={setDataSize}
              options={dataSizeOptions}
            />
            <RecoverySelect
              question="What would happen if this workload stopped?"
              context="Choose the business impact, not a technical severity."
              value={criticality}
              onChange={setCriticality}
              options={criticalityOptions}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-tertiary">
            Choose the closest fit. These are planning estimates, not service commitments.
          </p>
        </div>
        <aside className="relative overflow-hidden rounded-2xl bg-secondary p-6 ring-1 ring-secondary md:p-8">
          <Dataflow03
            className="size-8 text-fg-brand-primary"
            aria-hidden="true"
          />
          <p className="mt-6 text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">
            {valueOr(config.recommendation_label, "Recommended starting point")}
          </p>
          <p className="mt-1 text-xs text-tertiary">Updates as you change your answers</p>
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
  const serviceResources = experienceFor(slug).resources;
  const hasContactPlaceholder =
    config.items?.length === 1 &&
    config.items[0].title.trim().toLowerCase() === "talk with an ice specialist" &&
    config.items[0].kind.trim().toLowerCase() === "assessment" &&
    config.items[0].href.trim() === "/contact";
  const resources =
    Array.isArray(config.items) && config.items.length > 0 && !hasContactPlaceholder
      ? config.items
      : serviceResources;
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
        <div
          className={cx(
            "mt-8 grid gap-4",
            resources.length > 1 ? "sm:grid-cols-2" : "max-w-4xl grid-cols-1",
          )}
        >
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
        <SolutionArchitecture slug={slug} pageTitle={pageTitle} config={architecture} />
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
