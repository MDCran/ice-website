"use client";

import { type FormEvent, type HTMLAttributes, useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    options: ["AS400", "Managed Microsoft", "Automation Suite", "Systems Management", "IBM Power VS"],
  },
];

/** Default select structure: General Inquiry first, then the full catalog. */
export const DEFAULT_SERVICE_GROUPS: ServiceGroup[] = [
  { label: "", options: [GENERAL_INQUIRY] },
  ...SERVICE_CATALOG,
];

/** CMS-editable copy and service choices for the floating contact widget. */
export interface ContactWidgetContent {
  panel_heading?: string;
  panel_description?: string;
  success_heading?: string;
  success_message?: string;
  success_close_label?: string;
  name_label?: string;
  name_placeholder?: string;
  email_label?: string;
  email_placeholder?: string;
  company_label?: string;
  company_placeholder?: string;
  phone_label?: string;
  phone_placeholder?: string;
  country_dial_code_aria_label?: string;
  service_label?: string;
  service_placeholder?: string;
  message_label?: string;
  message_placeholder?: string;
  sms_consent_aria_label?: string;
  sms_consent_prefix?: string;
  sms_consent_link_label?: string;
  sms_consent_link_href?: string;
  sms_consent_suffix?: string;
  marketing_consent_aria_label?: string;
  marketing_consent_hint?: string;
  phone_required_error?: string;
  generic_error?: string;
  sending_label?: string;
  submit_label?: string;
  welcome_heading?: string;
  welcome_description?: string;
  welcome_aria_label?: string;
  open_form_aria_label?: string;
  close_form_aria_label?: string;
  /** Preferred CMS shape when group headings and option order are editorial. */
  service_groups?: ServiceGroup[];
  /** Optional flat alternative; recognized ICE services are grouped automatically. */
  service_options?: string[];
}

type ResolvedContactWidgetContent = Required<Omit<ContactWidgetContent, "service_groups" | "service_options">> & {
  service_groups: ServiceGroup[];
};

const DEFAULT_CONTACT_WIDGET_CONTENT: ResolvedContactWidgetContent = {
  panel_heading: "Send Us a Message",
  panel_description: "We'll get back to you within 2-3 business days.",
  success_heading: "Message Sent",
  success_message: "Thank you for reaching out. We'll be in touch soon.",
  success_close_label: "Close",
  name_label: "Name",
  name_placeholder: "John Smith",
  email_label: "Email",
  email_placeholder: "john@company.com",
  company_label: "Company",
  company_placeholder: "Acme Corp",
  phone_label: "Phone number",
  phone_placeholder: "(561) 555-0100",
  country_dial_code_aria_label: "Country dial code",
  service_label: "Service Interested In",
  service_placeholder: "Select a service...",
  message_label: "Message",
  message_placeholder: "How can we help?",
  sms_consent_aria_label: "SMS consent",
  sms_consent_prefix:
    "I consent to receive SMS text messages from ICE. Message and data rates may apply. Reply STOP to opt out. See our ",
  sms_consent_link_label: "SMS Consent Policy",
  sms_consent_link_href: "/sms-consent",
  sms_consent_suffix: ".",
  marketing_consent_aria_label: "Email marketing consent",
  marketing_consent_hint:
    "Send me occasional ICE infrastructure guidance and service updates. I can unsubscribe at any time.",
  phone_required_error: "Phone number is required.",
  generic_error: "Something went wrong. Please try again.",
  sending_label: "Sending...",
  submit_label: "Send Message",
  welcome_heading: "Need help? Schedule a free consultation!",
  welcome_description: "Click to get started",
  welcome_aria_label: "Need help? Schedule a free consultation. Open contact form",
  open_form_aria_label: "Open contact form",
  close_form_aria_label: "Close contact form",
  service_groups: DEFAULT_SERVICE_GROUPS,
};

function cloneServiceGroups(groups: ServiceGroup[]): ServiceGroup[] {
  return groups.map((group) => ({ label: group.label, options: [...group.options] }));
}

/** Fresh defaults for CMS templates without sharing mutable option arrays. */
export function getDefaultContactWidgetContent(): ContactWidgetContent {
  return {
    ...DEFAULT_CONTACT_WIDGET_CONTENT,
    service_groups: cloneServiceGroups(DEFAULT_CONTACT_WIDGET_CONTENT.service_groups),
  };
}

const SERVICE_TO_PILLAR = new Map<string, string>();
for (const group of SERVICE_CATALOG) {
  for (const option of group.options) {
    SERVICE_TO_PILLAR.set(option.toLowerCase(), group.label);
  }
}

/**
 * Group a flat list of service names (e.g. from the CMS `service_options.options`
 * field) into the ICE pillars. Unknown services are kept as ungrouped options so
 * CMS-managed lists keep working. With no list provided, returns the full catalog;
 * an explicit empty list stays empty so editors can intentionally remove choices.
 */
export function groupServiceOptions(options?: unknown): ServiceGroup[] {
  if (!Array.isArray(options)) return cloneServiceGroups(DEFAULT_SERVICE_GROUPS);
  if (options.length === 0) return [];

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

function normalizeServiceGroups(value: unknown): ServiceGroup[] {
  if (!Array.isArray(value)) return cloneServiceGroups(DEFAULT_SERVICE_GROUPS);

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const raw = candidate as { label?: unknown; options?: unknown };
    if (!Array.isArray(raw.options)) return [];

    const options = raw.options.filter((option): option is string => typeof option === "string" && option.trim().length > 0);
    return [{ label: typeof raw.label === "string" ? raw.label : "", options }];
  });
}

function isSafeCmsHref(value: string) {
  return (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value);
}

function resolveContactWidgetContent(content?: ContactWidgetContent): ResolvedContactWidgetContent {
  const resolved: ResolvedContactWidgetContent = {
    ...DEFAULT_CONTACT_WIDGET_CONTENT,
    service_groups: cloneServiceGroups(DEFAULT_CONTACT_WIDGET_CONTENT.service_groups),
  };
  if (!content || typeof content !== "object") return resolved;

  const source = content as Record<string, unknown>;
  const writable = resolved as unknown as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_CONTACT_WIDGET_CONTENT)) {
    if (key === "service_groups") continue;
    if (typeof source[key] === "string") writable[key] = source[key];
  }

  if (!isSafeCmsHref(resolved.sms_consent_link_href)) {
    resolved.sms_consent_link_href = DEFAULT_CONTACT_WIDGET_CONTENT.sms_consent_link_href;
  }

  if (Object.prototype.hasOwnProperty.call(content, "service_groups")) {
    resolved.service_groups = normalizeServiceGroups(content.service_groups);
  } else if (Object.prototype.hasOwnProperty.call(content, "service_options")) {
    resolved.service_groups = groupServiceOptions(content.service_options);
  }

  return resolved;
}

function accessibleLabel(value: string, fallback: string) {
  return value.trim() || fallback;
}

/* ------------------------------------------------------------------ */
/*  Grouped service select (Untitled UI Select, react-aria based)     */
/* ------------------------------------------------------------------ */

interface ServiceSelectProps {
  label?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
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
      popoverClassName="contact-form-popover overscroll-contain"
      preventPageScroll
      openOnLabelClick
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
  countryDialCodeAriaLabel?: string;
  size?: "sm" | "md";
  isRequired?: boolean;
  wrapperClassName?: string;
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
  countryDialCodeAriaLabel = "Country dial code",
  size = "md",
  isRequired,
  wrapperClassName,
  value,
  onChange,
}: PhoneFieldProps) {
  const id = useId();
  const inputId = `phone-field-${id}`;
  const detectedCountryCode = useSyncExternalStore(
    () => () => undefined,
    detectDefaultCountry,
    () => "US",
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [national, setNational] = useState("");

  const countryCode = selectedCountryCode ?? detectedCountryCode;
  // The parent owns the submitted value. Deriving an empty display from that value
  // resets the field after submit without synchronously mirroring props in an effect.
  const displayedNational = value ? national : "";

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  const emit = (dial: string, nationalNumber: string) => {
    const trimmed = nationalNumber.trim();
    onChange(trimmed ? `${dial} ${trimmed}` : "");
  };

  return (
    <div className={cx("flex w-full flex-col gap-1.5", wrapperClassName)}>
      <Label htmlFor={inputId} isRequired={isRequired}>
        {label}
      </Label>
      <div className="flex w-full items-stretch gap-3">
        {/* Country dial-code selector */}
        <Select
          aria-label={countryDialCodeAriaLabel}
          size={size}
          className="w-[7.5rem] shrink-0 sm:w-32"
          popoverClassName="contact-form-popover w-max min-w-[16rem] overscroll-contain"
          preventPageScroll
          selectedKey={country.code}
          onSelectionChange={(key) => {
            const next = COUNTRIES.find((c) => c.code === key) ?? COUNTRIES[0];
            setSelectedCountryCode(next.code);
            const reformatted = formatNationalNumber(displayedNational, next.code);
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
          value={displayedNational}
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
  marketingConsent: boolean;
};

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: "",
  message: "",
  smsConsent: false,
  marketingConsent: false,
};

const WELCOME_BUBBLE_DELAY_MS = 30000;

function hasRequiredPhone(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

/* ------------------------------------------------------------------ */
/*  Floating Contact Widget                                           */
/* ------------------------------------------------------------------ */

export default function ContactWidget({ content }: { content?: ContactWidgetContent }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const widget = useMemo(() => resolveContactWidgetContent(content), [content]);

  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);

  const onContactPage = pathname === "/contact" || pathname?.startsWith("/contact/");
  const suppressWelcomeBubble = onContactPage || pathname === "/solutions/find";

  /* ── Collapse when landing on the contact page (form already on-page) ── */
  useEffect(() => {
    if (!onContactPage) return;
    setIsOpen(false);
    setShowWelcome(false);
  }, [onContactPage]);

  /* ── Welcome bubble logic (first visit only, persists until interaction) */

  useEffect(() => {
    if (suppressWelcomeBubble) {
      setShowWelcome(false);
      return;
    }
    let timer: number | undefined;
    try {
      const seen = localStorage.getItem("ice-widget-seen");
      if (!seen) {
        timer = window.setTimeout(() => setShowWelcome(true), WELCOME_BUBBLE_DELAY_MS);
      }
    } catch {
      // localStorage unavailable — silently skip
    }
    return () => {
      if (timer != null) window.clearTimeout(timer);
    };
  }, [suppressWelcomeBubble]);

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      localStorage.setItem("ice-widget-seen", "true");
    } catch {
      // localStorage unavailable
    }
  }

  function openFromWelcome() {
    dismissWelcome();
    setIsOpen(true);
  }

  /* ── Form helpers ───────────────────────────────────────────────── */

  function setField<K extends keyof ContactFormState>(name: K, value: ContactFormState[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasRequiredPhone(form.phone)) {
      setStatus("error");
      setErrorMessage(widget.phone_required_error);
      return;
    }
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
        throw new Error(data?.error || widget.generic_error);
      }

      pushEvent("contact_submitted", { form: "widget", service: form.service });
      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : widget.generic_error);
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
            role="dialog"
            aria-label={accessibleLabel(widget.panel_heading, DEFAULT_CONTACT_WIDGET_CONTENT.panel_heading)}
            className="mb-4 w-95 max-w-[calc(100vw-3rem)] origin-bottom-right overflow-hidden rounded-2xl bg-primary/90 shadow-xl ring-1 ring-secondary backdrop-blur-xl dark:shadow-[0_0_40px_rgb(4_155_251/0.15)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-5 pt-5">
              <div>
                <h3 className="text-lg font-semibold text-primary">{widget.panel_heading}</h3>
                <p className="mt-1 text-sm text-tertiary">{widget.panel_description}</p>
              </div>
              <CloseButton
                size="sm"
                label={accessibleLabel(widget.close_form_aria_label, DEFAULT_CONTACT_WIDGET_CONTENT.close_form_aria_label)}
                onPress={() => setIsOpen(false)}
                className="-mt-1.5 -mr-1.5"
              />
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
                    <p className="text-md font-semibold text-primary">{widget.success_heading}</p>
                    <p className="mt-1 text-sm text-tertiary">{widget.success_message}</p>
                    <Button
                      color="link-color"
                      size="sm"
                      className="mt-5"
                      onPress={() => {
                        setStatus("idle");
                        setIsOpen(false);
                      }}
                    >
                      {accessibleLabel(widget.success_close_label, DEFAULT_CONTACT_WIDGET_CONTENT.success_close_label)}
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
                        label={accessibleLabel(widget.name_label, DEFAULT_CONTACT_WIDGET_CONTENT.name_label)}
                        placeholder={widget.name_placeholder}
                        isRequired
                        validationBehavior="native"
                        value={form.name}
                        onChange={(value) => setField("name", value)}
                      />
                      <Input
                        size="sm"
                        type="email"
                        label={accessibleLabel(widget.email_label, DEFAULT_CONTACT_WIDGET_CONTENT.email_label)}
                        placeholder={widget.email_placeholder}
                        isRequired
                        validationBehavior="native"
                        value={form.email}
                        onChange={(value) => setField("email", value)}
                      />
                    </div>

                    {/* Company */}
                    <Input
                      size="sm"
                      label={accessibleLabel(widget.company_label, DEFAULT_CONTACT_WIDGET_CONTENT.company_label)}
                      placeholder={widget.company_placeholder}
                      value={form.company}
                      onChange={(value) => setField("company", value)}
                    />

                    {/* Phone with country code */}
                    <PhoneField
                      isRequired
                      size="sm"
                      label={accessibleLabel(widget.phone_label, DEFAULT_CONTACT_WIDGET_CONTENT.phone_label)}
                      placeholder={widget.phone_placeholder}
                      countryDialCodeAriaLabel={accessibleLabel(
                        widget.country_dial_code_aria_label,
                        DEFAULT_CONTACT_WIDGET_CONTENT.country_dial_code_aria_label,
                      )}
                      value={form.phone}
                      onChange={(value) => setField("phone", value)}
                    />

                    {/* Service */}
                    <ServiceSelect
                      size="sm"
                      label={accessibleLabel(widget.service_label, DEFAULT_CONTACT_WIDGET_CONTENT.service_label)}
                      placeholder={widget.service_placeholder}
                      value={form.service}
                      onChange={(value) => setField("service", value)}
                      groups={widget.service_groups}
                    />

                    {/* Message */}
                    <TextArea
                      size="sm"
                      rows={3}
                      label={accessibleLabel(widget.message_label, DEFAULT_CONTACT_WIDGET_CONTENT.message_label)}
                      placeholder={widget.message_placeholder}
                      isRequired
                      validationBehavior="native"
                      value={form.message}
                      onChange={(value) => setField("message", value)}
                      textAreaClassName="resize-none"
                    />

                    {/* SMS Consent */}
                    <Checkbox
                      size="sm"
                      aria-label={accessibleLabel(
                        widget.sms_consent_aria_label,
                        DEFAULT_CONTACT_WIDGET_CONTENT.sms_consent_aria_label,
                      )}
                      isSelected={form.smsConsent}
                      onChange={(isSelected) => setField("smsConsent", isSelected)}
                      hint={
                        <>
                          {widget.sms_consent_prefix}
                          <Link
                            href={widget.sms_consent_link_href}
                            className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
                          >
                            {accessibleLabel(
                              widget.sms_consent_link_label,
                              DEFAULT_CONTACT_WIDGET_CONTENT.sms_consent_link_label,
                            )}
                          </Link>
                          {widget.sms_consent_suffix}
                        </>
                      }
                    />

                    <Checkbox
                      size="sm"
                      aria-label={accessibleLabel(
                        widget.marketing_consent_aria_label,
                        DEFAULT_CONTACT_WIDGET_CONTENT.marketing_consent_aria_label,
                      )}
                      isSelected={form.marketingConsent}
                      onChange={(isSelected) => setField("marketingConsent", isSelected)}
                      hint={widget.marketing_consent_hint}
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
                      {status === "sending"
                        ? accessibleLabel(widget.sending_label, DEFAULT_CONTACT_WIDGET_CONTENT.sending_label)
                        : accessibleLabel(widget.submit_label, DEFAULT_CONTACT_WIDGET_CONTENT.submit_label)}
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
            role="button"
            tabIndex={0}
            aria-label={accessibleLabel(widget.welcome_aria_label, DEFAULT_CONTACT_WIDGET_CONTENT.welcome_aria_label)}
            onClick={openFromWelcome}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              openFromWelcome();
            }}
            className="relative mb-3 max-w-65 cursor-pointer rounded-xl bg-primary px-4 py-3 shadow-lg ring-1 ring-secondary"
          >
            <p className="text-sm font-medium text-primary">{widget.welcome_heading}</p>
            <p className="mt-1 text-xs text-tertiary">{widget.welcome_description}</p>
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
        aria-label={
          isOpen
            ? accessibleLabel(widget.close_form_aria_label, DEFAULT_CONTACT_WIDGET_CONTENT.close_form_aria_label)
            : accessibleLabel(widget.open_form_aria_label, DEFAULT_CONTACT_WIDGET_CONTENT.open_form_aria_label)
        }
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
