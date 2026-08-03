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

type UrgencyId = "exploring" | "planning" | "urgent";
type UrgencyOption = { id: UrgencyId; label: string; hint: string };
type QuestionProfile = {
  key: string;
  matchers: string[];
  scopeTitle: string;
  scopeDescription: string;
  platformLabel: string;
  platformOptions: readonly string[];
  timelineLabel: string;
  urgencyOptions: UrgencyOption[];
  detailTitle: string;
  detailDescription: string;
  detailLabel: string;
  detailPlaceholder: string;
};

const URGENCY_OPTIONS: UrgencyOption[] = [
  { id: "exploring", label: "Exploring options", hint: "No immediate deadline" },
  { id: "planning", label: "Planning this quarter", hint: "Budget / design in progress" },
  { id: "urgent", label: "Urgent / active issue", hint: "Need help within days" },
];

const DEFAULT_PLATFORM_OPTIONS = [
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
  ["AS/400", "AS400"],
  ["IBM i / AS/400", "AS400"],
  ["iSeries", "AS400"],
  ["Cloud Migration Services", "Cloud Migration"],
  ["Disaster Recovery as a Service", "Disaster Recovery"],
  ["High Availability as a Service", "High Availability"],
  ["IBM Power Virtual Server", "IBM Power VS"],
  ["IBM Power Virtual Servers", "IBM Power VS"],
  ["Managed Microsoft Services", "Managed Microsoft"],
  ["Threat Detection", "Threat Detection & Response"],
];

function normalizeServiceName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bas a service\b/g, "")
    .replace(/\bservices?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatServiceDisplayName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const exactWords: Record<string, string> = {
    as400: "AS400",
    "as/400": "AS/400",
    ibm: "IBM",
    i: "i",
    aix: "AIX",
    azure: "Azure",
    microsoft: "Microsoft",
    vmware: "VMware",
    dr: "DR",
    ha: "HA",
    rpo: "RPO",
    rto: "RTO",
  };
  const smallWords = new Set(["a", "an", "and", "as", "for", "in", "of", "the", "to"]);

  return trimmed
    .split(/(\s+|\/|-)/)
    .map((part, index) => {
      if (/^\s+$|^\/$|^-$/.test(part)) return part;
      const lower = part.toLowerCase();
      if (exactWords[lower]) return exactWords[lower];
      if (index > 0 && smallWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

const DEFAULT_QUESTION_PROFILE: QuestionProfile = {
  key: "default",
  matchers: [],
  scopeTitle: "Scope the request",
  scopeDescription: "Confirm the service area, platform, and timing so the right ICE specialist can follow up.",
  platformLabel: "Primary platform",
  platformOptions: DEFAULT_PLATFORM_OPTIONS,
  timelineLabel: "Timeline",
  urgencyOptions: URGENCY_OPTIONS,
  detailTitle: "Add useful context",
  detailDescription: "Share environment details, deadlines, compliance needs, or anything the team should review first.",
  detailLabel: "Anything else we should know? (optional)",
  detailPlaceholder: "Environment details, compliance needs, current pain points...",
};

const QUESTION_PROFILES: QuestionProfile[] = [
  {
    key: "security",
    matchers: ["security", "threat detection", "endpoint", "protection suite", "hardening"],
    scopeTitle: "Scope the security request",
    scopeDescription: "Confirm the environment, security driver, and timeline so a platform-aware security specialist can follow up.",
    platformLabel: "Security scope",
    platformOptions: [
      "IBM i / AS/400",
      "Microsoft / Azure",
      "Endpoints / users",
      "Network / firewall",
      "Hybrid / multi-platform",
      "Not sure yet",
    ],
    timelineLabel: "Security priority",
    urgencyOptions: [
      { id: "exploring", label: "Security posture review", hint: "Baseline / roadmap" },
      { id: "planning", label: "Audit or hardening deadline", hint: "Compliance / project need" },
      { id: "urgent", label: "Active threat or finding", hint: "Needs fast triage" },
    ],
    detailTitle: "Add security context",
    detailDescription: "Share audit drivers, recent findings, platform exposure, or monitoring gaps the team should review.",
    detailLabel: "Security details (optional)",
    detailPlaceholder: "Audit deadline, current findings, IBM i authorities, endpoint scope, MFA/SIEM tooling, urgent concerns...",
  },
  {
    key: "data-protection",
    matchers: ["backup", "disaster recovery", "high availability", "ransomware", "continuity", "recovery"],
    scopeTitle: "Scope the recovery need",
    scopeDescription: "Confirm the systems to protect, recovery expectations, and timing so ICE can frame the right continuity plan.",
    platformLabel: "Systems to protect",
    platformOptions: [
      "IBM i / AS/400",
      "IBM Power / AIX",
      "VMware",
      "Windows / Linux",
      "Microsoft / Azure",
      "Hybrid / multi-platform",
      "Not sure yet",
    ],
    timelineLabel: "Recovery priority",
    urgencyOptions: [
      { id: "exploring", label: "Review RPO / RTO", hint: "Validate requirements" },
      { id: "planning", label: "Build a DR plan", hint: "Design / budget this quarter" },
      { id: "urgent", label: "Active outage / recovery need", hint: "Escalate quickly" },
    ],
    detailTitle: "Add recovery context",
    detailDescription: "Share current backup or replication methods, critical applications, and target recovery expectations.",
    detailLabel: "Recovery details (optional)",
    detailPlaceholder: "Current backup method, RPO/RTO targets, protected systems, outage scenario, test window, ransomware concern...",
  },
  {
    key: "as400",
    matchers: ["as400", "as 400", "ibm i", "iseries"],
    scopeTitle: "Scope the AS400 / IBM i request",
    scopeDescription: "Confirm whether this is hosting, support, security, backup, HA/DR, or lifecycle planning for your IBM i environment.",
    platformLabel: "IBM platform focus",
    platformOptions: [
      "IBM i / AS/400",
      "IBM Power / AIX",
      "IBM Power VS",
      "Hybrid / multi-platform",
      "Not sure yet",
    ],
    timelineLabel: "IBM i planning need",
    urgencyOptions: [
      { id: "exploring", label: "Modernization review", hint: "Assess options" },
      { id: "planning", label: "Hosting / lifecycle project", hint: "Budget or migration plan" },
      { id: "urgent", label: "Production issue or audit risk", hint: "Needs specialist review" },
    ],
    detailTitle: "Add AS400 / IBM i context",
    detailDescription: "Share platform version, hardware lifecycle, LPAR count, backup posture, or continuity goals.",
    detailLabel: "AS400 / IBM i details (optional)",
    detailPlaceholder: "IBM i release, Power model, LPAR count, current HA/DR tools, backup process, deadline, vendor constraints...",
  },
  {
    key: "cloud",
    matchers: ["managed cloud", "private cloud", "hybrid cloud", "cloud migration", "hosting", "power vs"],
    scopeTitle: "Scope the cloud plan",
    scopeDescription: "Confirm the workload type, hosting target, and planning stage so ICE can route the right cloud architect.",
    platformLabel: "Workload / hosting target",
    platformOptions: [
      "IBM i / AS/400",
      "IBM Power / AIX",
      "VMware",
      "Windows / Linux",
      "Microsoft / Azure",
      "Hybrid / multi-platform",
      "Not sure yet",
    ],
    timelineLabel: "Planning stage",
    urgencyOptions: [
      { id: "exploring", label: "Sizing options", hint: "Early evaluation" },
      { id: "planning", label: "Architecture / quote this quarter", hint: "Design in progress" },
      { id: "urgent", label: "Capacity or hosting issue", hint: "Needs quick review" },
    ],
    detailTitle: "Add cloud context",
    detailDescription: "Share workload mix, hosting requirements, migration constraints, compliance needs, or desired timeline.",
    detailLabel: "Cloud details (optional)",
    detailPlaceholder: "Current location, workload type, storage/compute needs, users, compliance requirements, migration window...",
  },
  {
    key: "managed-services",
    matchers: ["managed microsoft", "automation", "systems management", "managed services"],
    scopeTitle: "Scope the managed services need",
    scopeDescription: "Confirm the operational scope, platform mix, and timing so ICE can identify the right managed services team.",
    platformLabel: "Operations scope",
    platformOptions: [
      "IBM i / AS/400",
      "Microsoft / Azure",
      "Windows / Linux",
      "Hybrid / multi-platform",
      "Not sure yet",
    ],
    timelineLabel: "Support priority",
    urgencyOptions: [
      { id: "exploring", label: "Operational review", hint: "Explore improvements" },
      { id: "planning", label: "Managed support transition", hint: "Project this quarter" },
      { id: "urgent", label: "Coverage gap / escalation", hint: "Needs help soon" },
    ],
    detailTitle: "Add operations context",
    detailDescription: "Share current support coverage, ticket volume, systems under management, and operational gaps.",
    detailLabel: "Managed services details (optional)",
    detailPlaceholder: "Systems covered, current tools, coverage gaps, escalation pain points, automation goals, support timeline...",
  },
];

function getQuestionProfile(service?: string) {
  const normalized = normalizeServiceName(service ?? "");
  if (!normalized) return DEFAULT_QUESTION_PROFILE;

  return (
    QUESTION_PROFILES.find((profile) =>
      profile.matchers.some((matcher) => {
        const normalizedMatcher = normalizeServiceName(matcher);
        return normalized.includes(normalizedMatcher) || normalizedMatcher.includes(normalized);
      }),
    ) ?? DEFAULT_QUESTION_PROFILE
  );
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
    marketingConsent: false,
  });
  const [prefillIntent, setPrefillIntent] = useState<PrefillIntent | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") ?? undefined;
    const requestedService = params.get("service") ?? "";
    const summary = params.get("summary") ?? "";
    const priority = params.get("priority") ?? "";
    const priorityService =
      !requestedService && /migration/i.test(priority)
        ? "Cloud Migration"
        : !requestedService && /(incident|outage|recovery)/i.test(priority)
          ? "Disaster Recovery"
          : "";
    const rawService = requestedService || priorityService;
    const resolvedService = rawService ? findServiceOption(rawService, serviceGroups) : "";
    const displayRequestedService = rawService
      ? normalizeServiceName(resolvedService) !== normalizeServiceName(rawService)
        ? resolvedService
        : formatServiceDisplayName(resolvedService || rawService)
      : "";
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

    if (!source && !requestedService && !summary && !priority && !params.get("workload") && !params.get("timeline")) {
      return;
    }

    setPrefillIntent({
      requestedService: displayRequestedService || undefined,
      service: displayRequestedService || undefined,
      source,
      sourceLabel: labelForSource(source),
      summary: summary || priority || undefined,
    });

    setFormData((current) => ({
      ...current,
      service: displayRequestedService || current.service,
      platform: workloadToPlatform[params.get("workload") ?? ""] || current.platform,
      urgency: timelineToUrgency[params.get("timeline") ?? ""] || current.urgency,
      message: (summary || priority) && !current.message ? summary || `Primary need: ${priority}` : current.message,
    }));
  }, [serviceGroups]);

  const effectiveServiceGroups = useMemo(
    () => ensureServiceOption(serviceGroups, prefillIntent?.service),
    [serviceGroups, prefillIntent?.service],
  );
  const activeProfile = useMemo(
    () => getQuestionProfile(formData.service || prefillIntent?.service || prefillIntent?.requestedService),
    [formData.service, prefillIntent?.requestedService, prefillIntent?.service],
  );
  const activeStepMeta =
    step === 1
      ? { title: activeProfile.scopeTitle, description: activeProfile.scopeDescription }
      : step === 3
        ? { title: activeProfile.detailTitle, description: activeProfile.detailDescription }
        : STEP_META[step];

  const goToStep = (next: Step, source: "manual" | "back") => {
    if (source === "manual") {
      pushEvent("consult_wizard_step", { step, next, source });
    }
    setStep(next);
  };

  const patchForm = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleServiceChange = (value: string) => {
    const nextProfile = getQuestionProfile(value);
    setFormData((prev) => ({
      ...prev,
      service: value,
      platform: prev.platform && nextProfile.platformOptions.includes(prev.platform) ? prev.platform : "",
      urgency:
        prev.urgency && nextProfile.urgencyOptions.some((option) => option.id === prev.urgency)
          ? prev.urgency
          : "",
    }));
  };

  const canContinueStep1 = Boolean(
    formData.service &&
      activeProfile.platformOptions.includes(formData.platform) &&
      activeProfile.urgencyOptions.some((option) => option.id === formData.urgency),
  );
  const hasRequiredPhone = formData.phone.replace(/\D/g, "").length >= 7;
  const canContinueStep2 = Boolean(formData.name.trim() && isValidEmail(formData.email) && hasRequiredPhone);

  const buildMessage = () => {
    const urgencyLabel =
      activeProfile.urgencyOptions.find((o) => o.id === formData.urgency)?.label ?? formData.urgency;
    const lines = [
      formData.message.trim() || null,
      prefillIntent?.requestedService ? `Prefilled service: ${prefillIntent.requestedService}` : null,
      prefillIntent?.source ? `Lead source: ${prefillIntent.source}` : null,
      "Consult wizard",
      `Question profile: ${activeProfile.key}`,
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
        marketingConsent: formData.marketingConsent,
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
            {prefillIntent.service ?? prefillIntent.requestedService}
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
          <h3 className="mt-1 text-xl font-semibold text-primary">{activeStepMeta.title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-tertiary">{activeStepMeta.description}</p>
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
                onChange={handleServiceChange}
                groups={effectiveServiceGroups}
              />

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-secondary">{activeProfile.platformLabel}</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {activeProfile.platformOptions.map((option) => (
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
                <legend className="mb-2 text-sm font-medium text-secondary">{activeProfile.timelineLabel}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {activeProfile.urgencyOptions.map((option) => (
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
                label={activeProfile.detailLabel}
                placeholder={activeProfile.detailPlaceholder}
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
              <Checkbox
                name="marketingConsent"
                size="md"
                aria-label="Email marketing consent"
                isSelected={formData.marketingConsent}
                onChange={(value) => patchForm({ marketingConsent: value })}
                hint="Send me occasional ICE infrastructure guidance, service updates, and event announcements. I can unsubscribe at any time."
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
