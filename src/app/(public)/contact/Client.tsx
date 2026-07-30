"use client";

import type { FC } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Mail01,
  MarkerPin02,
  Phone01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { groupServiceOptions } from "@/components/ui/ContactWidget";
import ConsultWizard from "@/components/marketing/ConsultWizard";
import BookingEmbed from "@/components/marketing/BookingEmbed";
import { PhoneSmsCtaGroup, TrackedTelLink } from "@/components/marketing/TrackedCtas";
import { resolveIcon } from "@/lib/iconMap";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { FaqPreview } from "@/components/marketing/FaqHub";

type IconComponent = FC<{ className?: string }>;

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
  bookingUrl,
}: {
  cmsData?: Record<string, any>;
  orderedSections?: CMSRenderableSection[];
  bookingUrl?: string | null;
}) {
  const hero = cmsData?.hero ?? {};
  const intro = cmsData?.intro ?? {};
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
  const phoneItem = contactItems.find(
    (item: any) => item.label === "Phone" || (typeof item.href === "string" && item.href.startsWith("tel:")),
  );
  const phoneLabel = typeof phoneItem?.value === "string" ? phoneItem.value.replace(/^\+/, "") : "1-800-786-9188";

  const EXCLUDED_KEYS = ["hero", "intro", "contact_info", "service_options"];
  const extraSections = (orderedSections ?? []).filter((section) => {
    const key = (section.section_key ?? "").toLowerCase();
    if (EXCLUDED_KEYS.includes(key)) return false;
    return !key.includes("contact") && !key.includes("get_in_touch");
  });

  return (
    <main className="bg-primary">
      <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)]">
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
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm md:mb-8">
            <Link
              href="/"
              className="rounded-xs font-medium text-tertiary outline-focus-ring transition-colors hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Home
            </Link>
            <ChevronRight className="size-4 text-fg-quaternary" aria-hidden="true" />
            <span className="font-medium text-secondary">Contact</span>
          </nav>

          <div className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="flex flex-col">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-solid" />
                Contact us
              </span>
              <h1 className="mt-3 text-display-lg font-semibold tracking-tight text-primary md:text-display-xl">
                {hero.headline ?? "Contact Us"}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-tertiary md:mt-5 md:text-xl">
                {hero.subheadline ??
                  intro.description ??
                  "Talk with our enterprise architects about cloud, security, data protection, and managed services."}
              </p>

              <div className="mt-8 lg:mt-10">
                <PhoneSmsCtaGroup phone={phoneLabel} location="contact_hero" />
              </div>

              <ul className="mt-8 hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid">
                {contactItems.map((item: any) => (
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
              </ul>
            </div>

            <ConsultWizard serviceGroups={serviceGroups} bookingUrl={bookingUrl} />
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-6 border-t border-secondary pt-10 sm:grid-cols-2 lg:hidden">
            {contactItems.map((item: any) => (
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
          </ul>
        </div>
      </section>

      {bookingUrl && (
        <section className="border-b border-secondary py-12 md:py-16">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <BookingEmbed url={bookingUrl} location="contact_page" />
          </div>
        </section>
      )}

      <section className="border-b border-secondary bg-secondary py-16 md:py-20">
        <div className="mx-auto grid max-w-container gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Boca Raton operations</span>
            <h2 className="mt-3 text-display-sm font-semibold text-primary">A US-based team behind every escalation</h2>
            <p className="mt-4 max-w-2xl text-lg text-tertiary">
              ICE supports enterprise cloud, IBM Power, data protection, and security operations from the United States, with direct access to specialists who understand the environment.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary">
              <dt className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">NOC / SOC coverage</dt>
              <dd className="mt-2 text-lg font-semibold text-primary">24/7/365 operations</dd>
              <p className="mt-1 text-sm text-tertiary">Monitoring and escalation for managed clients.</p>
            </div>
            <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary">
              <dt className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">Business office</dt>
              <dd className="mt-2 text-lg font-semibold text-primary">Mon–Fri, 9–5 ET</dd>
              <p className="mt-1 text-sm text-tertiary">Boca Raton, Florida · US-based support.</p>
            </div>
          </dl>
        </div>
      </section>

      <FaqPreview heading="What to expect when you contact ICE" />
      <GenericCMSSections sections={extraSections} />
    </main>
  );
}
