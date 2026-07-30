"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

const STORAGE_KEY = "ice-portal-onboarding-v1";

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  doneHint: string;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "profile",
    label: "Confirm your profile details",
    href: "/portal/profile",
    doneHint: "Profile reviewed",
  },
  {
    id: "contacts",
    label: "Review company contacts",
    href: "/portal/contacts",
    doneHint: "Contacts checked",
  },
  {
    id: "surveys",
    label: "Complete any open surveys",
    href: "/portal/surveys",
    doneHint: "Surveys visited",
  },
  {
    id: "resources",
    label: "Browse your document center",
    href: "/portal/resources",
    doneHint: "Resources opened",
  },
];

/**
 * Portal onboarding checklist (#54) — first-login guided tasks (local progress).
 */
export default function PortalOnboarding({
  userName,
  hasActiveSurveys,
}: {
  userName?: string;
  hasActiveSurveys?: boolean;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { done?: Record<string, boolean>; dismissed?: boolean };
        setDone(parsed.done ?? {});
        setDismissed(Boolean(parsed.dismissed));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = (nextDone: Record<string, boolean>, nextDismissed = dismissed) => {
    setDone(nextDone);
    setDismissed(nextDismissed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ done: nextDone, dismissed: nextDismissed }));
    } catch {
      /* ignore */
    }
  };

  const mark = (id: string) => {
    persist({ ...done, [id]: true });
  };

  const visibleItems = ITEMS.filter((item) => (item.id === "surveys" ? hasActiveSurveys !== false : true));
  const completedCount = visibleItems.filter((item) => done[item.id]).length;
  const allDone = completedCount === visibleItems.length;

  if (!hydrated || dismissed || allDone) return null;

  return (
    <div className="mb-8 rounded-2xl bg-brand-primary_alt p-5 ring-1 ring-brand/30 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-md font-semibold text-primary">
            {userName ? `Welcome, ${userName} — get set up` : "Get set up in the portal"}
          </h2>
          <p className="mt-1 text-sm text-tertiary">
            {completedCount}/{visibleItems.length} complete · Finish these once to unlock the full workspace.
          </p>
        </div>
        <Button size="sm" color="tertiary" onClick={() => persist(done, true)}>
          Dismiss
        </Button>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {visibleItems.map((item) => {
          const isDone = Boolean(done[item.id]);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={() => mark(item.id)}
                className={cx(
                  "flex items-center gap-3 rounded-xl bg-primary px-4 py-3 ring-1 ring-secondary transition hover:ring-brand",
                  isDone && "opacity-70",
                )}
              >
                <CheckCircle
                  className={cx(
                    "size-5 shrink-0",
                    isDone ? "text-fg-success-primary" : "text-fg-quaternary",
                  )}
                />
                <span className="flex-1 text-sm font-semibold text-primary">
                  {isDone ? item.doneHint : item.label}
                </span>
                <ArrowRight className="size-4 text-fg-quaternary" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
