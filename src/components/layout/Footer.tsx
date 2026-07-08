"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Mail01, MarkerPin02, Phone01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Grid } from "@/components/shared-assets/background-patterns/grid";
import { cx } from "@/utils/cx";

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
      { label: "Managed Microsoft", href: "/solutions/managed-microsoft" },
      { label: "Automation Suite", href: "/solutions/automation-suite" },
      { label: "Systems Management", href: "/solutions/systems-management" },
      { label: "IBM Power VS", href: "/solutions/ibm-power-vs" },
    ],
  },
];

const DEFAULT_LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "SMS Consent", href: "/sms-consent" },
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
  showSolutionsAccordion?: boolean;
  showGetInTouch?: boolean;
  showContactBar?: boolean;
}

const footerLinkClass =
  "rounded-xs text-sm font-semibold text-tertiary outline-brand transition duration-100 ease-linear hover:text-tertiary_hover focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Footer({ cmsData }: { cmsData?: FooterCMSData }) {
  const quickLinks = cmsData?.quickLinks ?? DEFAULT_QUICK_LINKS;
  const solutionCategories = cmsData?.solutionCategories ?? DEFAULT_SOLUTION_CATEGORIES;
  const legalLinks = cmsData?.legalLinks ?? DEFAULT_LEGAL_LINKS;
  const company = cmsData?.companyInfo;

  const showSolutionsAccordion = cmsData?.showSolutionsAccordion ?? true;
  const showGetInTouch = cmsData?.showGetInTouch ?? true;
  const showContactBar = cmsData?.showContactBar ?? true;

  const logoSrc = company?.logo ?? "/images/logo/ice-logo.jpg";

  const navColumns = [
    ...(showSolutionsAccordion ? solutionCategories : []),
    { heading: "Quick Links", links: quickLinks },
  ];

  return (
    <footer className="relative overflow-hidden bg-primary py-12 md:pt-16">
      {/* Faint techy grid backdrop */}
      <Grid
        size="lg"
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 hidden opacity-40 md:block"
      />
      <div className="relative mx-auto max-w-container px-4 md:px-8">
        {/* Get in touch CTA */}
        {showGetInTouch && (
          <div className="flex flex-col items-start justify-between gap-6 border-b border-secondary pb-12 md:flex-row md:items-center md:pb-16">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-primary md:text-xl">Get in touch</p>
              <p className="text-md text-tertiary">Ready to modernize your IT infrastructure? Our experts are here to help.</p>
            </div>
            <Button size="xl" href="/contact" iconTrailing={ArrowRight}>
              Contact Us
            </Button>
          </div>
        )}

        {/* Company info + link columns */}
        <div className={cx("flex flex-col gap-12 xl:flex-row xl:gap-16", showGetInTouch && "pt-12 md:pt-16")}>
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
            <p className="text-md text-tertiary">
              {company?.tagline ?? "IBM Business Partner since 1990. Delivering enterprise-grade cloud, security, and managed IT solutions."}
            </p>

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
              <Image src="/images/ibm.svg" alt="IBM" width={48} height={20} />
              <p className="text-sm font-medium text-secondary">
                IBM Business Partner
                <br />
                <span className="font-normal text-quaternary">Since 1990</span>
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
          className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent md:mt-16"
        />

        {/* Bottom bar */}
        <div className="flex flex-col-reverse justify-between gap-6 pt-8 md:flex-row md:items-center">
          <p className="text-sm text-quaternary">
            &copy; {new Date().getFullYear()} International Computer Exchange, Inc. All Rights Reserved.
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
            <a
              href="https://mdcran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xs text-sm text-quaternary outline-brand transition duration-100 ease-linear hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              by MDCran
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
