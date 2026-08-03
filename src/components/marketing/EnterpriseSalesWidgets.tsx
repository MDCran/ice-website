"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Calculator, Calendar, CheckCircle, ChevronDown, Phone01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { pushEvent } from "@/lib/analytics";
import type { SalesEnablementConfig } from "@/lib/salesEnablement";
import { cx } from "@/utils/cx";

type RoiConfig = SalesEnablementConfig["roi"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CALLBACK_TIME_OPTIONS = [
  { id: "Today", label: "Today · Any time" },
  { id: "Tomorrow morning", label: "Tomorrow · Morning" },
  { id: "Tomorrow afternoon", label: "Tomorrow · Afternoon" },
  { id: "This week", label: "This week · Flexible" },
];

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
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackTime, setCallbackTime] = useState("Today");
  const [callbackStatus, setCallbackStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
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

  const solutionSlug = pathname.startsWith("/solutions/") ? pathname.split("/").filter(Boolean)[1] ?? "" : "";
  const solutionNames: Record<string, string> = {
    "disaster-recovery": "disaster recovery",
    "managed-backup": "backup and restore",
    "high-availability": "high availability",
    "ransomware-recovery": "ransomware recovery",
    "ibm-i-services": "IBM i",
    "ibm-i-security": "IBM i security",
    "ibm-power-vs": "IBM Power Virtual Server",
    "managed-cloud-hosting": "managed cloud hosting",
    "managed-hybrid-cloud": "hybrid cloud",
    "cloud-migration": "cloud migration",
    cybersecurity: "cybersecurity",
  };
  const solutionName = solutionNames[solutionSlug];
  const title = solutionName ? `Questions about ${solutionName}? Talk with a specialist.` : config.global.stickyTitle;
  const description = solutionName
    ? `Get a practical review from ICE’s US-based infrastructure team—without starting with a generic sales presentation.`
    : config.global.stickyDescription;
  const submitCallback = async () => {
    setCallbackStatus("sending");
    const response = await fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: callbackPhone, preferredTime: callbackTime, context: solutionName || "Enterprise infrastructure planning", pagePath: pathname }),
    });
    setCallbackStatus(response.ok ? "success" : "error");
  };

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
      <div className="pointer-events-auto relative grid w-full max-w-7xl gap-3 rounded-xl border border-secondary bg-primary/95 p-3 shadow-[0_18px_60px_-32px_rgb(15_23_42/0.55)] ring-1 ring-white/50 backdrop-blur-xl sm:p-4 lg:grid-cols-[minmax(20rem,1fr)_auto] lg:items-center lg:px-5 dark:ring-secondary">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-solid/55 to-transparent" />
        <div className="flex min-w-0 items-center gap-3 px-1">
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-bold text-white shadow-[0_14px_30px_-18px_rgb(4_155_251/0.9)] sm:flex">ICE</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{title}</p>
            <p className="mt-0.5 hidden text-xs text-tertiary sm:block">{description}</p>
            <p className="mt-1 hidden items-center gap-1.5 text-xs font-medium text-brand-secondary md:flex"><CheckCircle className="size-3.5" /> ICE Solutions Desk · US-based infrastructure specialists</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:justify-end lg:[&>*]:shrink-0">
          <Button
            size="md"
            href={config.global.stickyPrimaryCta.href}
            iconLeading={Phone01}
            className="h-11 min-w-[13rem] justify-center whitespace-nowrap rounded-xl px-4 shadow-[0_14px_28px_-18px_rgb(4_155_251/0.95)]"
            onClick={() =>
              pushEvent("enterprise_sticky_cta_clicked", {
                location: "sticky_enterprise",
                target: "buyer_center",
              })
            }
          >
            {config.global.stickyPrimaryCta.label}
          </Button>
          <button
            type="button"
            aria-expanded={callbackOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setCallbackOpen((value) => !value);
              setCallbackStatus("idle");
            }}
            className={cx(
              "inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-secondary bg-secondary/75 px-4 text-sm font-semibold text-primary shadow-sm transition hover:border-brand/35 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              callbackOpen && "border-brand/45 bg-brand-primary_alt text-brand-secondary",
            )}
          >
            <span className="whitespace-nowrap">Request a callback</span>
            <ChevronDown className={cx("size-4 shrink-0 transition", callbackOpen && "rotate-180")} />
          </button>
        </div>
        {callbackOpen && (
          <div className="absolute right-3 bottom-[calc(100%+10px)] z-20 w-[min(26rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] rounded-xl border border-secondary bg-primary p-4 shadow-2xl ring-1 ring-secondary">
            {callbackStatus === "success" ? (
              <div className="flex items-start gap-3"><CheckCircle className="mt-0.5 size-5 text-fg-success-primary" /><div><p className="text-sm font-semibold text-primary">Callback requested</p><p className="mt-1 text-xs text-tertiary">An ICE specialist will use the timing you selected.</p></div></div>
            ) : (
              <>
                <p className="text-sm font-semibold text-primary">Request a callback</p>
                <p className="mt-1 text-xs text-tertiary">Share your number and the most convenient time. No long form required.</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={(event) => setCallbackPhone(event.target.value)}
                    placeholder="Phone number"
                    className="h-11 min-w-0 rounded-xl border border-secondary bg-secondary/60 px-3 text-sm font-medium text-primary outline-none transition placeholder:text-placeholder hover:border-brand/35 focus:border-brand focus:ring-4 focus:ring-brand-solid/12"
                  />
                  <div className="min-w-0">
                    <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-tertiary uppercase">
                      Preferred time
                    </span>
                    <Select
                      aria-label="Preferred callback time"
                      size="md"
                      className="w-full"
                      popoverClassName="w-[12rem]"
                      icon={Calendar}
                      items={CALLBACK_TIME_OPTIONS}
                      selectedKey={callbackTime}
                      onSelectionChange={(key) => setCallbackTime(String(key))}
                    >
                      {(item) => <Select.Item id={item.id} label={item.label} />}
                    </Select>
                  </div>
                </div>
                <Button size="sm" className="mt-3 w-full justify-center" isLoading={callbackStatus === "sending"} isDisabled={callbackPhone.replace(/\D/g, "").length < 7} onClick={submitCallback}>Request my callback</Button>
                {callbackStatus === "error" && <p className="mt-2 text-xs text-error-primary">We couldn’t save the request. Please call 1-800-786-9188.</p>}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
