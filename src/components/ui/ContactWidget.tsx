"use client";

import { type FormEvent, type HTMLAttributes, useEffect, useId, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, MessageChatCircle, Send01, XClose } from "@untitledui/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Header as AriaHeader, ListBoxSection as AriaListBoxSection } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import { pushEvent } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/*  ICE service catalog (shared by the widget + contact page form)    */
/* ------------------------------------------------------------------ */

export type ServiceGroup = { label: string; options: string[] };

export const GENERAL_INQUIRY = "General Inquiry";

/** The real ICE service catalog, grouped by pillar. */
export const SERVICE_CATALOG: ServiceGroup[] = [
  {
    label: "Managed Cloud Services",
    options: ["Managed Cloud Hosting", "Managed Private Cloud", "Managed Hybrid Cloud", "Cloud Migration"],
  },
  {
    label: "Managed Data Protection",
    options: ["Backup as a Service", "Disaster Recovery", "High Availability", "Ransomware Recovery"],
  },
  {
    label: "Managed Security",
    options: ["IBM i Security", "Protection Suite", "Security Monitoring", "Threat Detection & Response", "Endpoint Security"],
  },
  {
    label: "Managed Services",
    options: ["Managed Microsoft", "Automation Suite", "Systems Management", "IBM Power VS"],
  },
];

/** Default select structure: General Inquiry first, then the full catalog. */
export const DEFAULT_SERVICE_GROUPS: ServiceGroup[] = [
  { label: "", options: [GENERAL_INQUIRY] },
  ...SERVICE_CATALOG,
];

const SERVICE_TO_PILLAR = new Map<string, string>();
for (const group of SERVICE_CATALOG) {
  for (const option of group.options) {
    SERVICE_TO_PILLAR.set(option.toLowerCase(), group.label);
  }
}

/**
 * Group a flat list of service names (e.g. from the CMS `service_options.options`
 * field) into the ICE pillars. Unknown services are kept as ungrouped options so
 * CMS-managed lists keep working. With no list provided, returns the full catalog.
 */
export function groupServiceOptions(options?: unknown): ServiceGroup[] {
  if (!Array.isArray(options) || options.length === 0) return DEFAULT_SERVICE_GROUPS;

  const grouped = new Map<string, string[]>();
  const ungrouped: string[] = [];

  for (const raw of options) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const option = raw.trim();
    // General Inquiry is always injected at the top — skip duplicates from CMS.
    if (option.toLowerCase() === GENERAL_INQUIRY.toLowerCase()) continue;
    const pillar = SERVICE_TO_PILLAR.get(option.toLowerCase());
    if (pillar) {
      const list = grouped.get(pillar) ?? [];
      list.push(option);
      grouped.set(pillar, list);
    } else {
      ungrouped.push(option);
    }
  }

  const result: ServiceGroup[] = [{ label: "", options: [GENERAL_INQUIRY] }];
  for (const group of SERVICE_CATALOG) {
    const list = grouped.get(group.label);
    if (list?.length) result.push({ label: group.label, options: list });
  }
  if (ungrouped.length) result.push({ label: "", options: ungrouped });

  return result;
}

/* ------------------------------------------------------------------ */
/*  Grouped service select (Untitled UI Select, react-aria based)     */
/* ------------------------------------------------------------------ */

interface ServiceSelectProps {
  label?: string;
  placeholder?: string;
  size?: "sm" | "md";
  name?: string;
  value: string;
  onChange: (value: string) => void;
  groups?: ServiceGroup[];
}

/** Sectioned service dropdown built on the Untitled UI Select (react-aria). */
export function ServiceSelect({
  label = "Service Interested In",
  placeholder = "Select a service...",
  size = "md",
  name,
  value,
  onChange,
  groups = DEFAULT_SERVICE_GROUPS,
}: ServiceSelectProps) {
  return (
    <Select
      name={name}
      label={label}
      size={size}
      placeholder={placeholder}
      selectedKey={value === "" ? null : value}
      onSelectionChange={(key) => onChange(key == null ? "" : String(key))}
      className="w-full"
    >
      {groups.map((group, index) =>
        group.label ? (
          <AriaListBoxSection
            key={group.label}
            id={group.label}
            className={cx("pb-0.5", index > 0 && "mt-1 border-t border-secondary pt-1")}
          >
            <AriaHeader className="px-3.5 pt-1.5 pb-0.5 text-xs font-medium tracking-[0.2em] text-quaternary uppercase">
              {group.label}
            </AriaHeader>
            {group.options.map((option) => (
              <Select.Item key={option} id={option} label={option} />
            ))}
          </AriaListBoxSection>
        ) : (
          group.options.map((option, optionIndex) => (
            <Select.Item
              key={`${index}-${option}`}
              id={option}
              label={option}
              className={cx(index > 0 && optionIndex === 0 && "mt-1 border-t border-secondary pt-1")}
            />
          ))
        ),
      )}
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/*  Phone field with country dial-code selector                       */
/* ------------------------------------------------------------------ */

export type Country = { code: string; name: string; dial: string; flag: string };

/**
 * Format a US/CA national number as the user types: (561) 555-0100.
 * Other countries get light digit grouping.
 */
function formatNationalNumber(raw: string, countryCode: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  if (countryCode === "US" || countryCode === "CA") {
    const d = digits.slice(0, 10);
    if (d.length === 0) return "";
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return digits.replace(/(\d{3,4})(?=\d)/g, "$1 ").trim();
}

/** Common countries for the dial-code selector (US pinned first). */
export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "CZ", name: "Czechia", dial: "+420", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { code: "DO", name: "Dominican Republic", dial: "+1", flag: "🇩🇴" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", dial: "+36", flag: "🇭🇺" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "JM", name: "Jamaica", dial: "+1", flag: "🇯🇲" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "PA", name: "Panama", dial: "+507", flag: "🇵🇦" },
  { code: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "RO", name: "Romania", dial: "+40", flag: "🇷🇴" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", dial: "+886", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "TR", name: "Türkiye", dial: "+90", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", dial: "+380", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
];

/** Flag image URL (Untitled UI CDN) — emoji flags render as "US"/"CA" text on Windows. */
function countryFlagSrc(code: string) {
  return `https://www.untitledui.com/images/flags/${code}.svg`;
}

/** Dropdown items: flag image + dial code (keyed by country code). */
const COUNTRY_ITEMS: SelectItemType[] = COUNTRIES.map((country) => ({
  id: country.code,
  label: country.dial,
  icon: (props: HTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      src={countryFlagSrc(country.code)}
      alt=""
      aria-hidden="true"
      className="size-5 max-w-none rounded-full object-cover"
    />
  ),
}));

/** Resolve the visitor's country from browser locale; falls back to US. */
export function detectDefaultCountry(): string {
  try {
    const candidates: string[] = [];
    if (typeof navigator !== "undefined") {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
    }
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved) candidates.push(resolved);

    for (const tag of candidates) {
      try {
        const region = new Intl.Locale(tag).maximize().region;
        if (region && COUNTRIES.some((c) => c.code === region)) return region;
      } catch {
        // Ignore malformed locale tags
      }
    }
  } catch {
    // Intl unavailable — fall through
  }
  return "US";
}

interface PhoneFieldProps {
  label?: string;
  placeholder?: string;
  size?: "sm" | "md";
  isRequired?: boolean;
  /** Composed full value, e.g. "+1 (561) 555-0100". Used to reset the field when cleared. */
  value: string;
  /** Called with the composed full number (dial code + national number) or "" when empty. */
  onChange: (value: string) => void;
}

/**
 * Phone input: a compact Untitled UI Select with country flag + dial code
 * next to a full-width tel input. Defaults the country from the visitor's
 * locale and submits the full number with dial code (e.g. "+1 (561) 555-0100").
 */
export function PhoneField({
  label = "Phone number",
  placeholder = "(561) 555-0100",
  size = "md",
  isRequired,
  value,
  onChange,
}: PhoneFieldProps) {
  const id = useId();
  const inputId = `phone-field-${id}`;
  const [countryCode, setCountryCode] = useState("US");
  const [national, setNational] = useState("");

  // Default the dial code from the visitor's locale (client-only).
  useEffect(() => {
    setCountryCode(detectDefaultCountry());
  }, []);

  // When the parent form resets (value cleared after submit), clear the input.
  useEffect(() => {
    if (!value) setNational("");
  }, [value]);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  const emit = (dial: string, nationalNumber: string) => {
    const trimmed = nationalNumber.trim();
    onChange(trimmed ? `${dial} ${trimmed}` : "");
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={inputId} isRequired={isRequired}>
        {label}
      </Label>
      <div className="flex w-full items-stretch gap-3">
        {/* Country dial-code selector */}
        <Select
          aria-label="Country dial code"
          size={size}
          className="w-[7.5rem] shrink-0 sm:w-32"
          popoverClassName="w-max min-w-[16rem]"
          selectedKey={country.code}
          onSelectionChange={(key) => {
            const next = COUNTRIES.find((c) => c.code === key) ?? COUNTRIES[0];
            setCountryCode(next.code);
            const reformatted = formatNationalNumber(national, next.code);
            setNational(reformatted);
            emit(next.dial, reformatted);
          }}
          items={COUNTRY_ITEMS}
        >
          {(item) => {
            const meta = COUNTRIES.find((c) => c.code === item.id);
            return (
              <Select.Item
                id={item.id}
                label={item.label}
                supportingText={meta?.name}
                icon={item.icon}
                // Keep trigger compact (flag + dial only); name still shows in the list.
                value={{ id: item.id, label: item.label, icon: item.icon }}
                textValue={`${meta?.name ?? item.id} ${item.label}`}
              />
            );
          }}
        </Select>

        {/* National number */}
        <Input
          id={inputId}
          aria-label={label}
          size={size}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          isRequired={isRequired}
          placeholder={placeholder}
          value={national}
          onChange={(next) => {
            const formatted = formatNationalNumber(next, country.code);
            setNational(formatted);
            emit(country.dial, formatted);
          }}
          className="min-w-0 flex-1"
          wrapperClassName="w-full"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form state                                                        */
/* ------------------------------------------------------------------ */

type ContactFormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  smsConsent: boolean;
};

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: "",
  message: "",
  smsConsent: false,
};

/* ------------------------------------------------------------------ */
/*  Floating Contact Widget                                           */
/* ------------------------------------------------------------------ */

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);

  /* ── Welcome bubble logic (first visit only, persists until interaction) */

  useEffect(() => {
    try {
      const seen = localStorage.getItem("ice-widget-seen");
      if (!seen) {
        setShowWelcome(true);
      }
    } catch {
      // localStorage unavailable — silently skip
    }
  }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      localStorage.setItem("ice-widget-seen", "true");
    } catch {
      // localStorage unavailable
    }
  }

  /* ── Form helpers ───────────────────────────────────────────────── */

  function setField<K extends keyof ContactFormState>(name: K, value: ContactFormState[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      pushEvent("contact_submitted", { form: "widget", service: form.service });
      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleToggle() {
    if (showWelcome) dismissWelcome();
    setIsOpen((prev) => !prev);
    if (!isOpen && (status === "success" || status === "error")) {
      setStatus("idle");
      setErrorMessage("");
    }
  }

  /* ── Motion presets (respect reduced motion) ────────────────────── */

  const panelMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 20, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.96 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  const bubbleMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.9 },
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
      };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div data-contact-widget className="fixed right-6 bottom-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {/* ── Contact Panel ────────────────────────────────────────── */}
        {isOpen && (
          <motion.div
            key="contact-panel"
            {...panelMotion}
            className="mb-4 w-95 max-w-[calc(100vw-3rem)] origin-bottom-right overflow-hidden rounded-2xl bg-primary/90 shadow-xl ring-1 ring-secondary backdrop-blur-xl dark:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-5 pt-5">
              <div>
                <h3 className="text-lg font-semibold text-primary">Send Us a Message</h3>
                <p className="mt-1 text-sm text-tertiary">We&apos;ll get back to you within 2-3 business days.</p>
              </div>
              <CloseButton size="sm" label="Close contact form" onPress={() => setIsOpen(false)} className="-mt-1.5 -mr-1.5" />
            </div>

            {/* Brand hairline */}
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto px-5 pt-4 pb-5">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  /* ── Success state ─────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <FeaturedIcon icon={CheckCircle} color="success" theme="modern" size="lg" className="mb-4" />
                    <p className="text-md font-semibold text-primary">Message Sent</p>
                    <p className="mt-1 text-sm text-tertiary">Thank you for reaching out. We&apos;ll be in touch soon.</p>
                    <Button
                      color="link-color"
                      size="sm"
                      className="mt-5"
                      onPress={() => {
                        setStatus("idle");
                        setIsOpen(false);
                      }}
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  /* ── Form ──────────────────────────────────────── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3.5"
                  >
                    {/* Name & Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        size="sm"
                        label="Name"
                        placeholder="John Smith"
                        isRequired
                        validationBehavior="native"
                        value={form.name}
                        onChange={(value) => setField("name", value)}
                      />
                      <Input
                        size="sm"
                        type="email"
                        label="Email"
                        placeholder="john@company.com"
                        isRequired
                        validationBehavior="native"
                        value={form.email}
                        onChange={(value) => setField("email", value)}
                      />
                    </div>

                    {/* Company */}
                    <Input size="sm" label="Company" placeholder="Acme Corp" value={form.company} onChange={(value) => setField("company", value)} />

                    {/* Phone with country code */}
                    <PhoneField size="sm" label="Phone number" value={form.phone} onChange={(value) => setField("phone", value)} />

                    {/* Service */}
                    <ServiceSelect size="sm" label="Service Interested In" value={form.service} onChange={(value) => setField("service", value)} />

                    {/* Message */}
                    <TextArea
                      size="sm"
                      rows={3}
                      label="Message"
                      placeholder="How can we help?"
                      isRequired
                      validationBehavior="native"
                      value={form.message}
                      onChange={(value) => setField("message", value)}
                      textAreaClassName="resize-none"
                    />

                    {/* SMS Consent */}
                    <Checkbox
                      size="sm"
                      aria-label="SMS consent"
                      isSelected={form.smsConsent}
                      onChange={(isSelected) => setField("smsConsent", isSelected)}
                      hint={
                        <>
                          I consent to receive SMS text messages from ICE. Message and data rates may apply. Reply STOP to opt out. See our{" "}
                          <Link href="/sms-consent" className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover">
                            SMS Consent Policy
                          </Link>
                          .
                        </>
                      }
                    />

                    {/* Error message */}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-2 rounded-lg p-3 ring-1 ring-error_subtle ring-inset"
                      >
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-fg-error-secondary" />
                        <p className="text-sm text-error-primary">{errorMessage}</p>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="md"
                      color="primary"
                      className="w-full"
                      iconLeading={Send01}
                      isLoading={status === "sending"}
                      showTextWhileLoading
                      isDisabled={status === "sending"}
                    >
                      {status === "sending" ? "Sending..." : "Send Message"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Welcome Bubble (first visit, persists until interaction) */}
        {showWelcome && !isOpen && (
          <motion.div
            key="welcome-bubble"
            {...bubbleMotion}
            onClick={() => {
              dismissWelcome();
              setIsOpen(true);
            }}
            className="relative mb-3 max-w-65 cursor-pointer rounded-xl bg-primary/90 px-4 py-3 shadow-lg ring-1 ring-secondary backdrop-blur-xl"
          >
            <p className="text-sm font-medium text-primary">Need help? Schedule a free consultation!</p>
            <p className="mt-1 text-xs text-tertiary">Click to get started</p>
            {/* Small arrow pointing down */}
            <div className="absolute right-6 -bottom-1.5 size-3 rotate-45 border-r border-b border-secondary bg-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button (always visible) ─────────────── */}
      <Button
        color="primary"
        size="lg"
        onPress={handleToggle}
        aria-label={isOpen ? "Close contact form" : "Open contact form"}
        className="size-14 rounded-full shadow-lg before:rounded-full dark:shadow-[0_0_40px_rgb(4_155_251/0.25)]"
        iconLeading={
          isOpen ? (
            <XClose aria-hidden="true" className="size-6 shrink-0 transition-inherit-all" />
          ) : (
            <MessageChatCircle aria-hidden="true" className="size-6 shrink-0 transition-inherit-all" />
          )
        }
      />
    </div>
  );
}
