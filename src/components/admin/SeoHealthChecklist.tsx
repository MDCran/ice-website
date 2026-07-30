"use client";

import { AlertCircle, CheckCircle, InfoCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { SeoFormValues } from "@/app/admin/(dashboard)/seo/SeoSettingsClient";

interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
}

/**
 * SEO workspace health checklist (#38) — live score from current form values.
 */
export default function SeoHealthChecklist({ values }: { values: SeoFormValues }) {
  const checks: CheckItem[] = [
    {
      id: "title",
      label: "Default title set",
      ok: values.default_title.trim().length >= 10,
      hint: "Aim for a clear brand + offer title.",
    },
    {
      id: "desc",
      label: "Default description ≤155 chars",
      ok:
        values.default_description.trim().length > 40 &&
        values.default_description.trim().length <= 155,
      hint: `Currently ${values.default_description.trim().length} characters.`,
    },
    {
      id: "og",
      label: "Default Open Graph image",
      ok: Boolean(values.default_og_image.trim()),
      hint: "Used when pages lack a custom OG image.",
    },
    {
      id: "org",
      label: "Organization phone + email",
      ok: Boolean(values.telephone.trim() && values.email.trim()),
    },
    {
      id: "address",
      label: "LocalBusiness address complete",
      ok: Boolean(
        values.street_address.trim() &&
          values.address_locality.trim() &&
          values.address_region.trim() &&
          values.postal_code.trim(),
      ),
    },
    {
      id: "analytics",
      label: "GTM or GA4 configured",
      ok: Boolean(values.gtm_id.trim() || values.ga4_id.trim()),
      hint: "Optional in CMS; env vars also work.",
    },
    {
      id: "verify",
      label: "Search Console verification string",
      ok: Boolean(values.google_verification.trim() || values.bing_verification.trim()),
    },
    {
      id: "scrapers",
      label: "Training-scraper policy decided",
      ok: typeof values.block_training_scrapers === "boolean",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  return (
    <div className="rounded-xl bg-secondary p-5 ring-1 ring-secondary">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">SEO health</h2>
          <p className="mt-1 text-xs text-tertiary">
            {passed}/{checks.length} checks passing
          </p>
        </div>
        <span
          className={cx(
            "rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
            score >= 80
              ? "bg-success-secondary text-success-primary"
              : score >= 50
                ? "bg-warning-secondary text-warning-primary"
                : "bg-error-secondary text-error-primary",
          )}
        >
          {score}%
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-sm">
            {c.ok ? (
              <CheckCircle className="mt-0.5 size-4 shrink-0 text-fg-success-primary" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" />
            )}
            <span>
              <span className={cx("font-medium", c.ok ? "text-secondary" : "text-primary")}>
                {c.label}
              </span>
              {c.hint && !c.ok && (
                <span className="mt-0.5 flex items-center gap-1 text-xs text-tertiary">
                  <InfoCircle className="size-3" />
                  {c.hint}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
