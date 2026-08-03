"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { MARKETING_PREFERENCE_KEYS, MARKETING_PREFERENCE_LABELS, DEFAULT_MARKETING_PREFERENCES, type MarketingPreferences } from "@/lib/marketing/preferences";

const fieldClass = "mt-2 w-full rounded-lg bg-primary px-3.5 py-3 text-sm text-primary ring-1 ring-secondary outline-none transition focus:ring-2 focus:ring-brand";

export function SubscriptionPreferenceForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState<MarketingPreferences>(DEFAULT_MARKETING_PREFERENCES);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preferenceUrl, setPreferenceUrl] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading"); setMessage("");
    const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, phone, preferences }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setState("error"); setMessage(result.error || "We could not save your preferences."); return; }
    setPreferenceUrl(result.preferenceUrl || ""); setState("success");
  };

  if (state === "success") return (
    <div className="rounded-2xl bg-primary p-8 shadow-lg ring-1 ring-secondary sm:p-10">
      <CheckCircle className="size-10 text-fg-success-primary" />
      <h1 className="mt-5 text-display-xs font-semibold text-primary">Your preferences are saved</h1>
      <p className="mt-3 text-md leading-7 text-tertiary">You can change these choices at any time. We will only send the types of messages you selected.</p>
      {preferenceUrl && <Link href={preferenceUrl} className="mt-6 inline-flex text-sm font-semibold text-brand-secondary hover:underline">Open your preference center</Link>}
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary sm:p-8">
      <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-brand-primary text-fg-brand-primary"><Mail01 className="size-5" /></span><div><p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">ICE communications</p><h1 className="mt-1 text-xl font-semibold text-primary">Subscribe and manage email preferences</h1></div></div>
      <p className="mt-5 text-sm leading-6 text-tertiary">Tell us where to reach you, then choose exactly which messages you want. You can unsubscribe from every category below.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-secondary">Name<input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" /></label>
        <label className="text-sm font-medium text-secondary">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} autoComplete="email" /></label>
        <label className="text-sm font-medium text-secondary sm:col-span-2">Phone number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} autoComplete="tel" /></label>
      </div>
      <fieldset className="mt-7"><legend className="text-sm font-semibold text-primary">Choose your message types</legend><p className="mt-1 text-xs leading-5 text-tertiary">Toggle any category on or off. Required account or security notices may still be sent when needed to provide a service.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{MARKETING_PREFERENCE_KEYS.map((key) => { const item = MARKETING_PREFERENCE_LABELS[key]; return <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="mt-1 size-4 accent-brand-solid" /><span><strong className="block text-sm font-semibold text-primary">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-tertiary">{item.description}</span></span></label>; })}</div></fieldset>
      {message && <p role="alert" className="mt-4 text-sm text-error-primary">{message}</p>}
      <Button type="submit" size="lg" className="mt-7 w-full" isLoading={state === "loading"}>Save my preferences</Button>
      <p className="mt-4 text-center text-xs leading-5 text-quaternary">By submitting, you consent to the selected communications. <Link href="/privacy" className="text-brand-secondary hover:underline">Read our privacy notice</Link>.</p>
    </form>
  );
}
