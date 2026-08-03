"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Mail01, MarkerPin02, Phone01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Grid } from "@/components/shared-assets/background-patterns/grid";
import { cx } from "@/utils/cx";

const CORETV_URL = "https://coretv.co";
const AS400_FOOTER_LINK = { label: "AS400 Hosting", href: "/solutions/as400" };

function CoreTvRedirectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(5);
      return;
    }

    setSeconds(5);
    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          window.location.assign(CORETV_URL);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  return (
    <ModalOverlay
      isDismissable
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="items-center justify-center"
    >
      <Modal className="mx-auto w-full max-w-md">
        <Dialog className="p-6 md:p-8">
          <h2 slot="title" className="text-display-xs font-semibold text-primary">
            Leaving ICE
          </h2>
          <p className="mt-3 text-md text-tertiary">
            You are being redirected off this page to CoreTV in{" "}
            <span className="font-semibold text-brand-secondary tabular-nums">{seconds}</span>{" "}
            {seconds === 1 ? "second" : "seconds"}.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button color="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button size="md" onClick={() => window.location.assign(CORETV_URL)}>
              Go now
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/* ── Default data (used when CMS data not available) ── */

const DEFAULT_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Partners", href: "/partners" },
  { label: "Why ICE", href: "/why-ice" },
  { label: "Contact Us", href: "/contact" },
];

const DEFAULT_SOLUTION_CATEGORIES = [
  {
    heading: "Managed Cloud Services",
    links: [
      { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
      { label: "Managed Private Cloud", href: "/solutions/managed-private-cloud" },
      { label: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud" },
      { label: "Cloud Migration Services", href: "/solutions/cloud-migration" },
    ],
  },
  {
    heading: "Managed Data Protection",
    links: [
      { label: "Backup as a Service", href: "/solutions/backup-as-a-service" },
      { label: "Disaster Recovery", href: "/solutions/disaster-recovery" },
      { label: "High Availability", href: "/solutions/high-availability" },
      { label: "Ransomware Recovery", href: "/solutions/ransomware-recovery" },
    ],
  },
  {
    heading: "Managed Security",
    links: [
      { label: "IBM i Security", href: "/solutions/ibm-i-security" },
      { label: "Protection Suite", href: "/solutions/protection-suite" },
      { label: "Security Monitoring", href: "/solutions/security-monitoring" },
      { label: "Threat Detection", href: "/solutions/threat-detection" },
      { label: "Endpoint Security", href: "/solutions/endpoint-security" },
    ],
  },
  {
    heading: "Managed Services",
    links: [
      AS400_FOOTER_LINK,
      { label: "Managed Microsoft", href: "/solutions/managed-microsoft" },
      { label: "Automation Suite", href: "/solutions/automation-suite" },
      { label: "Systems Management", href: "/solutions/systems-management" },
      { label: "IBM Power VS", href: "/solutions/ibm-power-vs" },
    ],
  },
];

function ensureAs400FooterLink(
  categories: { heading: string; links: { label: string; href: string }[] }[],
) {
  const hasAs400 = categories.some((category) =>
    category.links.some((link) => link.href === AS400_FOOTER_LINK.href),
  );

  if (hasAs400) {
    return categories.map((category) => ({
      ...category,
      links: category.links.map((link) =>
        link.href === AS400_FOOTER_LINK.href ? AS400_FOOTER_LINK : link,
      ),
    }));
  }

  const managedIndex = categories.findIndex((category) =>
    category.heading.toLowerCase().includes("managed services"),
  );

  if (managedIndex >= 0) {
    return categories.map((category, index) =>
      index === managedIndex
        ? { ...category, links: [AS400_FOOTER_LINK, ...category.links] }
        : category,
    );
  }

  return [
    ...categories,
    {
      heading: "Managed Services",
      links: [AS400_FOOTER_LINK],
    },
  ];
}

const DEFAULT_LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "SMS Consent", href: "/sms-consent" },
  { label: "Email preferences", href: "/subscribe" },
];

export interface FooterCMSData {
  quickLinks?: { label: string; href: string }[];
  solutionCategories?: { heading: string; links: { label: string; href: string }[] }[];
  legalLinks?: { label: string; href: string }[];
  companyInfo?: {
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    hours?: string;
    tagline?: string;
    logo?: string;
  };
  footerCopy?: {
    ibm_partner_text?: string;
    ibm_partner_label?: string;
    ibm_partner_sublabel?: string;
    copyright?: string;
    get_in_touch_heading?: string;
    get_in_touch_description?: string;
    get_in_touch_cta_label?: string;
    get_in_touch_cta_href?: string;
  };
  showSolutionsAccordion?: boolean;
  showGetInTouch?: boolean;
  showContactBar?: boolean;
}

const footerLinkClass =
  "rounded-xs text-sm font-semibold text-tertiary outline-brand transition duration-100 ease-linear hover:text-tertiary_hover focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Footer({ cmsData }: { cmsData?: FooterCMSData }) {
  const [coreTvOpen, setCoreTvOpen] = useState(false);
  const quickLinks = cmsData?.quickLinks ?? DEFAULT_QUICK_LINKS;
  const solutionCategories = ensureAs400FooterLink(cmsData?.solutionCategories ?? DEFAULT_SOLUTION_CATEGORIES);
  const legalLinks = cmsData?.legalLinks ?? DEFAULT_LEGAL_LINKS;
  const company = cmsData?.companyInfo;
  const footerCopy = cmsData?.footerCopy;

  const showSolutionsAccordion = cmsData?.showSolutionsAccordion ?? true;
  const showGetInTouch = false;
  const showContactBar = cmsData?.showContactBar ?? true;

  const logoSrc = company?.logo ?? "/images/logo/ice-logo.jpg";
  const copyrightName = footerCopy?.copyright ?? "International Computer Exchange, Inc.";
  const ibmLabel = footerCopy?.ibm_partner_label ?? "IBM Business Partner";
  const ibmSublabel = footerCopy?.ibm_partner_sublabel ?? "Since 1990";
  const getInTouchHeading = footerCopy?.get_in_touch_heading ?? "Get in touch";
  const getInTouchDescription =
    footerCopy?.get_in_touch_description ??
    "Ready to modernize your IT infrastructure? Our experts are here to help.";
  const getInTouchCtaLabel = footerCopy?.get_in_touch_cta_label ?? "Contact Us";
  const getInTouchCtaHref = footerCopy?.get_in_touch_cta_href ?? "/contact";

  const navColumns = [
    ...(showSolutionsAccordion ? solutionCategories : []),
    { heading: "Quick Links", links: quickLinks },
  ];

  return (
    <footer className="relative z-10 overflow-hidden bg-primary pt-12 pb-4 md:pt-16 md:pb-5">
      {/* Soft top fade so page blooms blend under the footer instead of hard-cutting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-bg-primary"
      />
      {/* Faint techy grid — clipped by footer overflow so it can't extend scroll height */}
      <Grid
        size="md"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 hidden size-96 opacity-25 md:block"
      />
      <div className="relative mx-auto max-w-container px-4 md:px-8">
        {/* Get in touch CTA */}
        {showGetInTouch && (
          <div className="relative mb-12 overflow-hidden rounded-2xl border border-secondary bg-secondary md:mb-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/[0.08] via-transparent to-transparent"
            />
            <div className="relative flex flex-col items-start justify-between gap-6 px-6 py-8 md:flex-row md:items-center md:px-10 md:py-10">
              <div className="flex max-w-2xl flex-col gap-2">
                <p className="text-display-xs font-semibold text-primary md:text-display-sm">
                  {getInTouchHeading}
                </p>
                <p className="text-md text-tertiary md:text-lg">{getInTouchDescription}</p>
              </div>
              <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                <Button
                  color="secondary"
                  size="xl"
                  href={`tel:${(company?.phone ?? "1-800-786-9188").replace(/[^\d+]/g, "")}`}
                  iconLeading={Phone01}
                >
                  {company?.phone ?? "1-800-786-9188"}
                </Button>
                <Button size="xl" href={getInTouchCtaHref} iconTrailing={ArrowRight}>
                  {getInTouchCtaLabel}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Company info + link columns */}
        <div className={cx("flex flex-col gap-12 xl:flex-row xl:gap-16")}>
          <div className="flex flex-col gap-6 xl:w-80 xl:shrink-0">
            <Link
              href="/"
              className="inline-flex w-max items-center rounded-lg bg-white px-3 py-2 outline-brand focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Image
                src={logoSrc}
                alt="International Computer Exchange"
                width={220}
                height={66}
                className="h-12 w-auto"
              />
            </Link>

            {showContactBar && (
              <ul className="flex flex-col gap-4">
                <li className="flex gap-3">
                  <MarkerPin02 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                  <p className="text-sm text-tertiary">
                    {company?.address ?? "1279 W Palmetto Park Rd #272415"}
                    <br />
                    {company?.city ?? "Boca Raton, FL 33427"}
                  </p>
                </li>
                <li>
                  <a
                    href={`tel:${(company?.phone ?? "1-800-786-9188").replace(/[^\d+]/g, "")}`}
                    className="flex w-max gap-3 rounded-xs text-sm text-tertiary outline-brand transition duration-100 ease-linear hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Phone01 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {company?.phone ?? "1-800-786-9188"}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${company?.email ?? "info@icesales.com"}`}
                    className="flex w-max gap-3 rounded-xs text-sm text-tertiary outline-brand transition duration-100 ease-linear hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Mail01 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {company?.email ?? "info@icesales.com"}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                  <p className="text-sm text-tertiary">{company?.hours ?? "Mon – Fri, 9–5 ET"}</p>
                </li>
              </ul>
            )}

            <div className="flex w-max items-center gap-3 rounded-xl border border-secondary px-4 py-3">
              <Image src="/images/ibm.svg" alt="IBM" width={48} height={20} className="h-5 w-auto shrink-0" />
              <p className="text-sm font-medium text-secondary">
                {ibmLabel}
                <br />
                <span className="font-normal text-quaternary">{ibmSublabel}</span>
              </p>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
              {navColumns.map((category) => (
                <li key={category.heading}>
                  <h4 className="text-sm font-semibold text-quaternary">{category.heading}</h4>
                  <ul className="mt-4 flex flex-col gap-3">
                    {category.links.map((link) => (
                      <li key={link.href} className="flex">
                        <Link href={link.href} className={footerLinkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Brand hairline */}
        <div
          aria-hidden="true"
          className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent md:mt-10"
        />

        {/* Bottom bar */}
        <div className="flex flex-col-reverse justify-between gap-3 pt-4 md:flex-row md:items-center md:pt-5">
          <p className="text-sm text-quaternary">
            &copy; {new Date().getFullYear()} {copyrightName}. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xs text-sm text-quaternary outline-brand transition duration-100 ease-linear hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setCoreTvOpen(true)}
              className="rounded-xs text-sm text-quaternary outline-brand transition duration-100 ease-linear hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              by CoreTV
            </button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-28 md:h-32"
        />
      </div>

      <CoreTvRedirectModal isOpen={coreTvOpen} onClose={() => setCoreTvOpen(false)} />
    </footer>
  );
}
