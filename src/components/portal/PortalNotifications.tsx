"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell01, BankNote01, ClipboardCheck, File02, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface PortalNotice {
  id: string;
  title: string;
  href: string;
  kind: "survey" | "resource" | "billing";
  external?: boolean;
}

/**
 * Portal notifications center — aggregates open surveys and new resources.
 */
export default function PortalNotifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: cu } = await supabase
          .from("client_users")
          .select("client_account_id")
          .eq("id", user.id)
          .single();
        if (!cu) return;

        const accountId = cu.client_account_id;
        const [surveys, resources, account] = await Promise.all([
          supabase
            .from("surveys")
            .select("id, title")
            .eq("client_account_id", accountId)
            .eq("status", "active")
            .limit(5),
          supabase
            .from("client_resources")
            .select("id, title, created_at")
            .eq("client_account_id", accountId)
            .eq("visibility", "published")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("client_accounts")
            .select("balance_due_cents, quickbooks_payment_url")
            .eq("id", accountId)
            .single(),
        ]);

        if (cancelled) return;
        const next: PortalNotice[] = [];
        if ((account.data?.balance_due_cents ?? 0) > 0) {
          next.push({
            id: "account-balance",
            title: "Balance due: review your account",
            href: account.data?.quickbooks_payment_url || "/portal/profile",
            kind: "billing",
            external: Boolean(account.data?.quickbooks_payment_url),
          });
        }
        for (const s of surveys.data ?? []) {
          next.push({
            id: `survey-${s.id}`,
            title: `Survey due: ${s.title ?? "Untitled"}`,
            href: `/portal/surveys/${s.id}`,
            kind: "survey",
          });
        }
        for (const res of resources.data ?? []) {
          next.push({
            id: `resource-${res.id}`,
            title: `Document: ${res.title ?? "Untitled"}`,
            href: "/portal/resources",
            kind: "resource",
          });
        }
        setItems(next.slice(0, 8));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const iconFor = (kind: PortalNotice["kind"]) => {
    if (kind === "survey") return ClipboardCheck;
    if (kind === "billing") return BankNote01;
    return File02;
  };

  return (
    <div className="relative">
      <Button
        color="tertiary"
        size="sm"
        iconLeading={Bell01}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(items.length > 0 && "text-fg-brand-primary")}
      />
      {items.length > 0 && (
        <span className="absolute top-1 right-1 size-2 rounded-full bg-fg-brand-primary" aria-hidden="true" />
      )}

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
            <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
              <p className="text-sm font-semibold text-primary">Notifications</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 text-fg-quaternary hover:bg-secondary">
                <XClose className="size-4" />
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {loading && (
                <li className="px-4 py-6 text-center text-sm text-tertiary">Loading…</li>
              )}
              {!loading && items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-tertiary">You&apos;re all caught up.</li>
              )}
              {items.map((item) => {
                const Icon = iconFor(item.kind);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-secondary"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-fg-brand-primary" />
                      <span className="text-secondary">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
