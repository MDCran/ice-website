"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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

/**
 * Multi-step consult wizard — auto-advances when a step is complete;
 * fixed step panel height avoids layout jump; Back/Continue still available.
 */
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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  /** Prevents immediate re-advance after the user clicks Back. */
  const suppressAutoRef = useRef(false);
  const autoTimerRef = useRef<number | null>(null);

  const clearAutoTimer = () => {
    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  useEffect(() => () => clearAutoTimer(), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") !== "solution_finder") return;
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
    setFormData((current) => ({
      ...current,
      service: params.get("service") || current.service,
      platform: workloadToPlatform[params.get("workload") ?? ""] || current.platform,
      urgency: timelineToUrgency[params.get("timeline") ?? ""] || current.urgency,
    }));
  }, []);

  const goToStep = (next: Step, source: "auto" | "manual" | "back") => {
    clearAutoTimer();
    if (source === "back") suppressAutoRef.current = true;
    if (source === "manual" || source === "auto") suppressAutoRef.current = false;
    if (source === "auto" || source === "manual") {
      pushEvent("consult_wizard_step", { step, next, source });
    }
    setStep(next);
  };

  const scheduleAdvance = (next: Step) => {
    if (suppressAutoRef.current) return;
    clearAutoTimer();
    autoTimerRef.current = window.setTimeout(() => {
      goToStep(next, "auto");
    }, 380);
  };

  const patchForm = (patch: Partial<typeof formData>) => {
    suppressAutoRef.current = false;
    setFormData((prev) => {
      const next = { ...prev, ...patch };

      // Schedule outside the updater via microtask so Strict Mode doesn't double-fire oddly
      queueMicrotask(() => {
        if (suppressAutoRef.current) return;
        if (step === 1 && next.service && next.platform && next.urgency) {
          scheduleAdvance(2);
        }
        if (
          step === 2 &&
          next.name.trim().length >= 2 &&
          isValidEmail(next.email) &&
          ("email" in patch || "name" in patch)
        ) {
          scheduleAdvance(3);
        }
      });

      return next;
    });
  };

  const canContinueStep1 = Boolean(formData.service && formData.platform && formData.urgency);
  const canContinueStep2 = Boolean(formData.name.trim() && isValidEmail(formData.email));

  const buildMessage = () => {
    const urgencyLabel =
      URGENCY_OPTIONS.find((o) => o.id === formData.urgency)?.label ?? formData.urgency;
    const lines = [
      formData.message.trim() || null,
      "— Consult wizard —",
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
      className="flex flex-col gap-5 rounded-2xl bg-primary p-5 shadow-lg ring-1 ring-secondary ring-inset sm:p-7 md:p-8 dark:shadow-[0_0_60px_rgb(4_155_251/0.08)]"
    >
      <div>
        <h2 className="text-display-xs font-semibold text-primary">Request a consultation</h2>
        <p className="mt-1 text-sm text-tertiary">A few quick questions — about a minute.</p>
      </div>

      {/* Step indicators */}
      <nav aria-label="Consultation progress" className="w-full">
        <ol className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const current = step === s.id;
            return (
              <li key={s.id} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Allow jumping back to completed / current steps only
                    if (s.id < step) goToStep(s.id, "back");
                    else if (s.id === 2 && canContinueStep1) goToStep(2, "manual");
                    else if (s.id === 3 && canContinueStep1 && canContinueStep2) goToStep(3, "manual");
                  }}
                  className={cx(
                    "flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-1 py-1 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                    s.id <= step || (s.id === 2 && canContinueStep1) || (s.id === 3 && canContinueStep2)
                      ? "cursor-pointer"
                      : "cursor-default",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  <span
                    className={cx(
                      "flex size-8 items-center justify-center rounded-full text-sm font-semibold transition",
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
                      "max-w-full truncate text-[11px] font-semibold tracking-wide uppercase",
                      current ? "text-brand-secondary" : done ? "text-secondary" : "text-quaternary",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={cx(
                      "mx-1 mb-5 h-0.5 min-w-[0.75rem] flex-1 rounded-full transition-colors",
                      step > s.id ? "bg-brand-solid" : "bg-secondary",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Fixed-height panel so steps don't resize the card */}
        <div className="relative min-h-[26rem] sm:min-h-[24rem]">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <ServiceSelect
                size="md"
                name="service"
                label="What do you need help with?"
                value={formData.service}
                onChange={(value) => patchForm({ service: value })}
                groups={serviceGroups}
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
                        "rounded-xl px-3 py-2.5 text-left text-sm ring-1 transition",
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
                <div className="flex flex-col gap-2">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => patchForm({ urgency: option.id })}
                      className={cx(
                        "rounded-xl px-3 py-2.5 text-left ring-1 transition",
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
              <div className="flex flex-col gap-x-6 gap-y-5 sm:flex-row">
                <Input
                  isRequired
                  validationBehavior="native"
                  size="md"
                  name="name"
                  label="Name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(value) => patchForm({ name: value })}
                  wrapperClassName="flex-1"
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
                  wrapperClassName="flex-1"
                />
              </div>
              <Input
                size="md"
                name="company"
                label="Company"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(value) => patchForm({ company: value })}
              />
              <PhoneField
                size="md"
                label="Phone number"
                value={formData.phone}
                onChange={(value) => patchForm({ phone: value })}
              />
              <p className="text-xs text-quaternary">
                Completing name and email advances you automatically — or tap Continue.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <TextArea
                name="message"
                label="Anything else we should know? (optional)"
                placeholder="Environment details, compliance needs, current pain points…"
                rows={4}
                value={formData.message}
                onChange={(value) => patchForm({ message: value })}
                textAreaClassName="min-h-[6.5rem]"
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
