"use client";

import { useState, type FC, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Mail01,
  MarkerPin02,
  Phone01,
  Send01,
  Zap,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { PhoneField, ServiceSelect, groupServiceOptions } from "@/components/ui/ContactWidget";
import { pushEvent } from "@/lib/analytics";
import { resolveIcon } from "@/lib/iconMap";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { BrandOrbs } from "@/components/effects/AmbientMotion";

type IconComponent = FC<{ className?: string }>;

/** Map CMS icon-name strings to Untitled UI icons; fall back to the shared icon map. */
const UUI_ICON_MAP: Record<string, IconComponent> = {
  MapPin: MarkerPin02,
  Mail: Mail01,
  Phone: Phone01,
  Clock: Clock,
};

function resolveContactIcon(icon: unknown): IconComponent {
  if (typeof icon === "string") {
    return UUI_ICON_MAP[icon] ?? resolveIcon(icon);
  }
  return icon as IconComponent;
}

/** Display phone-style values with a leading "+" (e.g. "+1-800-786-9188"). */
function withPlusPrefix(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return /^\d/.test(trimmed) ? `+${trimmed}` : trimmed;
}

const DEFAULT_CONTACT_INFO = [
  {
    icon: MarkerPin02,
    label: "Address",
    value: "1279 W Palmetto Park Rd #272415",
    subValue: "Boca Raton, FL 33427",
    href: null,
  },
  {
    icon: Mail01,
    label: "Email",
    value: "info@icesales.com",
    href: "mailto:info@icesales.com",
  },
  {
    icon: Phone01,
    label: "Phone",
    value: "+1-800-786-9188",
    href: "tel:+18007869188",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 9:00 AM – 5:00 PM ET",
    href: null,
  },
];

export default function ContactPage({
  cmsData,
  orderedSections,
}: {
  cmsData?: Record<string, any>;
  orderedSections?: CMSRenderableSection[];
}) {
  const hero = cmsData?.hero ?? {};
  const intro = cmsData?.intro ?? {};
  // CMS may provide a flat list via `service_options.options`; group it into the
  // ICE pillars (falls back to the full accurate catalog when absent).
  const serviceGroups = groupServiceOptions(cmsData?.service_options?.options);
  const contactItems = (cmsData?.contact_info?.items ?? DEFAULT_CONTACT_INFO).map((item: any) => {
    const isPhone = item.label === "Phone" || (typeof item.href === "string" && item.href.startsWith("tel:"));
    return {
      ...item,
      icon: resolveContactIcon(item.icon),
      subValue: item.subValue ?? item.sub_value,
      value: isPhone ? withPlusPrefix(item.value) : item.value,
    };
  });
  // Exclude the sections already rendered above by this page. Also skip any
  // contact-detail sections so a CMS-managed block can never duplicate the
  // address / email / phone cards that are rendered here directly.
  const EXCLUDED_KEYS = ["hero", "intro", "contact_info", "service_options"];
  const extraSections = (orderedSections ?? []).filter((section) => {
    const key = (section.section_key ?? "").toLowerCase();
    if (EXCLUDED_KEYS.includes(key)) return false;
    return !key.includes("contact") && !key.includes("get_in_touch");
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
    smsConsent: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleFieldChange = (name: keyof typeof formData) => (value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      pushEvent("contact_submitted", { form: "contact_page", service: formData.service });
      setStatus("success");
      setStatusMessage("Your message has been sent successfully. We will get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        service: "",
        message: "",
        smsConsent: false,
      });
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-primary">
      {/* ── Hero band ────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
        {/* Engineering-grid texture, fading out from the top of the band */}
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        {/* Film-grain finish over the band */}
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
        />
        {/* Top-center brand bloom so the hero pops */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(4_155_251/0.16),transparent)] blur-2xl"
        />
        {/* Ambient brand orbs — slow continuous drift */}
        <BrandOrbs />

        <div className="relative container mx-auto max-w-container px-4 md:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm">
            <Link
              href="/"
              className="rounded-xs font-medium text-tertiary outline-focus-ring transition-colors hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Home
            </Link>
            <ChevronRight className="size-4 text-fg-quaternary" aria-hidden="true" />
            <span className="font-medium text-secondary">Contact</span>
          </nav>

          {/* Heading */}
          <div className="flex w-full max-w-3xl flex-col items-start">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase md:text-sm">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
              Contact us
            </span>
            <h1 className="mt-3 text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              {hero.headline ?? "Contact Us"}
            </h1>
            {hero.subheadline && (
              <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">{hero.subheadline}</p>
            )}

            {/* Quiet mono proof row */}
            <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 md:mt-10">
              {["IBM Business Partner since 1990", "Boca Raton, Florida"].map((label, index) => (
                <li key={label} className="flex items-center gap-3">
                  {index > 0 && (
                    <span aria-hidden="true" className="size-1 rounded-full bg-fg-brand-secondary/60" />
                  )}
                  <span className="font-mono text-xs font-medium tracking-wide text-quaternary uppercase">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Contact content — textured band with elevated form card ─────── */}
      <section className="relative isolate overflow-hidden bg-secondary py-16 md:py-24">
        {/* Dot-matrix texture, fading toward the edges */}
        <div
          aria-hidden="true"
          className="texture-dots pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_65%)]"
        />

        <div className="relative container mx-auto max-w-container px-4 md:px-8">
          <div className="mx-auto grid max-w-xl grid-cols-1 items-start gap-12 md:gap-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {/* Left: Contact info */}
            <div className="flex w-full flex-col">
              <div>
                <h2 className="text-display-xs font-semibold text-primary">{intro.heading ?? "Contact Information"}</h2>
                <p className="mt-2 text-md text-tertiary">
                  {intro.description ??
                    "We'd love to hear from you. Reach out to our team for enterprise technology solutions, pricing, or any questions."}
                </p>
              </div>

              <ul className="mt-8 grid w-full grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 md:mt-10 md:gap-y-10">
                {contactItems.map((item: any) => (
                  <li key={item.label} className="flex max-w-sm flex-col items-start">
                    <FeaturedIcon icon={item.icon} size="md" color="brand" theme="light" />

                    <h3 className="mt-3 text-md font-semibold text-primary md:mt-4">{item.label}</h3>
                    {item.href ? (
                      <Button href={item.href} color="link-color" size="md" className="mt-1">
                        {item.value}
                      </Button>
                    ) : (
                      <p className="mt-1 text-md text-tertiary">{item.value}</p>
                    )}
                    {item.subValue && <p className="text-md text-tertiary">{item.subValue}</p>}
                  </li>
                ))}
              </ul>

              {/* Response time */}
              <div className="mt-10 flex items-start gap-4 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary ring-inset md:mt-12">
                <FeaturedIcon icon={Zap} size="md" color="success" theme="light" />
                <div>
                  <p className="text-sm font-semibold text-primary">Typical Response Time</p>
                  <p className="mt-0.5 text-md text-tertiary">2-3 Business Days</p>
                </div>
              </div>
            </div>

            {/* Right: Contact form — elevated card over the textured band */}
            <div className="flex flex-col gap-6 rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary ring-inset sm:p-8 md:p-10 dark:shadow-[0_0_60px_rgb(4_155_251/0.08)]">
              <h2 className="text-display-xs font-semibold text-primary">Send Us a Message</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  {/* Name & Email */}
                  <div className="flex flex-col gap-x-8 gap-y-6 sm:flex-row">
                    <Input
                      isRequired
                      validationBehavior="native"
                      size="md"
                      name="name"
                      label="Name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleFieldChange("name")}
                      wrapperClassName="flex-1"
                    />
                    <Input
                      isRequired
                      validationBehavior="native"
                      size="md"
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleFieldChange("email")}
                      wrapperClassName="flex-1"
                    />
                  </div>

                  {/* Company & Phone */}
                  <div className="flex flex-col gap-x-8 gap-y-6 sm:flex-row">
                    <Input
                      size="md"
                      name="company"
                      label="Company"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={handleFieldChange("company")}
                      wrapperClassName="flex-1"
                    />
                    <div className="flex-1">
                      <PhoneField
                        size="md"
                        label="Phone number"
                        value={formData.phone}
                        onChange={handleFieldChange("phone")}
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <ServiceSelect
                    size="md"
                    name="service"
                    label="Service Interested In"
                    value={formData.service}
                    onChange={handleFieldChange("service")}
                    groups={serviceGroups}
                  />

                  {/* Message */}
                  <TextArea
                    isRequired
                    validationBehavior="native"
                    name="message"
                    label="Message"
                    placeholder="Tell us about your project or question..."
                    rows={5}
                    value={formData.message}
                    onChange={handleFieldChange("message")}
                  />

                  {/* SMS consent */}
                  <Checkbox
                    name="smsConsent"
                    size="md"
                    aria-label="SMS consent"
                    isSelected={formData.smsConsent}
                    onChange={handleFieldChange("smsConsent")}
                    hint={
                      <>
                        I consent to receive SMS text messages from International Computer
                        Exchange. Message and data rates may apply. Reply STOP to opt out.
                        See our{" "}
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
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="xl"
                  iconLeading={status === "loading" ? undefined : Send01}
                  isLoading={status === "loading"}
                  showTextWhileLoading
                  isDisabled={status === "loading"}
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </Button>

                {/* Status */}
                {status === "success" && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg bg-success-secondary px-4 py-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" />
                    <p className="text-sm text-success-primary">{statusMessage}</p>
                  </div>
                )}
                {status === "error" && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg bg-error-secondary px-4 py-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-fg-error-primary" />
                    <p className="text-sm text-error-primary">{statusMessage}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <GenericCMSSections sections={extraSections} />
    </main>
  );
}
