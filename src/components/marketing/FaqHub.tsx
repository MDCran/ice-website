"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { ArrowRight, SearchLg } from "@untitledui/icons";
import {
  BUYER_FAQS,
  getBuyerFaqAnchor,
  getBuyerFaqHref,
} from "@/lib/buyerFaqs";

export function FaqPreview({ heading = "Questions buyers ask first" }: { heading?: string }) {
  return (
    <section className="border-t border-secondary bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Buyer FAQ</span>
            <h2 className="mt-3 text-display-xs font-semibold text-primary md:text-display-sm">{heading}</h2>
          </div>
          <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
            Search all FAQs <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {BUYER_FAQS.map((faq) => (
            <Link
              key={faq.id}
              href={getBuyerFaqHref(faq.id)}
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

export default function FaqHub() {
  const [query, setQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set());

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

      const faq = BUYER_FAQS.find(
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
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return BUYER_FAQS;
    return BUYER_FAQS.filter((faq) =>
      `${faq.question} ${faq.answer}`.toLowerCase().includes(normalized),
    );
  }, [query]);

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
      <section className="border-b border-secondary bg-secondary py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Knowledge hub</span>
          <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-tertiary">Search practical answers about platforms, recovery, operations, and engaging ICE.</p>
          <label className="relative mx-auto mt-8 block max-w-xl">
            <span className="sr-only">Search frequently asked questions</span>
            <SearchLg className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search IBM i, RPO, Azure, response time…"
              className="w-full rounded-xl border border-secondary bg-primary py-3 pr-4 pl-12 text-md text-primary shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <p className="mb-6 text-sm text-tertiary" aria-live="polite">{results.length} answers</p>
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
        </div>
      </section>
    </main>
  );
}
