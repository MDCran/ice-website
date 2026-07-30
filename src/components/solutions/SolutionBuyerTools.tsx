"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
import { experienceFor } from "@/lib/solutionExperience";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

const ARCHITECTURE_ADVANCE_MS = 2800;
const ARCHITECTURE_NODE_ICONS = [Dataflow03, Lock01, Activity, Zap, CheckCircle];

export function SolutionProofStrip({ slug }: { slug: string }) {
  const data = experienceFor(slug);
  return (
    <div className="border-y border-brand/20 bg-brand-primary_alt/55">
      <div className="mx-auto flex max-w-container items-start gap-3 px-4 py-4 md:px-8">
        <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-secondary">
          <span className="mr-2 font-semibold text-brand-secondary">Representative outcome</span>
          {data.proof}
        </p>
      </div>
    </div>
  );
}
export function SolutionArchitecture({ slug }: { slug: string }) {
  const data = experienceFor(slug);
  const reduceMotion = useHydratedReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = data.architecture[activeIndex] ?? data.architecture[0] ?? "Service layer";
  const progressPercent =
    data.architecture.length <= 1 ? 100 : (activeIndex / (data.architecture.length - 1)) * 100;

  useEffect(() => {
    if (data.architecture.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % data.architecture.length);
    }, ARCHITECTURE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [data.architecture.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slug, data.architecture.length]);

  return (
    <section className="border-b border-secondary bg-primary py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Service architecture</span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">How data moves through this service</h2>
          <p className="mt-4 text-lg text-tertiary">A live view of the protected path from source to managed outcome.</p>
        </div>

        <div className="ice-arch-live-surface relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#07152a] p-5 shadow-[0_24px_80px_rgb(2_12_27/0.26)] md:p-8">
          <div aria-hidden="true" className="ice-solution-architecture-grid pointer-events-none absolute inset-0 opacity-35" />
          <div aria-hidden="true" className="ice-arch-ambient-flow pointer-events-none absolute inset-0" />
          <div aria-hidden="true" className="ice-arch-scanner pointer-events-none absolute inset-y-0 left-0 w-1/3" />
          <div aria-hidden="true" className="pointer-events-none absolute -top-28 left-1/2 h-64 w-3/4 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-300/25">
                <Dataflow03 className="size-5 text-brand-300" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">ICE managed data path</p>
                <p className="mt-0.5 text-xs text-white/50">Continuous visibility across every service layer</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-3 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex size-2">
                  {!reduceMotion && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-60" />}
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                </span>
                Flow active
              </span>
              <span className="h-3 w-px bg-emerald-300/25" aria-hidden="true" />
              <span className="tabular-nums">
                Layer {String(activeIndex + 1).padStart(2, "0")} / {String(data.architecture.length).padStart(2, "0")}
              </span>
            </span>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
            <motion.span
              className="ice-arch-progress-stream block h-1.5 rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_20px_rgb(4_155_251/0.55)]"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }
            />
            <span
              aria-hidden="true"
              className="ice-arch-pipeline-sheen absolute inset-y-0 left-0 w-1/3"
            />
            <span
              aria-hidden="true"
              className="ice-arch-pipeline-sheen ice-arch-pipeline-sheen-delayed absolute inset-y-0 left-0 w-1/4"
            />
          </div>

          <div className="relative mt-8 hidden md:block">
            <div aria-hidden="true" className="ice-arch-rail-base absolute top-8 right-[9%] left-[9%] h-[3px] overflow-visible rounded-full bg-white/15">
              <motion.span
                className="ice-arch-progress-stream absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_18px_rgb(4_155_251/0.7)]"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }
              />
              <span className="ice-arch-rail-flow absolute inset-y-[-2px] left-0 w-28 rounded-full" />
              <span className="ice-arch-rail-flow ice-arch-rail-flow-delayed absolute inset-y-[-2px] left-0 w-20 rounded-full" />
              <span className="ice-arch-rail-flow ice-arch-rail-flow-fast absolute inset-y-[-2px] left-0 w-14 rounded-full" />
            </div>
            <ol className="relative z-10 flex gap-3">
              {data.architecture.map((step, index) => {
                const active = index === activeIndex;
                const complete = index < activeIndex;
                const Icon = ARCHITECTURE_NODE_ICONS[index % ARCHITECTURE_NODE_ICONS.length];
                return (
                  <motion.li
                    key={step}
                    animate={reduceMotion ? undefined : { y: active ? -4 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <motion.span
                      animate={
                        reduceMotion
                          ? undefined
                          : active
                            ? { boxShadow: ["0 0 0 0 rgb(56 189 248 / 0.5)", "0 0 0 12px rgb(56 189 248 / 0)"] }
                            : undefined
                      }
                      transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
                      style={{ animationDelay: `${index * 0.18}s` }}
                      className={`ice-arch-node-live relative flex size-16 items-center justify-center rounded-2xl border text-sm font-bold transition-colors duration-500 ${
                        active
                          ? "border-brand-300/70 bg-brand-500 text-white shadow-[0_0_28px_rgb(4_155_251/0.4)]"
                          : complete
                            ? "border-brand-300/30 bg-brand-500/20 text-brand-200"
                            : "border-white/10 bg-[#0b203c] text-white/45"
                      }`}
                    >
                      {!reduceMotion && active && <span className="ice-arch-node-pulse absolute inset-0 rounded-2xl bg-brand-300/30" aria-hidden="true" />}
                      <Icon className="relative size-6" aria-hidden="true" />
                    </motion.span>
                    <span className={`mt-4 max-w-36 text-sm font-semibold leading-snug transition-colors duration-500 ${active ? "text-white" : complete ? "text-white/75" : "text-white/45"}`}>
                      {step}
                    </span>
                    <span className={`mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase ${active ? "text-brand-300" : "text-white/25"}`}>
                        {active ? "Processing" : complete ? "Verified" : "Standby"}
                      </span>
                    <span className={`mt-2 h-1 w-10 overflow-hidden rounded-full bg-white/10 ${active ? "opacity-100" : "opacity-35"}`}>
                      <span className="ice-arch-node-meter block h-full rounded-full bg-brand-300" />
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <ol className="relative mt-6 grid gap-3 md:hidden">
            <div aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-px bg-white/15" />
            {data.architecture.map((step, index) => {
              const active = index === activeIndex;
              const complete = index < activeIndex;
              const Icon = ARCHITECTURE_NODE_ICONS[index % ARCHITECTURE_NODE_ICONS.length];
              return (
                <li key={step} className={`relative flex items-center gap-4 rounded-xl border p-3 transition-colors duration-500 ${active ? "border-brand-300/50 bg-brand-500/15" : "border-white/10 bg-white/[0.03]"}`}>
                  <span style={{ animationDelay: `${index * 0.18}s` }} className={`ice-arch-node-live relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-brand-500 text-white shadow-[0_0_20px_rgb(4_155_251/0.35)]" : complete ? "bg-brand-500/20 text-brand-200" : "bg-[#0b203c] text-white/50"}`}>
                    {!reduceMotion && active && <span className="ice-arch-node-pulse absolute inset-0 rounded-xl bg-brand-300/30" aria-hidden="true" />}
                    <Icon className="relative size-4" aria-hidden="true" />
                  </span>
                  <span className={active ? "text-sm font-semibold text-white" : "text-sm font-semibold text-white/55"}>{step}</span>
                </li>
              );
            })}
          </ol>

          <motion.div
            key={activeStep}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-8 grid gap-4 rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4 ring-1 ring-white/[0.04] md:grid-cols-[0.8fr_1.2fr] md:p-5"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-200 uppercase">Current layer</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{activeStep}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              Traffic is moving through this control now, then advancing to the next layer for validation, protection, and managed response.
            </p>
          </motion.div>

          <div className="relative mt-8 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            {[
              { icon: Lock01, label: "Encrypted in transit" },
              { icon: Activity, label: "Continuously monitored" },
              { icon: Zap, label: "Response-ready" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.06]">
                <item.icon className="size-4 text-brand-300" aria-hidden="true" />
                <span className="text-xs font-medium text-white/65">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function recommendation(rpo: string, rto: string, dataSize: string, criticality: string) {
  if (criticality === "critical" || rto === "under-1" || rpo === "near-zero") {
    return {
      title: "High Availability + DRaaS",
      copy: "Continuous replication, warm standby capacity, and orchestrated failover fit the low-loss, low-downtime target.",
      href: "/contact?service=High%20Availability%20and%20DRaaS&source=rpo_rto_calculator",
    };
  }
  if (rto === "under-4" || rpo === "under-1") {
    return {
      title: "ICE Disaster Recovery as a Service",
      copy: `Replicated recovery capacity and tested runbooks are the strongest fit for this ${dataSize || "workload"} profile.`,
      href: "/contact?service=Disaster%20Recovery%20as%20a%20Service&source=rpo_rto_calculator",
    };
  }
  return {
    title: "ICE Backup as a Service",
    copy: "Managed encrypted backups, retention, and restore validation fit a workload with more recovery-time flexibility.",
    href: "/contact?service=Backup%20as%20a%20Service&source=rpo_rto_calculator",
  };
}

export function RpoRtoCalculator({ slug }: { slug: string }) {
  const [rpo, setRpo] = useState("under-4");
  const [rto, setRto] = useState("under-4");
  const [dataSize, setDataSize] = useState("1-10tb");
  const [criticality, setCriticality] = useState("important");
  const result = useMemo(
    () => recommendation(rpo, rto, dataSize, criticality),
    [rpo, rto, dataSize, criticality],
  );

  if (!["disaster-recovery", "backup-as-a-service"].includes(slug)) return null;

  const fieldClass =
    "mt-2 w-full rounded-xl border border-secondary bg-primary px-3 py-2.5 text-sm text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Recovery planner</span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">Estimate the right recovery model</h2>
          <p className="mt-4 max-w-2xl text-lg text-tertiary">
            Choose business targets—not products. We’ll map them to a practical ICE starting point.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-secondary">
              Maximum acceptable data loss (RPO)
              <select value={rpo} onChange={(e) => setRpo(e.target.value)} className={fieldClass}>
                <option value="near-zero">Near zero</option>
                <option value="under-1">Under 1 hour</option>
                <option value="under-4">Under 4 hours</option>
                <option value="daily">Up to 24 hours</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              Maximum acceptable downtime (RTO)
              <select value={rto} onChange={(e) => setRto(e.target.value)} className={fieldClass}>
                <option value="under-1">Under 1 hour</option>
                <option value="under-4">Under 4 hours</option>
                <option value="same-day">Same business day</option>
                <option value="next-day">Next business day</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              Protected data
              <select value={dataSize} onChange={(e) => setDataSize(e.target.value)} className={fieldClass}>
                <option value="under-1tb">Under 1 TB</option>
                <option value="1-10tb">1–10 TB</option>
                <option value="10-50tb">10–50 TB</option>
                <option value="50tb-plus">50+ TB</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-secondary">
              Workload criticality
              <select value={criticality} onChange={(e) => setCriticality(e.target.value)} className={fieldClass}>
                <option value="critical">Revenue / operations stop</option>
                <option value="important">Teams are materially blocked</option>
                <option value="standard">Temporary interruption is manageable</option>
              </select>
            </label>
          </div>
        </div>
        <aside className="relative overflow-hidden rounded-2xl bg-secondary p-6 ring-1 ring-secondary md:p-8">
          <Dataflow03 className="size-8 text-fg-brand-primary" aria-hidden="true" />
          <p className="mt-6 text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">Recommended starting point</p>
          <h3 className="mt-2 text-display-xs font-semibold text-primary">{result.title}</h3>
          <p className="mt-3 text-md text-tertiary">{result.copy}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-secondary">
            <Clock className="size-4 text-fg-brand-primary" />
            Final targets are validated during discovery and testing.
          </div>
          <Button href={result.href} size="lg" className="mt-8" iconTrailing={ArrowRight}>
            Validate this recommendation
          </Button>
        </aside>
      </div>
    </section>
  );
}

export function SolutionResourceTeaser({ slug }: { slug: string }) {
  const resources = experienceFor(slug).resources;
  return (
    <section className="border-t border-secondary bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Go deeper</span>
            <h2 className="mt-3 text-display-xs font-semibold text-primary">Related runbooks and buyer guides</h2>
          </div>
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
            Browse resources <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {resources.map((resource, index) => (
            <Link key={resource.title} href={resource.href} className="ice-lift group flex items-start gap-4 rounded-2xl bg-secondary p-5 ring-1 ring-secondary hover:ring-brand">
              {index === 0 ? <BookOpen01 className="size-6 shrink-0 text-fg-brand-primary" /> : <File02 className="size-6 shrink-0 text-fg-brand-primary" />}
              <span>
                <span className="text-xs font-medium tracking-wide text-brand-secondary uppercase">{resource.kind}</span>
                <span className="mt-1 block text-md font-semibold text-primary group-hover:text-brand-secondary">{resource.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

