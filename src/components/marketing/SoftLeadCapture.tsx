"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";

const STORAGE_KEY = "ice-soft-lead-dismissed";
const SOFT_LEAD_IDLE_DELAY_MS = 90000;
const SOFT_LEAD_EXIT_DELAY_MS = 45000;
const SOFT_LEAD_MIN_SCROLL_RATIO = 0.35;

export interface SoftLeadCaptureContent {
  headline?: string;
  description?: string;
  image_src?: string;
  image_alt?: string;
  dismiss_aria_label?: string;
  close_aria_label?: string;
  name_label?: string;
  name_placeholder?: string;
  email_label?: string;
  email_placeholder?: string;
  phone_label?: string;
  phone_placeholder?: string;
  company_label?: string;
  company_placeholder?: string;
  marketing_consent_aria_label?: string;
  marketing_consent_text?: string;
  sending_label?: string;
  submit_label?: string;
  phone_error?: string;
  submit_error?: string;
  generic_error?: string;
  success_heading?: string;
  success_description?: string;
  success_close_label?: string;
  lead_service?: string;
  lead_message?: string;
  lead_form_key?: string;
  lead_source?: string;
  analytics_form?: string;
}

type ResolvedSoftLeadCaptureContent = Required<SoftLeadCaptureContent>;

const DEFAULT_SOFT_LEAD_CAPTURE_CONTENT: ResolvedSoftLeadCaptureContent = {
  headline: "Want a free infrastructure assessment?",
  description: "Share your name, work email, and phone — an ICE specialist will follow up with next steps.",
  image_src: "/images/marketing/executive-infrastructure-assessment.webp",
  image_alt: "",
  dismiss_aria_label: "Dismiss assessment request",
  close_aria_label: "Close assessment request",
  name_label: "Name",
  name_placeholder: "",
  email_label: "Work email",
  email_placeholder: "",
  phone_label: "Phone",
  phone_placeholder: "(561) 555-0100",
  company_label: "Company",
  company_placeholder: "",
  marketing_consent_aria_label: "Email marketing consent",
  marketing_consent_text: "Send me occasional ICE infrastructure guidance and service updates. I can unsubscribe at any time.",
  sending_label: "Sending…",
  submit_label: "Request assessment",
  phone_error: "Please enter a valid 10-digit phone number.",
  submit_error: "Unable to submit. Please try again.",
  generic_error: "Something went wrong.",
  success_heading: "Thanks — we got it.",
  success_description: "An ICE specialist will follow up shortly.",
  success_close_label: "Close",
  lead_service: "Free Assessment",
  lead_message: "Soft lead capture — requested a free infrastructure assessment.",
  lead_form_key: "soft_lead",
  lead_source: "soft_lead_capture",
  analytics_form: "soft_lead",
};

export function getDefaultSoftLeadCaptureContent(): ResolvedSoftLeadCaptureContent {
  return { ...DEFAULT_SOFT_LEAD_CAPTURE_CONTENT };
}

function resolveText(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function resolveContent(content?: SoftLeadCaptureContent): ResolvedSoftLeadCaptureContent {
  return Object.fromEntries(
    Object.entries(DEFAULT_SOFT_LEAD_CAPTURE_CONTENT).map(([key, fallback]) => [
      key,
      resolveText(content?.[key as keyof SoftLeadCaptureContent], fallback),
    ]),
  ) as ResolvedSoftLeadCaptureContent;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Soft exit-intent / idle lead capture (#24).
 * Shows once per session after meaningful engagement, not during the hero.
 */
export default function SoftLeadCapture({
  enabled = true,
  headline,
  description,
  content,
}: {
  enabled?: boolean;
  headline?: string;
  description?: string;
  content?: SoftLeadCaptureContent;
}) {
  const pathname = usePathname();
  const resolvedContent = resolveContent(content);
  const resolvedHeadline = headline ?? resolvedContent.headline;
  const resolvedDescription = description ?? resolvedContent.description;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const suppressed =
    !enabled ||
    pathname === "/contact" ||
    pathname?.startsWith("/solutions/find") ||
    pathname === "/subscribe" ||
    pathname?.startsWith("/unsubscribe/") ||
    pathname === "/sms-consent" ||
    pathname === "/terms-of-service";

  useEffect(() => {
    if (suppressed || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    let shown = false;
    let timeReady = false;
    let exitReady = false;
    let scrollReady = false;
    const show = () => {
      if (shown || !scrollReady) return;
      shown = true;
      setOpen(true);
      pushEvent("soft_lead_shown", {});
    };

    const updateScrollReadiness = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll <= 0 ? 1 : window.scrollY / maxScroll;
      scrollReady = ratio >= SOFT_LEAD_MIN_SCROLL_RATIO;
      if (timeReady) show();
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && exitReady) show();
    };

    const idleTimer = window.setTimeout(() => {
      timeReady = true;
      show();
    }, SOFT_LEAD_IDLE_DELAY_MS);
    const exitTimer = window.setTimeout(() => {
      exitReady = true;
    }, SOFT_LEAD_EXIT_DELAY_MS);

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", updateScrollReadiness, { passive: true });
    updateScrollReadiness();

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", updateScrollReadiness);
      window.clearTimeout(idleTimer);
      window.clearTimeout(exitTimer);
    };
  }, [suppressed]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    pushEvent("soft_lead_dismissed", {});
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setStatus("error");
      setErrorMsg(resolvedContent.phone_error);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          service: resolvedContent.lead_service,
          message: resolvedContent.lead_message,
          smsConsent: false,
          marketingConsent,
          formKey: resolvedContent.lead_form_key,
          source: resolvedContent.lead_source,
          pagePath: pathname,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(resolvedContent.submit_error);
        return;
      }
      pushEvent("contact_submitted", {
        form: resolvedContent.analytics_form,
        service: resolvedContent.lead_service,
      });
      setStatus("success");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    } catch {
      setStatus("error");
      setErrorMsg(resolvedContent.generic_error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={resolvedContent.dismiss_aria_label}
        className="absolute inset-0 bg-overlay/50 backdrop-blur-[2px]"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="soft-lead-title"
        aria-describedby="soft-lead-description"
        className={cx(
          "relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl bg-primary shadow-2xl ring-1 ring-secondary sm:max-h-[calc(100dvh-3rem)]",
          resolvedContent.image_src && "sm:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 rounded-md bg-primary/85 p-1.5 text-fg-quaternary shadow-xs ring-1 ring-secondary backdrop-blur-sm hover:bg-secondary hover:text-fg-secondary"
          aria-label={resolvedContent.close_aria_label}
        >
          <XClose className="size-4" />
        </button>

        {resolvedContent.image_src && (
          <div className="relative h-32 overflow-hidden sm:h-auto sm:min-h-[28rem]">
            <Image
              fill
              src={resolvedContent.image_src}
              alt={resolvedContent.image_alt}
              sizes="(max-width: 639px) 100vw, 360px"
              className="object-cover object-[62%_48%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-overlay/45 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block" />
          </div>
        )}

        <div className={cx("p-5 sm:p-7", status === "success" && "flex items-center")}>
          {status === "success" ? (
            <div className="flex items-start gap-3 py-2">
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" />
              <div>
                <h2 id="soft-lead-title" className="text-md font-semibold text-primary">
                  {resolvedContent.success_heading}
                </h2>
                <p id="soft-lead-description" className="mt-1 text-sm text-tertiary">
                  {resolvedContent.success_description}
                </p>
                <Button size="sm" className="mt-4" onClick={dismiss}>
                  {resolvedContent.success_close_label}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 id="soft-lead-title" className="pr-8 text-lg font-semibold text-primary">
                {resolvedHeadline}
              </h2>
              <p id="soft-lead-description" className="mt-2 text-sm leading-5 text-tertiary">{resolvedDescription}</p>
              <form onSubmit={submit} className="mt-5 grid gap-3 min-[480px]:grid-cols-2">
                <Input
                  isRequired
                  size="md"
                  label={resolvedContent.name_label}
                  placeholder={resolvedContent.name_placeholder}
                  value={name}
                  onChange={setName}
                />
                <Input
                  isRequired
                  size="md"
                  type="email"
                  label={resolvedContent.email_label}
                  placeholder={resolvedContent.email_placeholder}
                  value={email}
                  onChange={setEmail}
                />
                <Input
                  isRequired
                  size="md"
                  type="tel"
                  label={resolvedContent.phone_label}
                  value={phone}
                  onChange={(v) => setPhone(formatPhone(v))}
                  placeholder={resolvedContent.phone_placeholder}
                />
                <Input
                  size="md"
                  label={resolvedContent.company_label}
                  placeholder={resolvedContent.company_placeholder}
                  value={company}
                  onChange={setCompany}
                />
                <Checkbox
                  size="sm"
                  aria-label={resolvedContent.marketing_consent_aria_label}
                  isSelected={marketingConsent}
                  onChange={setMarketingConsent}
                  hint={resolvedContent.marketing_consent_text}
                  className="min-[480px]:col-span-2"
                />
                <Button type="submit" size="lg" isLoading={status === "loading"} showTextWhileLoading className="w-full min-[480px]:col-span-2">
                  {status === "loading" ? resolvedContent.sending_label : resolvedContent.submit_label}
                </Button>
                {status === "error" && (
                  <p role="alert" className="flex items-start gap-2 text-sm text-error-primary min-[480px]:col-span-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {errorMsg}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
