"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import {
  DEFAULT_MARKETING_PREFERENCES,
  MARKETING_PREFERENCE_KEYS,
  type MarketingPreferenceKey,
  type MarketingPreferences,
} from "@/lib/marketing/preferences";

export interface SubscribeFormCopy {
  eyebrow?: string;
  headline?: string;
  description?: string;
  fields?: {
    name_label?: string;
    email_label?: string;
    phone_label?: string;
  };
  preference_heading?: string;
  preference_description?: string;
  preference_types?: Array<{
    key?: string;
    label?: string;
    description?: string;
  }>;
  submit_label?: string;
}

export interface SubscribeSuccessCopy {
  headline?: string;
  description?: string;
  preference_link_label?: string;
}

export interface SubscribeMessageCopy {
  save_error?: string;
  network_error?: string;
}

export interface SubscribeConsentCopy {
  prefix?: string;
  privacy_label?: string;
  privacy_href?: string;
  suffix?: string;
}

const fieldClass =
  "mt-2 w-full rounded-lg bg-primary px-3.5 py-3 text-sm text-primary ring-1 ring-secondary outline-none transition focus:ring-2 focus:ring-brand";

function isPreferenceKey(value: unknown): value is MarketingPreferenceKey {
  return typeof value === "string" && MARKETING_PREFERENCE_KEYS.includes(value as MarketingPreferenceKey);
}

export function SubscriptionPreferenceForm({
  form,
  successCopy,
  messages,
  consent,
}: {
  form: SubscribeFormCopy | null;
  successCopy: SubscribeSuccessCopy | null;
  messages: SubscribeMessageCopy | null;
  consent: SubscribeConsentCopy | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState<MarketingPreferences>(DEFAULT_MARKETING_PREFERENCES);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preferenceUrl, setPreferenceUrl] = useState("");

  const preferenceTypes = (Array.isArray(form?.preference_types) ? form.preference_types : []).filter(
    (item): item is { key: MarketingPreferenceKey; label?: string; description?: string } =>
      isPreferenceKey(item?.key),
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, preferences }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState("error");
        setMessage(messages?.save_error ?? "");
        return;
      }
      setPreferenceUrl(typeof result.preferenceUrl === "string" ? result.preferenceUrl : "");
      setState("success");
    } catch {
      setState("error");
      setMessage(messages?.network_error ?? messages?.save_error ?? "");
    }
  };

  if (!form) return null;

  if (state === "success") {
    if (!successCopy) return null;
    return (
      <div className="rounded-2xl bg-primary p-8 shadow-lg ring-1 ring-secondary sm:p-10">
        <CheckCircle aria-hidden="true" className="size-10 text-fg-success-primary" />
        {successCopy.headline && (
          <h1 className="mt-5 text-display-xs font-semibold text-primary">{successCopy.headline}</h1>
        )}
        {successCopy.description && (
          <p className="mt-3 text-md leading-7 text-tertiary">{successCopy.description}</p>
        )}
        {preferenceUrl && successCopy.preference_link_label && (
          <Link
            href={preferenceUrl}
            className="mt-6 inline-flex text-sm font-semibold text-brand-secondary hover:underline"
          >
            {successCopy.preference_link_label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-primary text-fg-brand-primary">
          <Mail01 aria-hidden="true" className="size-5" />
        </span>
        <div>
          {form.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">
              {form.eyebrow}
            </p>
          )}
          {form.headline && <h1 className="mt-1 text-xl font-semibold text-primary">{form.headline}</h1>}
        </div>
      </div>
      {form.description && <p className="mt-5 text-sm leading-6 text-tertiary">{form.description}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-secondary">
          {form.fields?.name_label}
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            autoComplete="name"
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          {form.fields?.email_label}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            autoComplete="email"
          />
        </label>
        <label className="text-sm font-medium text-secondary sm:col-span-2">
          {form.fields?.phone_label}
          <input
            required
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
            autoComplete="tel"
          />
        </label>
      </div>

      <fieldset className="mt-7">
        {form.preference_heading && (
          <legend className="text-sm font-semibold text-primary">{form.preference_heading}</legend>
        )}
        {form.preference_description && (
          <p className="mt-1 text-xs leading-5 text-tertiary">{form.preference_description}</p>
        )}
        {preferenceTypes.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {preferenceTypes.map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
              >
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={(event) =>
                    setPreferences((current) => ({ ...current, [item.key]: event.target.checked }))
                  }
                  className="mt-1 size-4 accent-brand-solid"
                />
                <span>
                  {item.label && <strong className="block text-sm font-semibold text-primary">{item.label}</strong>}
                  {item.description && (
                    <span className="mt-1 block text-xs leading-5 text-tertiary">{item.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {message && <p role="alert" className="mt-4 text-sm text-error-primary">{message}</p>}
      {form.submit_label && (
        <Button type="submit" size="lg" className="mt-7 w-full" isLoading={state === "loading"}>
          {form.submit_label}
        </Button>
      )}
      {consent && (consent.prefix || (consent.privacy_label && consent.privacy_href) || consent.suffix) && (
        <p className="mt-4 text-center text-xs leading-5 text-quaternary">
          {consent.prefix}
          {consent.prefix && consent.privacy_label && consent.privacy_href ? " " : null}
          {consent.privacy_label && consent.privacy_href && (
            <Link href={consent.privacy_href} className="text-brand-secondary hover:underline">
              {consent.privacy_label}
            </Link>
          )}
          {consent.suffix}
        </p>
      )}
    </form>
  );
}
