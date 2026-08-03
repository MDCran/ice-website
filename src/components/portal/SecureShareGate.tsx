"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, File02, Lock01, Clock } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export interface ShareMeta {
  title?: string;
  kind: "resource";
  expiresAt?: string | null;
  requiresPassword?: boolean;
  watermark?: boolean;
  viewCount?: number | null;
}

/**
 * Client UI for secure share links (#53) — expiry messaging, optional password gate,
 * watermark notice. Server still enforces account membership.
 */
export default function SecureShareGate({
  meta,
  onUnlock,
  children,
}: {
  meta: ShareMeta;
  /** Called after a password is entered (hash check happens server-side via action/API). */
  onUnlock?: (password: string) => Promise<{ ok: boolean; error?: string }>;
  children?: React.ReactNode;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(!meta.requiresPassword);
  const [loading, setLoading] = useState(false);

  const expired = useMemo(() => {
    if (!meta.expiresAt) return false;
    const t = Date.parse(meta.expiresAt);
    return !Number.isNaN(t) && t < Date.now();
  }, [meta.expiresAt]);

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FeaturedIcon color="warning" theme="light" size="xl" icon={Clock} className="mb-4" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Link expired</h2>
        <p className="mb-6 max-w-md text-md text-tertiary">
          This share link is no longer valid. Ask your ICE administrator for a new link.
        </p>
        <Button href="/portal" size="md">
          Back to portal
        </Button>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-md flex-col py-16">
        <FeaturedIcon color="brand" theme="light" size="lg" icon={Lock01} className="mb-4" />
        <h2 className="text-xl font-semibold text-primary">Password required</h2>
        <p className="mt-2 text-sm text-tertiary">
          Enter the password provided with this shared {meta.kind} to continue.
        </p>
        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            if (!onUnlock) {
              setUnlocked(true);
              return;
            }
            setLoading(true);
            setError("");
            const result = await onUnlock(password);
            setLoading(false);
            if (result.ok) setUnlocked(true);
            else setError(result.error ?? "Incorrect password");
          }}
        >
          <Input
            type="password"
            label="Share password"
            value={password}
            onChange={setPassword}
            isRequired
          />
          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error-primary">
              <AlertTriangle className="size-4" />
              {error}
            </p>
          )}
          <Button type="submit" size="lg" isLoading={loading}>
            Unlock
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm text-tertiary ring-1 ring-secondary">
        <File02 className="size-4 shrink-0 text-fg-brand-primary" />
        <span className="font-medium text-secondary">{meta.title ?? "Shared document"}</span>
        {meta.expiresAt && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            Expires {new Date(meta.expiresAt).toLocaleString()}
          </span>
        )}
        {meta.watermark && <span>Watermarked download</span>}
        {typeof meta.viewCount === "number" && <span>{meta.viewCount} views</span>}
        <Link href="/portal" className="ml-auto font-semibold text-brand-secondary hover:underline">
          Portal home
        </Link>
      </div>
      {children}
    </div>
  );
}
