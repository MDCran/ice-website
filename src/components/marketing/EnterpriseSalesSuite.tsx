"use client";

import { Children, Fragment, isValidElement, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart01,
  CheckCircle,
  FileCheck02,
  Flag03,
  ShieldTick,
  Users01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { EnterpriseBriefingForm } from "@/components/marketing/EnterpriseBriefingForm";
import { EnterpriseRoiCalculator } from "@/components/marketing/EnterpriseSalesWidgets";
import type { SalesEnablementConfig, SalesModuleId } from "@/lib/salesEnablement";
import { cx } from "@/utils/cx";

interface ModuleProps {
  module: SalesModuleId;
  children: ReactNode;
}

function Enabled({ children }: ModuleProps) {
  return <>{children}</>;
}

function OrderedSections({
  config,
  className,
  children,
}: {
  config: SalesEnablementConfig;
  className?: string;
  children: ReactNode;
}) {
  const sections = new Map<SalesModuleId, ReactNode>();

  Children.forEach(children, (child) => {
    if (isValidElement<ModuleProps>(child) && child.type === Enabled) {
      sections.set(child.props.module, child.props.children);
    }
  });

  return (
    <main className={cx("bg-primary", className)}>
      {config.sectionOrder.map((moduleId) =>
        config.modules[moduleId] ? <Fragment key={moduleId}>{sections.get(moduleId)}</Fragment> : null,
      )}
    </main>
  );
}

function SectionIntro({
  eyebrow,
  heading,
  description,
  align = "center",
}: {
  eyebrow: string;
  heading: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cx(
        "flex max-w-3xl flex-col",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
      )}
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
        {heading}
      </h2>
      {description && <p className="mt-4 text-lg leading-8 text-tertiary">{description}</p>}
    </div>
  );
}

export function EnterpriseSalesPreview({
  config,
  className,
}: {
  config: SalesEnablementConfig;
  className?: string;
}) {
  if (!config.enabled || !config.visibility.showHomePreview) return null;

  return (
    <section className={cx("border-y border-secondary bg-secondary py-14 md:py-18", className)}>
      <div className="mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
            {config.global.homePreviewEyebrow}
          </p>
          <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
            {config.global.homePreviewHeading}
          </h2>
          <p className="mt-4 text-lg leading-8 text-tertiary">{config.global.homePreviewDescription}</p>
          <Button className="mt-7" size="xl" href={config.global.homePreviewCta.href} iconTrailing={ArrowRight}>
            {config.global.homePreviewCta.label}
          </Button>
        </div>
        {config.global.homePreviewMetrics.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {config.global.homePreviewMetrics.slice(0, 4).map((metric) => (
            <div key={metric.label} className="rounded-lg bg-primary p-5 ring-1 ring-secondary">
              <p className="text-display-xs font-semibold text-brand-secondary">{metric.value}</p>
              <p className="mt-2 text-sm font-semibold text-primary">{metric.label}</p>
              <p className="mt-1 text-sm text-tertiary">{metric.detail}</p>
            </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function EnterpriseSalesSuite({
  config,
  className,
}: {
  config: SalesEnablementConfig;
  className?: string;
}) {
  if (!config.enabled || !config.visibility.showEnterprisePage) return null;

  return (
    <OrderedSections config={config} className={className}>
      <Enabled module="hero">
        <section
          id="enterprise-sales-hero"
          className="relative isolate overflow-hidden border-b border-secondary bg-secondary py-20 md:py-28"
        >
          <div className="texture-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-container gap-10 px-4 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
                {config.hero.eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
                {config.hero.headline}
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-tertiary">{config.hero.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" href={config.hero.primaryCta.href} iconTrailing={ArrowRight}>
                  {config.hero.primaryCta.label}
                </Button>
                <Button color="secondary" size="xl" href={config.hero.secondaryCta.href}>
                  {config.hero.secondaryCta.label}
                </Button>
              </div>
              <p className="mt-5 text-sm text-tertiary">{config.hero.responsePromise}</p>
            </div>
            <div className="rounded-lg bg-primary p-6 ring-1 ring-secondary">
              <p className="text-sm font-semibold text-primary">{config.hero.qualificationNote}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {config.hero.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full bg-brand-primary_alt px-3 py-1 text-xs font-semibold text-brand-secondary ring-1 ring-brand/20"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="proof">
        <section className="border-b border-secondary bg-primary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.proof} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.proof.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-secondary p-5 ring-1 ring-secondary">
                  <p className="text-display-xs font-semibold text-brand-secondary">{metric.value}</p>
                  <p className="mt-2 text-sm font-semibold text-primary">{metric.label}</p>
                  <p className="mt-1 text-sm text-tertiary">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="personas">
        <section className="border-b border-secondary bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.personas} />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {config.personas.items.map((item) => (
                <article key={item.role} className="rounded-lg bg-primary p-5 ring-1 ring-secondary">
                  <Users01 className="size-5 text-brand-secondary" aria-hidden="true" />
                  <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">
                    {item.role}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-tertiary">{item.challenge}</p>
                  <p className="mt-3 text-sm font-medium text-secondary">{item.outcome}</p>
                  <Button className="mt-5" color="link-color" size="sm" href={item.ctaHref} iconTrailing={ArrowRight}>
                    {item.ctaLabel}
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="outcomes">
        <section className="border-b border-secondary bg-primary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.outcomes} />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {config.outcomes.items.map((item) => (
                <article key={item.title} className="rounded-lg bg-secondary p-6 ring-1 ring-secondary">
                  <CheckCircle className="size-5 text-fg-success-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-md text-tertiary">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-secondary">{item.evidence}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="stories">
        <section className="border-b border-secondary bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.stories} />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {config.stories.items.map((item) => (
                <article key={item.title} className="rounded-lg bg-primary p-6 ring-1 ring-secondary">
                  <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">{item.industry}</p>
                  <h3 className="mt-3 text-xl font-semibold text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm text-tertiary">{item.challenge}</p>
                  <p className="mt-3 text-sm font-medium text-secondary">{item.outcome}</p>
                  <p className="mt-5 text-display-xs font-semibold text-brand-secondary">{item.metric}</p>
                  <p className="text-xs text-tertiary">{item.metricLabel}</p>
                  <Button
                    className="mt-5"
                    color="link-color"
                    size="sm"
                    href={item.href}
                    iconTrailing={ArrowRight}
                  >
                    Explore {item.industry}
                  </Button>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-quaternary">{config.stories.disclaimer}</p>
          </div>
        </section>
      </Enabled>

      <Enabled module="trust">
        <section className="border-b border-secondary bg-primary py-16 md:py-24">
          <div className="mx-auto grid max-w-container gap-10 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionIntro align="left" {...config.trust} />
              <Button className="mt-7" size="xl" href={config.trust.cta.href} iconTrailing={ArrowRight}>
                {config.trust.cta.label}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {config.trust.certifications.map((item) => (
                <a key={item.name} href={item.href} className="rounded-lg bg-secondary p-5 ring-1 ring-secondary hover:ring-brand">
                  <ShieldTick className="size-5 text-brand-secondary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-primary">{item.name}</h3>
                  <p className="mt-2 text-sm text-tertiary">{item.detail}</p>
                </a>
              ))}
              {config.trust.commitments.map((item) => (
                <div key={item.label} className="rounded-lg bg-secondary p-5 ring-1 ring-secondary">
                  <p className="text-display-xs font-semibold text-brand-secondary">{item.value}</p>
                  <h3 className="mt-2 text-lg font-semibold text-primary">{item.label}</h3>
                  <p className="mt-2 text-sm text-tertiary">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="risk">
        <section className="border-b border-secondary bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.risk} />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {config.risk.items.map((item) => (
                <article key={item.title} className="rounded-lg bg-primary p-5 ring-1 ring-secondary">
                  <Flag03 className="size-5 text-brand-secondary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-tertiary">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="roi">
        <EnterpriseRoiCalculator config={config.roi} />
      </Enabled>

      <Enabled module="roadmap">
        <section id="implementation-roadmap" className="scroll-mt-24 border-b border-secondary bg-primary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.roadmap} />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {config.roadmap.steps.map((step) => (
                <article key={step.phase} className="rounded-lg bg-secondary p-5 ring-1 ring-secondary">
                  <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">{step.phase}</p>
                  <h3 className="mt-3 text-lg font-semibold text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm text-tertiary">{step.description}</p>
                  <p className="mt-4 text-xs text-quaternary">{step.owner} - {step.timing}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="procurement">
        <section className="border-b border-secondary bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <SectionIntro {...config.procurement} />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {config.procurement.resources.filter((resource) => resource.enabled).map((resource) => (
                <article key={resource.title} className="rounded-lg bg-primary p-6 ring-1 ring-secondary">
                  <FileCheck02 className="size-5 text-brand-secondary" aria-hidden="true" />
                  <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">
                    {resource.kind}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-primary">{resource.title}</h3>
                  <p className="mt-2 text-md text-tertiary">{resource.description}</p>
                  <Button className="mt-5" color="link-color" size="sm" href={resource.href} iconTrailing={ArrowRight}>
                    {resource.ctaLabel}
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="briefing_form">
        <EnterpriseBriefingForm config={config.briefingForm} />
      </Enabled>

      <Enabled module="faq">
        <section className="border-b border-secondary bg-primary py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <SectionIntro {...config.faq} />
            <div className="mt-10 divide-y divide-secondary rounded-lg bg-secondary ring-1 ring-secondary">
              {config.faq.items.map((item) => (
                <details key={item.question} className="group p-5 open:bg-primary/60">
                  <summary className="cursor-pointer text-md font-semibold text-primary">{item.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-tertiary">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </Enabled>

      <Enabled module="final_cta">
        <section className="bg-secondary py-16 md:py-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <div className="rounded-lg bg-primary p-8 text-center ring-1 ring-secondary md:p-12">
              <BarChart01 className="mx-auto size-8 text-brand-secondary" aria-hidden="true" />
              <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
                {config.finalCta.eyebrow}
              </p>
              <h2 className="mx-auto mt-3 max-w-3xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
                {config.finalCta.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-tertiary">{config.finalCta.description}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="xl" href={config.finalCta.primaryCta.href} iconTrailing={ArrowRight}>
                  {config.finalCta.primaryCta.label}
                </Button>
                <Button color="secondary" size="xl" href={config.finalCta.secondaryCta.href}>
                  {config.finalCta.secondaryCta.label}
                </Button>
              </div>
              <p className="mt-5 text-sm text-tertiary">{config.finalCta.reassurance}</p>
            </div>
          </div>
        </section>
      </Enabled>
    </OrderedSections>
  );
}

export default EnterpriseSalesSuite;
