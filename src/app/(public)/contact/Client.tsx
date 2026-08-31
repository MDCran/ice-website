"use client";

import type { FC } from "react";
import {
  Clock,
  Mail01,
  MarkerPin02,
  Phone01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { groupServiceOptions } from "@/components/ui/ContactWidget";
import ConsultWizard, { type ConsultWizardContent } from "@/components/marketing/ConsultWizard";
import BookingEmbed from "@/components/marketing/BookingEmbed";
import { PhoneSmsCtaGroup, TrackedTelLink } from "@/components/marketing/TrackedCtas";
import { resolveIcon } from "@/lib/iconMap";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { FaqPreview } from "@/components/marketing/FaqHub";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";

type IconComponent = FC<{ className?: string }>;
type CmsRecord = Record<string, unknown>;

interface ContactItem {
  icon: IconComponent;
  label: string;
  value: string;
  subValue?: string;
  href: string | null;
}

interface OperationItem {
  label: string;
  value: string;
  description: string;
}

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
  if (
    typeof icon === "function" ||
    (icon !== null && typeof icon === "object" && "$$typeof" in icon)
  ) {
    return icon as IconComponent;
  }
  return MarkerPin02;
}

function withPlusPrefix(value: string): string {
  const trimmed = value.trim();
  return /^\d/.test(trimmed) ? `+${trimmed}` : trimmed;
}

function asRecord(value: unknown): CmsRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as CmsRecord
    : {};
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeContactItem(value: unknown): ContactItem {
  const item = asRecord(value);
  const label = optionalString(item.label) ?? "";
  const href = optionalString(item.href) ?? null;
  const rawValue = typeof item.value === "number" ? String(item.value) : optionalString(item.value) ?? "";
  const isPhone = label === "Phone" || href?.startsWith("tel:") === true;
  return {
    icon: resolveContactIcon(item.icon),
    label,
    value: isPhone ? withPlusPrefix(rawValue) : rawValue,
    subValue: optionalString(item.subValue) ?? optionalString(item.sub_value),
    href,
  };
}

const DEFAULT_CONTACT_INFO: ContactItem[] = [
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

const DEFAULT_OPERATIONS: OperationItem[] = [
  {
    label: "NOC / SOC coverage",
    value: "24/7/365 operations",
    description: "Monitoring and escalation for managed clients.",
  },
  {
    label: "Business office",
    value: "Mon–Fri, 9–5 ET",
    description: "Boca Raton, Florida · US-based support.",
  },
];

export default function ContactPage({
  cmsData,
  orderedSections,
  bookingUrl,
}: {
  cmsData?: Record<string, unknown>;
  orderedSections?: CMSRenderableSection[];
  bookingUrl?: string | null;
}) {
  const hero = asRecord(cmsData?.hero);
  const intro = asRecord(cmsData?.intro);
  const serviceOptions = asRecord(cmsData?.service_options);
  const operations = asRecord(cmsData?.operations);
  const faqPreview = asRecord(cmsData?.faq_preview);
  const bookingEmbed = asRecord(cmsData?.booking_embed);
  const serviceGroups = groupServiceOptions(serviceOptions.options);
  const wizardContent = serviceOptions.wizard !== null && typeof serviceOptions.wizard === "object"
    ? serviceOptions.wizard as ConsultWizardContent
    : undefined;
  const contactInfoItems = asRecord(cmsData?.contact_info).items;
  const contactItems = (Array.isArray(contactInfoItems) ? contactInfoItems : DEFAULT_CONTACT_INFO)
    .map(normalizeContactItem);
  const phoneItem = contactItems.find(
    (item) => item.label === "Phone" || item.href?.startsWith("tel:") === true,
  );
  const phoneLabel = typeof phoneItem?.value === "string" ? phoneItem.value.replace(/^\+/, "") : "1-800-786-9188";
  const operationItems = (Array.isArray(operations.items) ? operations.items : DEFAULT_OPERATIONS).map((value) => {
    const item = asRecord(value);
    return {
      label: optionalString(item.label) ?? "",
      value: optionalString(item.value) ?? "",
      description: optionalString(item.description) ?? "",
    };
  });
  const faqItems = Array.isArray(faqPreview.items)
    ? faqPreview.items.map((value) => {
        const item = asRecord(value);
        return {
          id: optionalString(item.id),
          question: optionalString(item.question) ?? "",
          href: optionalString(item.href),
        };
      })
    : undefined;
  const showHero = isCmsSectionVisible(orderedSections, "hero");
  const showContactInfo = isCmsSectionVisible(orderedSections, "contact_info");
  const showServiceOptions = isCmsSectionVisible(orderedSections, "service_options");
  const showBookingEmbed = isCmsSectionVisible(orderedSections, "booking_embed");
  const showOperations = isCmsSectionVisible(orderedSections, "operations");
  const showFaqPreview = isCmsSectionVisible(orderedSections, "faq_preview");

  const EXCLUDED_KEYS = [
    "hero",
    "intro",
    "contact_info",
    "service_options",
    "booking_embed",
    "operations",
    "faq_preview",
  ];
  const extraSections = (orderedSections ?? []).filter((section) => {
    const key = (section.section_key ?? "").toLowerCase();
    if (EXCLUDED_KEYS.includes(key)) return false;
    return !key.includes("contact") && !key.includes("get_in_touch");
  });

  return (
    <main className="bg-primary">
      {showHero && <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)]">
        <div
          aria-hidden="true"
          className="texture-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="texture-noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
        />
        <BrandOrbs />

        <div className="relative mx-auto flex w-full max-w-container flex-col px-4 py-10 md:px-8 md:py-12 lg:py-14">
          <div className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="flex flex-col">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
                {optionalString(hero.eyebrow) ?? "Contact us"}
              </span>
              <h1 className="mt-3 text-display-lg font-semibold tracking-tight text-primary md:text-display-xl">
                {optionalString(hero.headline) ?? "Contact Us"}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-tertiary md:mt-5 md:text-xl">
                {optionalString(hero.subheadline) ??
                  optionalString(intro.description) ??
                  "Talk with our enterprise architects about cloud, security, data protection, and managed services."}
              </p>

              <div className="mt-8 lg:mt-10">
                <PhoneSmsCtaGroup
                  phone={phoneLabel}
                  callLabel={optionalString(hero.call_label)}
                  textLabel={optionalString(hero.text_label)}
                  location="contact_hero"
                />
              </div>

              {showContactInfo && <ul className="mt-8 hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid">
                {contactItems.map((item) => (
                  <li key={item.label} className="flex flex-col items-start">
                    <FeaturedIcon icon={item.icon} size="md" color="brand" theme="light" />
                    <h3 className="mt-3 text-md font-semibold text-primary">{item.label}</h3>
                    {item.href ? (
                      item.href.startsWith("tel:") ? (
                        <TrackedTelLink
                          href={item.href}
                          label={String(item.value)}
                          location="contact_details"
                          className="mt-1 text-md font-semibold text-brand-secondary hover:underline"
                        />
                      ) : (
                        <Button href={item.href} color="link-color" size="md" className="mt-1">
                          {item.value}
                        </Button>
                      )
                    ) : (
                      <p className="mt-1 text-md text-tertiary">{item.value}</p>
                    )}
                    {item.subValue && <p className="text-md text-tertiary">{item.subValue}</p>}
                  </li>
                ))}
              </ul>}
            </div>

            {showServiceOptions && (
              <ConsultWizard
                serviceGroups={serviceGroups}
                bookingUrl={bookingUrl}
                content={wizardContent}
              />
            )}
          </div>

          {showContactInfo && <ul className="mt-12 grid grid-cols-1 gap-6 border-t border-secondary pt-10 sm:grid-cols-2 lg:hidden">
            {contactItems.map((item) => (
              <li key={item.label} className="flex flex-col items-start">
                <FeaturedIcon icon={item.icon} size="md" color="brand" theme="light" />
                <h3 className="mt-3 text-md font-semibold text-primary">{item.label}</h3>
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
          </ul>}
        </div>
      </section>}

      {bookingUrl && showBookingEmbed && (
        <section id="book-time" className="scroll-mt-24 border-b border-secondary py-12 md:py-16">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <BookingEmbed
              url={bookingUrl}
              eyebrow={optionalString(bookingEmbed.eyebrow)}
              title={optionalString(bookingEmbed.heading)}
              description={optionalString(bookingEmbed.description)}
              buttonLabel={optionalString(bookingEmbed.button_label)}
              embed={bookingEmbed.embed === true}
              location="contact_page"
            />
          </div>
        </section>
      )}

      {showOperations && <section className="border-b border-secondary bg-secondary py-16 md:py-20">
        <div className="mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {optionalString(operations.eyebrow) ?? "Boca Raton operations"}
            </span>
            <h2 className="mt-3 text-display-sm font-semibold text-primary">
              {optionalString(operations.heading) ?? "A US-based team behind every escalation"}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-tertiary">
              {optionalString(operations.description) ??
                "ICE supports enterprise cloud, IBM Power, data protection, and security operations from the United States, with direct access to specialists who understand the environment."}
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {operationItems.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-2xl bg-primary p-5 ring-1 ring-secondary">
                <dt className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">{item.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-primary">{item.value}</dd>
                <p className="mt-1 text-sm text-tertiary">{item.description}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>}

      {showFaqPreview && (
        <FaqPreview
          eyebrow={optionalString(faqPreview.eyebrow)}
          heading={optionalString(faqPreview.heading) ?? "What to expect when you contact ICE"}
          linkLabel={optionalString(faqPreview.link_label)}
          linkHref={optionalString(faqPreview.link_href)}
          items={faqItems}
        />
      )}
      <GenericCMSSections sections={extraSections} />
    </main>
  );
}
