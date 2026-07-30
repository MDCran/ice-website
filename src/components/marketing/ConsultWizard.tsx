"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Send01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { PhoneField, ServiceSelect, type ServiceGroup } from "@/components/ui/ContactWidget";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Scope" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Details" },
];

const STEP_META: Record<Step, { title: string; description: string }> = {
  1: {
    title: "Scope the request",
    description: "Confirm the service area, platform, and timing so the right ICE specialist can follow up.",
  },
  2: {
    title: "Who should we contact?",
    description: "Add the best person for discovery, budget, or technical fit questions.",
  },
  3: {
    title: "Add useful context",
    description: "Share environment details, deadlines, compliance needs, or anything the team should review first.",
  },
};

const URGENCY_OPTIONS = [
  { id: "exploring", label: "Exploring options", hint: "No immediate deadline" },
  { id: "planning", label: "Planning this quarter", hint: "Budget / design in progress" },
  { id: "urgent", label: "Urgent / active issue", hint: "Need help within days" },
] as const;

const PLATFORM_OPTIONS = [
  "IBM i / AS/400",
  "IBM Power / AIX",
  "Microsoft / Azure",
  "Hybrid / multi-platform",
  "Not sure yet",
] as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type PrefillIntent = {
  requestedService?: string;
  service?: string;
  source?: string;
  sourceLabel: string;
  summary?: string;
};

const SERVICE_ALIASES = [
  ["Cloud Migration Services", "Cloud Migration"],
  ["Disaster Recovery as a Service", "Disaster Recovery"],
  ["High Availability as a Service", "High Availability"],
  ["IBM Power Virtual Server", "IBM Power VS"],
  ["IBM Power Virtual Servers", "IBM Power VS"],
  ["Managed Microsoft Services", "Managed Microsoft"],
  ["Threat Detection", "Threat Detection & Response"],
] as const;

function normalizeServiceName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bas a service\b/g, "")
    .replace(/\bservices?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function serviceOptions(groups: ServiceGroup[]) {
  return groups.flatMap((group) => group.options);
}

function findServiceOption(raw: string, groups: ServiceGroup[]) {
  const requested = raw.trim();
  if (!requested) return "";

  const options = serviceOptions(groups);
  const exact = options.find((option) => option.toLowerCase() === requested.toLowerCase());
  if (exact) return exact;

  const alias = SERVICE_ALIASES.find(([from]) => normalizeServiceName(from) === normalizeServiceName(requested));
  if (alias) {
    const aliasMatch = options.find((option) => option.toLowerCase() === alias[1].toLowerCase());
    if (aliasMatch) return aliasMatch;
  }

  const normalized = normalizeServiceName(requested);
  const fuzzy = options.find((option) => {
    const normalizedOption = normalizeServiceName(option);
    return normalized === normalizedOption || normalized.startsWith(normalizedOption) || normalizedOption.startsWith(normalized);
  });
  return fuzzy ?? requested;
}

function ensureServiceOption(groups: ServiceGroup[], service?: string) {
  if (!service) return groups;
  const exists = serviceOptions(groups).some((option) => option.toLowerCase() === service.toLowerCase());
  if (exists) return groups;
  return [{ label: "From your visit", options: [service] }, ...groups];
}

function labelForSource(source?: string) {
  switch (source) {
    case "solution_detail":
      return "Prefilled from the solution page";
    case "solution_finder":
      return "Prefilled from the solution finder";
    case "solutions_index":
      return "Prefilled from the solutions catalog";
    default:
      return "Prefilled from your previous page";
  }
}

/** Multi-step consult wizard with manual Back/Continue navigation. */
export default function ConsultWizard({
  serviceGroups,
  bookingUrl,
}: {
  serviceGroups: ServiceGroup[];
  bookingUrl?: string | null;
}) {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    service: "",
    platform: "",
    urgency: "" as (typeof URGENCY_OPTIONS)[number]["id"] | "",
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    smsConsent: false,
  });
  const [prefillIntent, setPrefillIntent] = useState<PrefillIntent | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") ?? undefined;
    const requestedService = params.get("service") ?? "";
    const resolvedService = requestedService ? findServiceOption(requestedService, serviceGroups) : "";
    const summary = params.get("summary") ?? "";
    const workloadToPlatform: Record<string, string> = {
      "ibm-i": "IBM i / AS/400",
      microsoft: "Microsoft / Azure",
      hybrid: "Hybrid / multi-platform",
      unsure: "Not sure yet",
    };
    const timelineToUrgency: Record<string, (typeof URGENCY_OPTIONS)[number]["id"]> = {
      now: "urgent",
      quarter: "planning",
      later: "exploring",
      research: "exploring",
    };

    if (!source && !requestedService && !summary && !params.get("workload") && !params.get("timeline")) {
      return;
    }

    setPrefillIntent({
      requestedService: requestedService || undefined,
      service: resolvedService || undefined,
      source,
      sourceLabel: labelForSource(source),
      summary: summary || undefined,
    });

    setFormData((current) => ({
      ...current,
      service: resolvedService || current.service,
      platform: workloadToPlatform[params.get("workload") ?? ""] || current.platform,
      urgency: timelineToUrgency[params.get("timeline") ?? ""] || current.urgency,
      message: summary && !current.message ? summary : current.message,
    }));
  }, [serviceGroups]);

  const effectiveServiceGroups = useMemo(
    () => ensureServiceOption(serviceGroups, prefillIntent?.service),
    [serviceGroups, prefillIntent?.service],
  );

  const goToStep = (next: Step, source: "manual" | "back") => {
    if (source === "manual") {
      pushEvent("consult_wizard_step", { step, next, source });
    }
    setStep(next);
  };

  const patchForm = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const canContinueStep1 = Boolean(formData.service && formData.platform && formData.urgency);
  const hasRequiredPhone = formData.phone.replace(/\D/g, "").length >= 7;
  const canContinueStep2 = Boolean(formData.name.trim() && isValidEmail(formData.email) && hasRequiredPhone);

  const buildMessage = () => {
    const urgencyLabel =
      URGENCY_OPTIONS.find((o) => o.id === formData.urgency)?.label ?? formData.urgency;
    const lines = [
      formData.message.trim() || null,
      prefillIntent?.requestedService ? `Requested page: ${prefillIntent.requestedService}` : null,
      prefillIntent?.source ? `Lead source: ${prefillIntent.source}` : null,
      "Consult wizard",
      `Platform: ${formData.platform}`,
      `Urgency: ${urgencyLabel}`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;
    setStatus("loading");
    setStatusMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        service: formData.service,
        message: buildMessage(),
        smsConsent: formData.smsConsent,
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      pushEvent("contact_submitted", {
        form: "consult_wizard",
        service: formData.service,
        platform: formData.platform,
        urgency: formData.urgency,
      });
      setStatus("success");
      setStatusMessage(
        "Your consultation request was sent. An ICE specialist will follow up shortly.",
      );
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[32rem] flex-col justify-center gap-4 rounded-2xl bg-primary p-5 shadow-lg ring-1 ring-secondary ring-inset sm:p-7 md:p-8">
        <div role="alert" className="flex items-start gap-3 rounded-lg bg-success-secondary px-4 py-3">
          <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" />
          <div>
            <p className="text-sm font-semibold text-success-primary">Request received</p>
            <p className="mt-1 text-sm text-success-primary">{statusMessage}</p>
          </div>
        </div>
        {bookingUrl && (
          <Button
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            color="secondary"
            iconLeading={Calendar}
            onClick={() =>
              pushEvent("consultation_cta_clicked", {
                location: "consult_wizard_success",
                href: bookingUrl,
              })
            }
          >
            Or book a time on the calendar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      id="contact-form"
      className="flex flex-col gap-5 rounded-lg bg-primary p-5 shadow-lg ring-1 ring-secondary ring-inset sm:p-6 md:p-7 dark:shadow-[0_0_60px_rgb(4_155_251/0.08)]"
    >
      <div>
        <h2 className="text-display-xs font-semibold text-primary">Request a consultation</h2>
        <p className="mt-1 text-sm text-tertiary">A few quick questions — about a minute.</p>
      </div>

      {prefillIntent && (
        <div className="border-l-2 border-brand-solid pl-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">
            {prefillIntent.sourceLabel}
          </p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {prefillIntent.requestedService ?? prefillIntent.service}
          </p>
          {prefillIntent.summary && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-tertiary">{prefillIntent.summary}</p>
          )}
        </div>
      )}

      {/* Step indicators */}
      <nav aria-label="Consultation progress" className="w-full">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((s) => {
            const done = step > s.id;
            const current = step === s.id;
            const reachable =
              s.id < step ||
              s.id === step ||
              (s.id === 2 && canContinueStep1) ||
              (s.id === 3 && canContinueStep1 && canContinueStep2);
            return (
              <li key={s.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    // Allow jumping back to completed / current steps only
                    if (s.id < step) goToStep(s.id, "back");
                    else if (s.id === 2 && canContinueStep1) goToStep(2, "manual");
                    else if (s.id === 3 && canContinueStep1 && canContinueStep2) goToStep(3, "manual");
                  }}
                  className={cx(
                    "flex min-h-16 w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-3 text-left ring-1 outline-focus-ring transition focus-visible:outline-2 focus-visible:outline-offset-2",
                    current && "bg-brand-primary_alt ring-brand",
                    done && !current && "bg-secondary ring-secondary",
                    !done && !current && "bg-primary ring-secondary",
                    reachable ? "cursor-pointer hover:ring-brand" : "cursor-default opacity-70",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  <span
                    className={cx(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                      done && "bg-brand-solid text-white",
                      current &&
                        "bg-brand-solid text-white shadow-[0_0_0_4px_rgb(4_155_251/0.2)]",
                      !done && !current && "bg-secondary text-quaternary ring-1 ring-secondary",
                    )}
                  >
                    {done ? <CheckCircle className="size-4" /> : s.id}
                  </span>
                  <span
                    className={cx(
                      "min-w-0 text-sm font-semibold",
                      current ? "text-brand-secondary" : done ? "text-secondary" : "text-quaternary",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="border-b border-secondary pb-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">
            {STEPS.find((item) => item.id === step)?.label}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-primary">{STEP_META[step].title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-tertiary">{STEP_META[step].description}</p>
        </div>

        <div
          className={cx(
            "relative transition-[min-height] duration-200",
            step === 1 && "min-h-[27rem] sm:min-h-[24rem]",
            step === 2 && "min-h-[22rem] sm:min-h-[19rem]",
            step === 3 && "min-h-[21rem] sm:min-h-[18rem]",
          )}
        >
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <ServiceSelect
                size="md"
                name="service"
                label="What do you need help with?"
                value={formData.service}
                onChange={(value) => patchForm({ service: value })}
                groups={effectiveServiceGroups}
              />

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-secondary">Primary platform</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PLATFORM_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => patchForm({ platform: option })}
                      className={cx(
                        "min-h-12 rounded-lg px-3.5 py-3 text-left text-sm ring-1 transition",
                        formData.platform === option
                          ? "bg-brand-primary_alt font-semibold text-brand-secondary ring-brand"
                          : "bg-primary text-secondary ring-secondary hover:bg-secondary",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-secondary">Timeline</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => patchForm({ urgency: option.id })}
                      className={cx(
                        "min-h-[5rem] rounded-lg px-3.5 py-3 text-left ring-1 transition",
                        formData.urgency === option.id
                          ? "bg-brand-primary_alt ring-brand"
                          : "bg-primary ring-secondary hover:bg-secondary",
                      )}
                    >
                      <span className="block text-sm font-semibold text-primary">{option.label}</span>
                      <span className="text-xs text-tertiary">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Input
                  isRequired
                  validationBehavior="native"
                  size="md"
                  name="name"
                  label="Name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(value) => patchForm({ name: value })}
                  wrapperClassName="min-w-0"
                />
                <Input
                  isRequired
                  validationBehavior="native"
                  size="md"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  label="Email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(value) => patchForm({ email: value })}
                  wrapperClassName="min-w-0"
                />
                <Input
                  size="md"
                  name="company"
                  label="Company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(value) => patchForm({ company: value })}
                  wrapperClassName="min-w-0"
                />
                <PhoneField
                  isRequired
                  size="md"
                  label="Phone number"
                  value={formData.phone}
                  onChange={(value) => patchForm({ phone: value })}
                  wrapperClassName="sm:col-span-2"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <TextArea
                name="message"
                label="Anything else we should know? (optional)"
                placeholder="Environment details, compliance needs, current pain points…"
                rows={6}
                value={formData.message}
                onChange={(value) => patchForm({ message: value })}
                textAreaClassName="min-h-[10rem]"
              />
              <Checkbox
                name="smsConsent"
                size="md"
                aria-label="SMS consent"
                isSelected={formData.smsConsent}
                onChange={(value) => patchForm({ smsConsent: value })}
                hint={
                  <>
                    I consent to receive SMS text messages from International Computer Exchange.
                    Message and data rates may apply. Reply STOP to opt out. See our{" "}
                    <Link
                      href="/sms-consent"
                      className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      SMS Consent Policy
                    </Link>
                    .
                  </>
                }
              />
              {bookingUrl && (
                <Button
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="md"
                  color="secondary"
                  iconLeading={Calendar}
                  onClick={() =>
                    pushEvent("consultation_cta_clicked", {
                      location: "consult_wizard_step3",
                      href: bookingUrl,
                    })
                  }
                >
                  Prefer to book a calendar slot?
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-secondary pt-5 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              color="secondary"
              size="lg"
              iconLeading={ArrowLeft}
              onClick={() => goToStep(step === 3 ? 2 : 1, "back")}
            >
              Back
            </Button>
          ) : (
            <span className="hidden sm:block sm:min-w-24" />
          )}

          {step < 3 ? (
            <Button
              type="button"
              size="lg"
              iconTrailing={ArrowRight}
              isDisabled={step === 1 ? !canContinueStep1 : !canContinueStep2}
              onClick={() => goToStep(step === 1 ? 2 : 3, "manual")}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              iconLeading={status === "loading" ? undefined : Send01}
              isLoading={status === "loading"}
              showTextWhileLoading
              isDisabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Submit request"}
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-quaternary sm:text-right">
          Typical reply within 1 business day. Urgent requests are prioritized.
        </p>

        {status === "error" && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-error-secondary px-4 py-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-fg-error-primary" />
            <p className="text-sm text-error-primary">{statusMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
}
