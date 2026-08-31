"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { ArrowRight, SearchLg } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import {
  BUYER_FAQS,
  getBuyerFaqAnchor,
  getBuyerFaqHref,
} from "@/lib/buyerFaqs";
import type { CmsFaqItem } from "@/lib/cms/faqContent";

interface CmsLink {
  label?: string;
  href?: string;
}

interface CmsCopy {
  eyebrow?: string;
  label?: string;
  headline?: string;
  heading?: string;
  subheadline?: string;
  description?: string;
  search_label?: string;
  search_placeholder?: string;
  result_label?: string;
  result_label_singular?: string;
  result_label_plural?: string;
  empty_message?: string;
  cta_primary?: CmsLink;
  cta_secondary?: CmsLink;
  ctaPrimary?: CmsLink;
  ctaSecondary?: CmsLink;
  cta?: CmsLink;
}

export interface FaqHubProps {
  items?: CmsFaqItem[];
  hero?: CmsCopy;
  faqSection?: CmsCopy;
  cta?: CmsCopy | null;
  showHero?: boolean;
  showFaqs?: boolean;
  showCta?: boolean;
}

export function FaqPreview({
  eyebrow = "Buyer FAQ",
  heading = "Questions buyers ask first",
  linkLabel = "Search all FAQs",
  linkHref = "/faq",
  items,
}: {
  eyebrow?: string;
  heading?: string;
  linkLabel?: string;
  linkHref?: string;
  items?: Array<{ id?: string; question: string; href?: string }>;
}) {
  const previewItems: Array<{ id?: string; question: string; href?: string }> = items === undefined
    ? BUYER_FAQS.map((faq) => ({ id: faq.id, question: faq.question }))
    : items;
  return (
    <section className="border-t border-secondary bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">{eyebrow}</span>
            <h2 className="mt-3 text-display-xs font-semibold text-primary md:text-display-sm">{heading}</h2>
          </div>
          <Link href={linkHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
            {linkLabel} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {previewItems.map((faq, index) => (
            <Link
              key={faq.id ?? `${faq.question}-${index}`}
              href={faq.href ?? (faq.id ? getBuyerFaqHref(faq.id) : linkHref)}
              scroll={false}
              className="group flex items-start justify-between gap-4 border-b border-secondary py-3 text-sm font-semibold text-primary hover:text-brand-secondary"
            >
              {faq.question}
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-fg-quaternary group-hover:text-fg-brand-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FaqHub({
  items = BUYER_FAQS,
  hero = {},
  faqSection = {},
  cta = null,
  showHero = true,
  showFaqs = true,
  showCta = true,
}: FaqHubProps) {
  const [query, setQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set());

  const heroEyebrow = hero.eyebrow ?? hero.label ?? "Knowledge hub";
  const heroHeading = hero.headline ?? hero.heading ?? "Frequently asked questions";
  const heroDescription =
    hero.subheadline ??
    hero.description ??
    "Search practical answers about platforms, recovery, operations, and engaging ICE.";
  const searchLabel =
    faqSection.search_label ?? hero.search_label ?? "Search frequently asked questions";
  const searchPlaceholder =
    faqSection.search_placeholder ??
    hero.search_placeholder ??
    "Search IBM i, RPO, Azure, response time…";
  const secondaryCtaLabel = cta?.cta_secondary?.label ?? cta?.ctaSecondary?.label;
  const secondaryCtaHref = cta?.cta_secondary?.href ?? cta?.ctaSecondary?.href;
  const primaryCtaLabel =
    cta?.cta_primary?.label ?? cta?.ctaPrimary?.label ?? cta?.cta?.label;
  const primaryCtaHref =
    cta?.cta_primary?.href ?? cta?.ctaPrimary?.href ?? cta?.cta?.href;

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    const revealHashTarget = () => {
      let anchor = "";
      try {
        anchor = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }

      const faq = items.find(
        (item) => getBuyerFaqAnchor(item.id) === anchor,
      );
      if (!faq) return;

      setQuery("");
      setOpenFaqIds((current) => {
        if (current.has(faq.id)) return current;
        const next = new Set(current);
        next.add(faq.id);
        return next;
      });

      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          const target = document.getElementById(
            getBuyerFaqAnchor(faq.id),
          ) as HTMLDetailsElement | null;
          if (!target) return;

          target.open = true;
          const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
          target.querySelector<HTMLElement>("summary")?.focus({
            preventScroll: true,
          });
        });
      });
    };

    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => {
      window.removeEventListener("hashchange", revealHashTarget);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [items]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((faq) =>
      `${faq.question} ${faq.answer}`.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  const handleToggle = (
    faqId: string,
    event: SyntheticEvent<HTMLDetailsElement>,
  ) => {
    const isOpen = event.currentTarget.open;
    setOpenFaqIds((current) => {
      const next = new Set(current);
      if (isOpen) {
        next.add(faqId);
      } else {
        next.delete(faqId);
      }
      return next;
    });
  };

  return (
    <main className="bg-primary">
      {showHero && <section className="border-b border-secondary bg-secondary py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          {heroEyebrow && (
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {heroEyebrow}
            </span>
          )}
          <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">
            {heroHeading}
          </h1>
          {heroDescription && <p className="mt-4 text-lg text-tertiary">{heroDescription}</p>}
          <label className="relative mx-auto mt-8 block max-w-xl">
            <span className="sr-only">{searchLabel}</span>
            <SearchLg className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-secondary bg-primary py-3 pr-4 pl-12 text-md text-primary shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>
      </section>}
      {showFaqs && <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <p className="mb-6 text-sm text-tertiary" aria-live="polite">
            {results.length}{" "}
            {results.length === 1
              ? (faqSection.result_label_singular ?? "answer")
              : (faqSection.result_label_plural ?? faqSection.result_label ?? "answers")}
          </p>
          <div className="space-y-4">
            {results.map((faq) => (
              <details
                key={faq.id}
                id={getBuyerFaqAnchor(faq.id)}
                open={openFaqIds.has(faq.id)}
                onToggle={(event) => handleToggle(faq.id, event)}
                aria-labelledby={`${getBuyerFaqAnchor(faq.id)}-question`}
                className="group scroll-mt-24 rounded-2xl bg-secondary p-5 ring-1 ring-secondary open:ring-brand/40"
              >
                <summary
                  id={`${getBuyerFaqAnchor(faq.id)}-question`}
                  aria-controls={`${getBuyerFaqAnchor(faq.id)}-answer`}
                  className="cursor-pointer list-none rounded-md pr-8 text-md font-semibold text-primary outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {faq.question}
                </summary>
                <div
                  id={`${getBuyerFaqAnchor(faq.id)}-answer`}
                  role="region"
                  aria-labelledby={`${getBuyerFaqAnchor(faq.id)}-question`}
                  className="mt-4 border-t border-secondary pt-4"
                >
                  <p className="text-md leading-relaxed text-tertiary">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
          {results.length === 0 && faqSection.empty_message && (
            <p className="rounded-2xl bg-secondary p-5 text-sm text-tertiary ring-1 ring-secondary">
              {faqSection.empty_message}
            </p>
          )}
        </div>
      </section>}

      {showCta && cta && (
        <section className="border-t border-secondary bg-secondary py-16 md:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center md:px-8">
            {(cta.eyebrow || cta.label) && (
              <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                {cta.eyebrow ?? cta.label}
              </span>
            )}
            {(cta.heading || cta.headline) && (
              <h2 className="mt-3 text-display-xs font-semibold text-primary md:text-display-sm">
                {cta.heading ?? cta.headline}
              </h2>
            )}
            {cta.description && <p className="mt-4 text-lg text-tertiary">{cta.description}</p>}
            <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
              {secondaryCtaLabel && secondaryCtaHref && (
                  <Button
                    color="secondary"
                    size="xl"
                    href={secondaryCtaHref}
                  >
                    {secondaryCtaLabel}
                  </Button>
                )}
              {primaryCtaLabel && primaryCtaHref && (
                  <Button
                    size="xl"
                    href={primaryCtaHref}
                    iconTrailing={ArrowRight}
                  >
                    {primaryCtaLabel}
                  </Button>
                )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
