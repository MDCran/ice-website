"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Calculator, Calendar, CheckCircle, ChevronDown, Phone01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
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

const SOLUTION_NAMES: Record<string, string> = {
  "managed-cloud-hosting": "managed cloud hosting",
  "managed-private-cloud": "managed private cloud",
  "managed-hybrid-cloud": "hybrid cloud",
  "cloud-migration": "cloud migration",
  "backup-as-a-service": "backup as a service",
  "managed-backup": "backup and restore",
  "disaster-recovery": "disaster recovery",
  "high-availability": "high availability",
  "ransomware-recovery": "ransomware recovery",
  as400: "AS400 and IBM i",
  "ibm-i-services": "IBM i",
  "ibm-i-security": "IBM i security",
  "security-monitoring": "security monitoring",
  "threat-detection": "threat detection and response",
  "endpoint-security": "endpoint security",
  "protection-suite": "protection suite",
  "managed-microsoft": "managed Microsoft services",
  "automation-suite": "automation suite",
  "systems-management": "systems management",
  "ibm-power-vs": "IBM Power Virtual Server",
  cybersecurity: "cybersecurity",
};

function renderSolutionTemplate(template: string, solution: string): string {
  return template.split("{solution}").join(solution);
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

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
  const [callbackTime, setCallbackTime] = useState(
    config.global.callbackTimeOptions[0]?.id ?? "Today",
  );
  const [callbackStatus, setCallbackStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const isSuppressed =
    pathname === "/contact" ||
    pathname === "/subscribe" ||
    pathname?.startsWith("/unsubscribe/") ||
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
  const solutionName = SOLUTION_NAMES[solutionSlug];
  const title = solutionName
    ? renderSolutionTemplate(config.global.stickySolutionTitleTemplate, solutionName)
    : config.global.stickyTitle;
  const description = solutionName
    ? renderSolutionTemplate(config.global.stickySolutionDescriptionTemplate, solutionName)
    : config.global.stickyDescription;
  const callbackTimeOptions = config.global.callbackTimeOptions;
  const selectedCallbackTime = callbackTimeOptions.some((item) => item.id === callbackTime)
    ? callbackTime
    : callbackTimeOptions[0].id;
  const submitCallback = async () => {
    setCallbackStatus("sending");
    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: callbackPhone,
          preferredTime: selectedCallbackTime,
          context: solutionName || config.global.callbackContextFallback,
          pagePath: pathname,
        }),
      });
      setCallbackStatus(response.ok ? "success" : "error");
    } catch {
      setCallbackStatus("error");
    }
  };

  return (
    <aside
      aria-label={config.global.buyerActionsAriaLabel}
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
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-bold text-white shadow-[0_14px_30px_-18px_rgb(4_155_251/0.9)] sm:flex">
            {config.global.stickyBrandLabel}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{title}</p>
            <p className="mt-0.5 hidden text-xs text-tertiary sm:block">{description}</p>
            <p className="mt-1 hidden items-center gap-1.5 text-xs font-medium text-brand-secondary md:flex">
              <CheckCircle aria-hidden="true" className="size-3.5" />
              {config.global.stickySupportNote}
            </p>
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
            aria-controls="enterprise-callback-dialog"
            onClick={() => {
              setCallbackOpen((value) => !value);
              setCallbackStatus("idle");
            }}
            className={cx(
              "inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-secondary bg-secondary/75 px-4 text-sm font-semibold text-primary shadow-sm transition hover:border-brand/35 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              callbackOpen && "border-brand/45 bg-brand-primary_alt text-brand-secondary",
            )}
          >
            <span className="whitespace-nowrap">{config.global.callbackTriggerLabel}</span>
            <ChevronDown
              aria-hidden="true"
              className={cx("size-4 shrink-0 transition", callbackOpen && "rotate-180")}
            />
          </button>
        </div>
        {callbackOpen && (
          <div
            id="enterprise-callback-dialog"
            role="dialog"
            aria-label={config.global.callbackDialogAriaLabel}
            className="absolute right-0 bottom-[calc(100%+10px)] z-20 w-[min(30rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-secondary bg-primary p-4 shadow-2xl ring-1 ring-secondary sm:p-5 lg:right-5"
          >
            {callbackStatus === "success" ? (
              <div className="flex items-start gap-3" role="status" aria-live="polite">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-primary text-fg-success-primary ring-1 ring-success_subtle">
                  <CheckCircle aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {config.global.callbackSuccessHeading}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-tertiary">
                    {config.global.callbackSuccessDescription}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary_alt text-fg-brand-primary ring-1 ring-brand/20">
                    <Phone01 aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {config.global.callbackTitle}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-tertiary">
                      {config.global.callbackDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Input
                    id="callback-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={14}
                    size="md"
                    label={config.global.callbackPhoneLabel}
                    icon={Phone01}
                    value={callbackPhone}
                    onChange={(value) => setCallbackPhone(formatPhone(value))}
                    placeholder={config.global.callbackPhonePlaceholder}
                    className="min-w-0"
                  />
                  <Select
                    label={config.global.callbackPreferredTimeLabel}
                    size="md"
                    className="min-w-0"
                    popoverClassName="w-[13.5rem]"
                    icon={Calendar}
                    items={callbackTimeOptions}
                    selectedKey={selectedCallbackTime}
                    onSelectionChange={(key) => setCallbackTime(String(key))}
                  >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                  </Select>
                </div>

                <Button
                  size="md"
                  className="mt-4 w-full justify-center"
                  isLoading={callbackStatus === "sending"}
                  isDisabled={callbackPhone.replace(/\D/g, "").length < 7}
                  onClick={submitCallback}
                >
                  {config.global.callbackSubmitLabel}
                </Button>
                {callbackStatus === "error" && (
                  <p className="mt-2 text-xs text-error-primary" role="alert">
                    {config.global.callbackErrorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
