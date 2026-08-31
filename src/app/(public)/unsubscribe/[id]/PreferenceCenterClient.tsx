"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import {
  DEFAULT_MARKETING_PREFERENCES,
  MARKETING_PREFERENCE_KEYS,
  type MarketingPreferenceKey,
  type MarketingPreferences,
} from "@/lib/marketing/preferences";

export interface PreferenceCenterCopy {
  eyebrow?: string;
  headline?: string;
  description?: string;
  loading_label?: string;
  error_heading?: string;
  fields?: { name_label?: string; email_label?: string; phone_label?: string };
  preference_heading?: string;
  preference_types?: Array<{ key?: string; label?: string; description?: string }>;
  save_label?: string;
  unsubscribe_all_label?: string;
  return_label?: string;
  return_href?: string;
}

export interface PreferenceCenterSuccessCopy {
  headline?: string;
  description?: string;
}

export interface PreferenceCenterMessageCopy {
  expired_error?: string;
  load_error?: string;
  update_error?: string;
  network_error?: string;
}

const fieldClass =
  "mt-2 w-full rounded-lg bg-primary px-3.5 py-3 text-sm text-primary ring-1 ring-secondary outline-none focus:ring-2 focus:ring-brand";

function isPreferenceKey(value: unknown): value is MarketingPreferenceKey {
  return typeof value === "string" && MARKETING_PREFERENCE_KEYS.includes(value as MarketingPreferenceKey);
}

export default function PreferenceCenterClient({
  id,
  content,
  successCopy,
  messages,
}: {
  id: string;
  content: PreferenceCenterCopy | null;
  successCopy: PreferenceCenterSuccessCopy | null;
  messages: PreferenceCenterMessageCopy | null;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<MarketingPreferences>(DEFAULT_MARKETING_PREFERENCES);
  const [state, setState] = useState<"loading" | "ready" | "saved" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/marketing/preferences?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          setState("error");
          setMessage(messages?.expired_error ?? "");
          return;
        }
        const contact = result.contact ?? {};
        setName([contact.first_name, contact.last_name].filter(Boolean).join(" "));
        setEmail(typeof contact.email === "string" ? contact.email : "");
        setPhone(typeof contact.phone === "string" ? contact.phone : "");
        setPreferences(contact.marketing_preferences ?? DEFAULT_MARKETING_PREFERENCES);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
        setMessage(messages?.load_error ?? "");
      });
    return () => controller.abort();
  }, [id, messages?.expired_error, messages?.load_error]);

  if (!content) return null;

  const preferenceTypes = (Array.isArray(content.preference_types) ? content.preference_types : []).filter(
    (item): item is { key: MarketingPreferenceKey; label?: string; description?: string } =>
      isPreferenceKey(item?.key),
  );

  const save = async () => {
    setState("loading");
    try {
      const response = await fetch("/api/marketing/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, phone, preferences }),
      });
      if (!response.ok) {
        setState("error");
        setMessage(messages?.update_error ?? "");
        return;
      }
      setState("saved");
    } catch {
      setState("error");
      setMessage(messages?.network_error ?? messages?.update_error ?? "");
    }
  };

  const unsubscribeAll = () =>
    setPreferences(
      Object.fromEntries(MARKETING_PREFERENCE_KEYS.map((key) => [key, false])) as MarketingPreferences,
    );

  return (
    <main className="relative flex min-h-[70vh] items-center justify-center bg-secondary px-4 py-16">
      <div className="w-full max-w-2xl rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary sm:p-9">
        {state === "error" ? (
          <>
            <Mail01 className="size-10 text-fg-brand-primary" />
            {content.error_heading && (
              <h1 className="mt-5 text-display-xs font-semibold text-primary">{content.error_heading}</h1>
            )}
            {message && <p className="mt-3 text-md text-error-primary">{message}</p>}
          </>
        ) : state === "saved" ? (
          successCopy && (
            <>
              <CheckCircle className="size-10 text-fg-success-primary" />
              {successCopy.headline && (
                <h1 className="mt-5 text-display-xs font-semibold text-primary">{successCopy.headline}</h1>
              )}
              {successCopy.description && (
                <p className="mt-3 text-md leading-7 text-tertiary">{successCopy.description}</p>
              )}
            </>
          )
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-primary text-fg-brand-primary">
                <Mail01 className="size-5" />
              </span>
              <div>
                {content.eyebrow && (
                  <p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">{content.eyebrow}</p>
                )}
                {content.headline && <h1 className="mt-1 text-xl font-semibold text-primary">{content.headline}</h1>}
              </div>
            </div>
            {state === "loading" && content.loading_label ? (
              <p className="mt-5 text-sm text-tertiary">{content.loading_label}</p>
            ) : (
              <>
                {content.description && <p className="mt-5 text-sm leading-6 text-tertiary">{content.description}</p>}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-secondary">
                    {content.fields?.name_label}
                    <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" />
                  </label>
                  <label className="text-sm font-medium text-secondary">
                    {content.fields?.email_label}
                    <input value={email} readOnly className={`${fieldClass} cursor-not-allowed opacity-70`} />
                  </label>
                  <label className="text-sm font-medium text-secondary sm:col-span-2">
                    {content.fields?.phone_label}
                    <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} autoComplete="tel" />
                  </label>
                </div>
                <fieldset className="mt-7">
                  {content.preference_heading && <legend className="text-sm font-semibold text-primary">{content.preference_heading}</legend>}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {preferenceTypes.map((item) => (
                      <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary">
                        <input
                          type="checkbox"
                          checked={preferences[item.key]}
                          onChange={(event) => setPreferences((current) => ({ ...current, [item.key]: event.target.checked }))}
                          className="mt-1 size-4 accent-brand-solid"
                        />
                        <span>
                          {item.label && <strong className="block text-sm font-semibold text-primary">{item.label}</strong>}
                          {item.description && <span className="mt-1 block text-xs leading-5 text-tertiary">{item.description}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {content.save_label && <Button size="lg" onClick={save}>{content.save_label}</Button>}
                  {content.unsubscribe_all_label && (
                    <Button size="lg" color="secondary" onClick={unsubscribeAll}>{content.unsubscribe_all_label}</Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {content.return_label && content.return_href && (
        <div className="absolute bottom-6">
          <Link href={content.return_href} className="text-sm font-semibold text-brand-secondary hover:underline">{content.return_label}</Link>
        </div>
      )}
    </main>
  );
}
