"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronRight, Download01, MessageChatCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { cx } from "@/utils/cx";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DEFAULT_SECTIONS = [
  {
    id: "default-opt-in",
    title: "Default Opt-In",
    content: `By providing your phone number through our website contact form, during a phone call with our sales or support team, or by texting us directly, you are giving International Computer Exchange consent to send you SMS text messages related to your inquiry, account, services, and promotional information. Message and data rates may apply depending on your carrier plan. You may opt out at any time using any of the methods described below.`,
  },
  {
    id: "opting-out",
    title: "Opting Out",
    content: `You can opt out of receiving SMS text messages from ICE at any time:

• Reply STOP to any SMS message you receive from us.
• Send an email to info@icesales.com with the subject "SMS Opt-Out".
• Call 1-800-786-9188 during business hours (9:00 AM – 5:00 PM ET).

After opting out, you will receive a confirmation message and will no longer receive SMS communications from us unless you opt in again.`,
  },
  {
    id: "sign-up",
    title: "How You Can Sign Up",
    content: `You can opt in to SMS messaging from ICE in any of the following ways:

• By phone: Provide verbal consent during a phone call with our team.
• By texting us: Send a text message to our business number to initiate communication.
• Via our website: Check the SMS consent checkbox on our contact form or footer subscription form.`,
  },
  {
    id: "frequency",
    title: "Frequency & Types of Messages",
    content: `Message frequency varies. You may receive:

• Responses to your inquiries or support requests
• Service updates, appointment confirmations, or account notifications
• Promotional offers, product announcements, or newsletters
• Follow-up communications related to ongoing projects

Standard message and data rates may apply. Carriers are not liable for delayed or undelivered messages.`,
  },
  {
    id: "carrier",
    title: "Carrier Compliance",
    content: `Our SMS messaging program is compliant with carrier requirements and industry best practices. We use RingCentral as our messaging platform. Carriers supported include but are not limited to AT&T, Verizon, T-Mobile, Sprint, and other major US carriers.`,
  },
  {
    id: "questions",
    title: "Questions?",
    content: `If you have any questions about our SMS messaging practices, please contact us:

International Computer Exchange, Inc.
Email: info@icesales.com
Phone: 1-800-786-9188`,
  },
];

const DEFAULT_HERO = {
  eyebrow: "Legal · Messaging Policy",
  headline: "SMS Consent",
  subheadline: "SMS / Text messaging – opt-in & opt-out policy.",
  last_updated: "March 2026",
  badge_note: "Reply STOP to opt out at any time",
  document_title: "SMS / Text Messaging – Opt-In & Opt-Out",
  document_intro:
    'International Computer Exchange, Inc. ("ICE") uses SMS text messaging via RingCentral to communicate with customers who have opted in. Below you will find information about how we handle SMS consent, how to opt in, and how to opt out at any time.',
  related_label: "Terms of Service",
  related_href: "/terms-of-service",
};

export default function SmsConsentPage({ cmsData }: { cmsData?: Record<string, any> }) {
  const hero = { ...DEFAULT_HERO, ...(cmsData?.hero ?? {}) };
  const sections: { id: string; title: string; content: string }[] = useMemo(
    () => cmsData?.sections?.items ?? DEFAULT_SECTIONS,
    [cmsData],
  );
  const [activeId, setActiveId] = useState(sections[0]?.id ?? DEFAULT_SECTIONS[0].id);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (sections[0]?.id) setActiveId(sections[0].id);
  }, [sections]);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  const headerReveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE },
      };

  return (
    <main className="bg-primary">
      <section className="relative overflow-hidden border-b border-secondary">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <BackgroundPattern
            pattern="grid"
            className="absolute -top-28 right-0 translate-x-1/3 text-border-secondary opacity-70 dark:opacity-40"
          />
        </div>
        <div className="relative mx-auto max-w-container px-4 py-10 md:px-8 md:py-14">
          <motion.div {...headerReveal}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium">
              <Link href="/" className="text-tertiary transition duration-100 ease-linear hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight aria-hidden="true" className="size-4 text-fg-quaternary" />
              <span aria-current="page" className="font-semibold text-brand-secondary">
                {hero.headline}
              </span>
            </nav>

            <p className="mt-8 text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              {hero.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-md text-tertiary md:text-lg">{hero.subheadline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Badge size="md" color="brand">
                Last Updated: {hero.last_updated}
              </Badge>
              <span className="hidden h-4 w-px bg-border-secondary sm:block" aria-hidden="true" />
              <span className="flex items-center gap-1.5 text-sm text-quaternary">
                <MessageChatCircle aria-hidden="true" className="size-4" />
                {hero.badge_note}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pb-6">
                <p className="text-xs font-medium tracking-[0.2em] text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-4 flex flex-col gap-0.5 border-l border-secondary">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      className={cx(
                        "-ml-px cursor-pointer border-l-2 py-1.5 pl-4 text-sm transition duration-100 ease-linear",
                        activeId === section.id
                          ? "border-brand bg-brand-primary_alt font-semibold text-brand-secondary"
                          : "border-transparent text-tertiary hover:border-brand hover:text-brand-secondary",
                      )}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-10 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:hidden print:hidden">
                <p className="text-xs font-medium tracking-[0.2em] text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-3 flex flex-col gap-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      className="cursor-pointer text-sm font-medium text-tertiary transition duration-100 ease-linear hover:text-brand-secondary"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-b border-secondary pb-8">
                <h2 className="text-display-xs font-semibold tracking-tight text-primary md:text-display-sm">
                  {hero.document_title}
                </h2>
                <p className="prose mt-4">{hero.document_intro}</p>
              </div>

              <div>
                {sections.map((section, i) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className={cx("scroll-mt-24 py-8", i < sections.length - 1 && "border-b border-secondary")}
                  >
                    <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                    <div className="prose mt-4 whitespace-pre-line">{section.content}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 border-t border-secondary pt-8 print:hidden">
                <Button color="secondary" size="lg" iconLeading={Download01} onClick={() => window.print()}>
                  Download as PDF
                </Button>
                <p className="text-sm text-tertiary">
                  Related:{" "}
                  <Link
                    href={hero.related_href ?? "/terms-of-service"}
                    className="inline-flex items-center gap-1 font-medium text-brand-secondary hover:underline"
                  >
                    {hero.related_label ?? "Terms of Service"}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
