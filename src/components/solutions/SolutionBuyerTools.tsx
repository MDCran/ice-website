"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen01,
  CheckCircle,
  Clock,
  Dataflow03,
  File02,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { experienceFor } from "@/lib/solutionExperience";

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
  return (
    <section className="border-y border-secondary bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Service architecture</span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary">How data moves through this service</h2>
          <p className="mt-4 text-lg text-tertiary">A simplified operating path from source to protected outcome.</p>
        </div>
        <ol className="relative mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-5">
          <div aria-hidden="true" className="absolute top-7 right-[8%] left-[8%] hidden h-0.5 overflow-hidden bg-border-brand md:block">
            <span className="ice-arch-rail-flow absolute inset-y-0 left-0 w-24 rounded-full" />
          </div>
          {data.architecture.map((step, index) => (
            <li key={step} className="relative z-10 flex items-center gap-3 rounded-xl bg-primary p-4 ring-1 ring-secondary md:flex-col md:text-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-bold text-white shadow-[0_0_18px_rgb(4_155_251/0.35)]">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-primary">{step}</span>
            </li>
          ))}
        </ol>
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

export function FreshnessCue() {
  return (
    <p className="inline-flex items-center gap-2 text-xs text-quaternary">
      <span className="size-1.5 rounded-full bg-success-500" aria-hidden="true" />
      Service levels and platform details reviewed July 2026
    </p>
  );
}
