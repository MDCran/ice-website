"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle, ChevronRight, Download01, Mail01, MessageChatCircle, Phone01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { cx } from "@/utils/cx";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const tocItems = [
  { id: "default-opt-in", label: "Default Opt-In" },
  { id: "opting-out", label: "Opting Out" },
  { id: "sign-up", label: "How to Sign Up" },
  { id: "frequency", label: "Frequency & Types" },
  { id: "carrier", label: "Carrier Compliance" },
  { id: "questions", label: "Questions" },
];

export default function SmsConsentPage({ cmsData }: { cmsData?: Record<string, any> }) {
  const sectionOverrides = useMemo(() => {
    if (!cmsData?.sections?.items) return {};
    const map: Record<string, any> = {};
    for (const item of cmsData.sections.items) {
      map[item.id] = item;
    }
    return map;
  }, [cmsData]);

  const [activeId, setActiveId] = useState(tocItems[0].id);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const ids = tocItems.map((t) => t.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

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
      {/* Hard-edged document header */}
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
              <span aria-current="page" className="font-semibold text-brand-secondary">SMS Consent</span>
            </nav>

            <p className="mt-8 font-mono text-xs font-semibold tracking-widest text-brand-secondary uppercase">
              Legal &middot; Messaging Policy
            </p>
            <h1 className="mt-3 max-w-3xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
              SMS Consent
            </h1>
            <p className="mt-4 max-w-2xl text-md text-tertiary md:text-lg">
              SMS / Text messaging &ndash; opt-in &amp; opt-out policy.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Badge size="md" color="brand">Last Updated: March 2026</Badge>
              <span className="hidden h-4 w-px bg-border-secondary sm:block" aria-hidden="true" />
              <span className="flex items-center gap-1.5 text-sm text-quaternary">
                <MessageChatCircle aria-hidden="true" className="size-4" />
                Reply STOP to opt out at any time
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            {/* Sticky TOC (desktop) */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pb-6">
                <p className="font-mono text-xs font-semibold tracking-widest text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-4 flex flex-col gap-0.5 border-l border-secondary">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={cx(
                        "-ml-px cursor-pointer border-l-2 py-1.5 pl-4 text-sm transition duration-100 ease-linear",
                        activeId === item.id
                          ? "border-brand bg-brand-primary_alt font-semibold text-brand-secondary"
                          : "border-transparent text-tertiary hover:border-brand hover:text-brand-secondary"
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
              {/* Mobile table of contents */}
              <div className="mb-10 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:hidden print:hidden">
                <p className="font-mono text-xs font-semibold tracking-widest text-quaternary uppercase">On this page</p>
                <nav aria-label="Table of contents" className="mt-3 flex flex-col gap-2">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className="cursor-pointer text-sm font-medium text-tertiary transition duration-100 ease-linear hover:text-brand-secondary"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Document header */}
              <div className="border-b border-secondary pb-8">
                <h2 className="text-display-xs font-semibold tracking-tight text-primary md:text-display-sm">
                  SMS / Text Messaging &ndash; Opt-In &amp; Opt-Out
                </h2>
                <p className="prose mt-4">
                  International Computer Exchange, Inc. (&ldquo;ICE&rdquo;) uses SMS text messaging
                  via RingCentral to communicate with customers who have opted in. Below you
                  will find information about how we handle SMS consent, how to opt in, and
                  how to opt out at any time.
                </p>
              </div>

              {/* Default Opt-In */}
              <div id="default-opt-in" className="scroll-mt-24 border-b border-secondary py-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <CheckCircle aria-hidden="true" className="size-5 text-fg-brand-primary" />
                  {sectionOverrides["default-opt-in"]?.title ?? "Default Opt-In"}
                </h3>
                <p className="prose mt-4">
                  {sectionOverrides["default-opt-in"]?.content ?? `By providing your phone number through our website contact form, during a
                  phone call with our sales or support team, or by texting us directly, you
                  are giving International Computer Exchange consent to send you SMS text
                  messages related to your inquiry, account, services, and promotional
                  information. Message and data rates may apply depending on your carrier
                  plan. You may opt out at any time using any of the methods described below.`}
                </p>
              </div>

              {/* Opting Out */}
              <div id="opting-out" className="scroll-mt-24 border-b border-secondary py-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <MessageChatCircle aria-hidden="true" className="size-5 text-fg-brand-primary" />
                  {sectionOverrides["opting-out"]?.title ?? "Opting Out"}
                </h3>
                <p className="prose mt-4">
                  {sectionOverrides["opting-out"]?.content ?? "You can opt out of receiving SMS text messages from ICE at any time:"}
                </p>
                <ul className="mt-6 flex flex-col gap-5">
                  <li className="flex items-start gap-3">
                    <FeaturedIcon size="sm" color="brand" theme="light" icon={MessageChatCircle} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Reply STOP</p>
                      <p className="mt-0.5 text-sm text-tertiary">
                        Reply <span className="font-mono font-medium text-brand-secondary">STOP</span> to any
                        SMS message you receive from us.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FeaturedIcon size="sm" color="brand" theme="light" icon={Mail01} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Email Us</p>
                      <p className="mt-0.5 text-sm text-tertiary">
                        Send an email to{" "}
                        <a href="mailto:info@icesales.com" className="font-medium text-brand-secondary hover:underline">
                          info@icesales.com
                        </a>{" "}
                        with the subject &ldquo;SMS Opt-Out&rdquo;.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FeaturedIcon size="sm" color="brand" theme="light" icon={Phone01} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Call Us</p>
                      <p className="mt-0.5 text-sm text-tertiary">
                        Call{" "}
                        <a href="tel:18007869188" className="font-medium text-brand-secondary hover:underline">
                          1-800-786-9188
                        </a>{" "}
                        during business hours (9:00 AM &ndash; 5:00 PM ET).
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* How to Sign Up */}
              <div id="sign-up" className="scroll-mt-24 border-b border-secondary py-8">
                <h3 className="text-lg font-semibold text-primary">{sectionOverrides["sign-up"]?.title ?? "How You Can Sign Up"}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {[
                    { bold: "By phone:", text: "Provide verbal consent during a phone call with our team." },
                    { bold: "By texting us:", text: "Send a text message to our business number to initiate communication." },
                    { bold: "Via our website:", text: "Check the SMS consent checkbox on our contact form or footer subscription form." },
                  ].map((item) => (
                    <li key={item.bold} className="flex items-start gap-3 text-sm text-tertiary">
                      <CheckCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                      <span>
                        <strong className="font-semibold text-primary">{item.bold}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frequency & Types */}
              <div id="frequency" className="scroll-mt-24 border-b border-secondary py-8">
                <h3 className="text-lg font-semibold text-primary">{sectionOverrides["frequency"]?.title ?? "Frequency & Types of Messages"}</h3>
                <p className="prose mt-4">{sectionOverrides["frequency"]?.content ?? "Message frequency varies. You may receive:"}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {[
                    "Responses to your inquiries or support requests",
                    "Service updates, appointment confirmations, or account notifications",
                    "Promotional offers, product announcements, or newsletters",
                    "Follow-up communications related to ongoing projects",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-tertiary">
                      <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-brand-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-tertiary">
                  Standard message and data rates may apply. Carriers are not liable for delayed or undelivered messages.
                </p>
              </div>

              {/* Carrier Compliance */}
              <div id="carrier" className="scroll-mt-24 border-b border-secondary py-8">
                <h3 className="text-lg font-semibold text-primary">{sectionOverrides["carrier"]?.title ?? "Carrier Compliance"}</h3>
                <p className="prose mt-4">
                  {sectionOverrides["carrier"]?.content ?? `Our SMS messaging program is compliant with carrier requirements and industry
                  best practices. We use RingCentral as our messaging platform. Carriers
                  supported include but are not limited to AT&T, Verizon, T-Mobile, Sprint,
                  and other major US carriers.`}
                </p>
              </div>

              {/* Questions */}
              <div id="questions" className="scroll-mt-24 py-8">
                <h3 className="text-lg font-semibold text-primary">{sectionOverrides["questions"]?.title ?? "Questions?"}</h3>
                <p className="prose mt-4">
                  {sectionOverrides["questions"]?.content ?? "If you have any questions about our SMS messaging practices, please contact us:"}
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-tertiary">
                  <p className="font-medium text-secondary">International Computer Exchange, Inc.</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:info@icesales.com" className="font-medium text-brand-secondary hover:underline">
                      info@icesales.com
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a href="tel:18007869188" className="font-medium text-brand-secondary hover:underline">
                      1-800-786-9188
                    </a>
                  </p>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col items-center gap-6 border-t border-secondary pt-8 print:hidden">
                <Button color="secondary" size="lg" iconLeading={Download01} onClick={() => window.print()}>
                  Download as PDF
                </Button>
                <p className="text-sm text-tertiary">
                  Related:{" "}
                  <Link
                    href="/terms-of-service"
                    className="inline-flex items-center gap-1 font-medium text-brand-secondary hover:underline"
                  >
                    Terms of Service
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
