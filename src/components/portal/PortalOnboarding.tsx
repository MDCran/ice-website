"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

const STORAGE_KEY = "ice-portal-onboarding-v1";

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  doneHint: string;
  cta: string;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "profile",
    label: "Confirm your profile details",
    href: "/portal/profile",
    doneHint: "Profile reviewed",
    cta: "Confirm profile details",
  },
  {
    id: "contacts",
    label: "Review company contacts",
    href: "/portal/contacts",
    doneHint: "Contacts checked",
    cta: "Review company contacts",
  },
  {
    id: "resources",
    label: "Browse your document center",
    href: "/portal/resources",
    doneHint: "Resources opened",
    cta: "Open document center",
  },
];

export default function PortalOnboarding({ userName }: { userName?: string }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          done?: Record<string, boolean>;
          dismissed?: boolean;
        };
        setDone(parsed.done ?? {});
        setDismissed(Boolean(parsed.dismissed));
      }
    } catch {
      /* Ignore malformed local progress. */
    }
    setHydrated(true);
  }, []);

  const persist = (
    nextDone: Record<string, boolean>,
    nextDismissed = dismissed,
  ) => {
    setDone(nextDone);
    setDismissed(nextDismissed);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ done: nextDone, dismissed: nextDismissed }),
      );
    } catch {
      /* Ignore storage failures. */
    }
  };

  const mark = (id: string) => {
    persist({ ...done, [id]: true });
  };

  const completedCount = ITEMS.filter((item) => done[item.id]).length;
  const allDone = completedCount === ITEMS.length;

  if (!hydrated || dismissed) return null;

  if (allDone) {
    return (
      <div className="mb-8 rounded-2xl bg-success-secondary p-5 ring-1 ring-success/30 md:p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-6 shrink-0 text-fg-success-primary" />
          <div>
            <h2 className="text-md font-semibold text-primary">
              Workspace setup complete
            </h2>
            <p className="mt-1 text-sm text-tertiary">
              You’re ready to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nextItem = ITEMS.find((item) => !done[item.id]);
  const progress = Math.round((completedCount / ITEMS.length) * 100);

  return (
    <div className="mb-8 rounded-2xl bg-brand-primary_alt p-5 ring-1 ring-brand/30 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-md font-semibold text-primary">
            {userName
              ? `Welcome, ${userName} — get set up`
              : "Get set up in the portal"}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tertiary">
            <span>{completedCount}/{ITEMS.length} complete</span>
            <span
              aria-hidden="true"
              className="hidden size-1 rounded-full bg-fg-quaternary sm:block"
            />
            <span>
              Complete these 3 quick steps to unlock your full workspace.
            </span>
            <span className="font-medium text-secondary">About 3 minutes</span>
          </div>
        </div>
        <Button size="sm" color="tertiary" onClick={() => persist(done, true)}>
          Remind me later
        </Button>
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary/60"
        role="progressbar"
        aria-label={`${completedCount} of ${ITEMS.length} steps complete`}
        aria-valuemin={0}
        aria-valuemax={ITEMS.length}
        aria-valuenow={completedCount}
      >
        <div
          className="h-full rounded-full bg-brand-solid transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {ITEMS.map((item, index) => {
          const isDone = Boolean(done[item.id]);
          const isCurrent = item.id === nextItem?.id;

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={() => mark(item.id)}
                aria-current={isCurrent ? "step" : undefined}
                className={cx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3.5 ring-1 transition duration-150 hover:-translate-y-px hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2",
                  isCurrent
                    ? "bg-primary ring-brand shadow-sm hover:ring-brand-solid"
                    : "bg-primary/75 ring-secondary hover:ring-brand",
                  isDone && "opacity-75",
                )}
              >
                {isDone ? (
                  <CheckCircle className="size-5 shrink-0 text-fg-success-primary" />
                ) : (
                  <span
                    className={cx(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                      isCurrent
                        ? "animate-spin border-brand border-t-transparent text-brand-solid"
                        : "border-fg-quaternary text-fg-quaternary",
                    )}
                    aria-label={isCurrent ? "In progress" : "Not started"}
                  >
                    <span
                      className={
                        isCurrent
                          ? "animate-[spin_1.5s_linear_infinite_reverse]"
                          : undefined
                      }
                    >
                      {index + 1}
                    </span>
                  </span>
                )}
                <span className="flex-1 text-sm font-semibold text-primary">
                  {isDone ? item.doneHint : item.label}
                </span>
                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-solid px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition group-hover:brightness-105">
                    {item.cta}
                    <ArrowRight className="size-4" />
                  </span>
                ) : (
                  <ArrowRight className="size-5 text-fg-quaternary transition group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
