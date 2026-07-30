"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Calculator } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { pushEvent } from "@/lib/analytics";
import type { SalesEnablementConfig } from "@/lib/salesEnablement";
import { cx } from "@/utils/cx";

type RoiConfig = SalesEnablementConfig["roi"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function EnterpriseRoiCalculator({
  config,
  className,
}: {
  config: RoiConfig;
  className?: string;
}) {
  const minimum = Math.min(config.minimumAnnualSpend, config.maximumAnnualSpend);
  const maximum = Math.max(config.minimumAnnualSpend, config.maximumAnnualSpend);
  const initial = clamp(config.defaultAnnualSpend, minimum, maximum);
  const [annualSpend, setAnnualSpend] = useState(initial);
  const step = Math.max(1_000, Math.round((maximum - minimum) / 100_000) * 1_000);

  const scenario = useMemo(
    () => ({
      low: Math.round(annualSpend * (config.savingsLowPercent / 100)),
      high: Math.round(annualSpend * (config.savingsHighPercent / 100)),
    }),
    [annualSpend, config.savingsHighPercent, config.savingsLowPercent],
  );

  return (
    <section
      id="roi-planner"
      aria-labelledby="roi-planner-heading"
      className={cx("scroll-mt-24 border-y border-secondary bg-secondary py-16 md:py-24", className)}
    >
      <div className="mx-auto grid max-w-container gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
            {config.eyebrow}
          </p>
          <h2
            id="roi-planner-heading"
            className="mt-3 max-w-2xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md"
          >
            {config.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-tertiary">{config.description}</p>
          <Button className="mt-7" size="xl" href={config.cta.href} iconTrailing={ArrowRight}>
            {config.cta.label}
          </Button>
        </div>

        <div className="rounded-3xl bg-primary p-6 shadow-xl ring-1 ring-secondary sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary_alt text-fg-brand-primary ring-1 ring-brand/20">
              <Calculator className="size-5" aria-hidden="true" />
            </span>
            <div>
              <label htmlFor="enterprise-annual-spend" className="text-sm font-semibold text-primary">
                Current annual infrastructure and operations spend
              </label>
              <p className="mt-1 text-sm text-tertiary">
                Use a planning estimate that includes infrastructure, tooling, support, and internal operating capacity.
              </p>
            </div>
          </div>

          <output
            htmlFor="enterprise-annual-spend"
            className="mt-7 block text-display-sm font-semibold tracking-tight text-primary"
          >
            {currency.format(annualSpend)}
          </output>
          <input
            id="enterprise-annual-spend"
            type="range"
            min={minimum}
            max={maximum}
            step={step}
            value={annualSpend}
            onChange={(event) => setAnnualSpend(Number(event.currentTarget.value))}
            className="mt-5 h-2 w-full cursor-pointer accent-brand-solid"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-quaternary" aria-hidden="true">
            <span>{currency.format(minimum)}</span>
            <span>{currency.format(maximum)}</span>
          </div>

          <div
            aria-live="polite"
            className="mt-8 grid gap-4 border-t border-secondary pt-6 sm:grid-cols-2"
          >
            <div className="rounded-2xl bg-secondary p-5 ring-1 ring-secondary">
              <p className="text-sm font-medium text-tertiary">
                {config.savingsLowPercent}% planning scenario
              </p>
              <p className="mt-2 text-display-xs font-semibold text-primary">{currency.format(scenario.low)}</p>
              <p className="mt-1 text-xs text-quaternary">Estimated annual opportunity</p>
            </div>
            <div className="rounded-2xl bg-brand-primary_alt p-5 ring-1 ring-brand/20">
              <p className="text-sm font-medium text-brand-secondary">
                {config.savingsHighPercent}% planning scenario
              </p>
              <p className="mt-2 text-display-xs font-semibold text-primary">{currency.format(scenario.high)}</p>
              <p className="mt-1 text-xs text-tertiary">Estimated annual opportunity</p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-5 text-quaternary">{config.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}

export function EnterpriseStickyCta({
  config,
  className,
}: {
  config: SalesEnablementConfig;
  className?: string;
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isSuppressed =
    pathname === "/contact" ||
    pathname === "/sms-consent" ||
    pathname === "/terms-of-service";

  useEffect(() => {
    const hero = document.getElementById("enterprise-sales-hero");

    if (hero && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => setIsVisible(!entry.isIntersecting),
        { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
      );
      observer.observe(hero);
      return () => observer.disconnect();
    }

    const updateVisibility = () => setIsVisible(window.scrollY > 640);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!config.enabled || !config.visibility.showStickyCta || isSuppressed) return null;

  return (
    <aside
      aria-label="Enterprise buyer actions"
      aria-hidden={!isVisible}
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 transition duration-300 motion-reduce:transition-none md:p-4",
        isVisible ? "translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0",
        className,
      )}
    >
      <div className="pointer-events-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl bg-primary/95 p-3 shadow-2xl ring-1 ring-secondary backdrop-blur-xl sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
        <div className="px-1">
          <p className="text-sm font-semibold text-primary">{config.global.stickyTitle}</p>
          <p className="mt-0.5 hidden text-xs text-tertiary sm:block">{config.global.stickyDescription}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            color="secondary"
            size="md"
            href={config.global.stickyPrimaryCta.href}
            className="justify-center"
            onClick={() =>
              pushEvent("enterprise_sticky_cta_clicked", {
                location: "sticky_enterprise",
                target: "buyer_center",
              })
            }
          >
            {config.global.stickyPrimaryCta.label}
          </Button>
          <Button
            size="md"
            href={config.global.stickySecondaryCta.href}
            iconTrailing={ArrowRight}
            className="justify-center"
            onClick={() =>
              pushEvent("enterprise_sticky_cta_clicked", {
                location: "sticky_enterprise",
                target: "architecture_review",
              })
            }
          >
            {config.global.stickySecondaryCta.label}
          </Button>
        </div>
      </div>
    </aside>
  );
}
