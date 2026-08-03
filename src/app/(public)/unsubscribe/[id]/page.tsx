"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { MARKETING_PREFERENCE_KEYS, MARKETING_PREFERENCE_LABELS, DEFAULT_MARKETING_PREFERENCES, type MarketingPreferences } from "@/lib/marketing/preferences";

const fieldClass = "mt-2 w-full rounded-lg bg-primary px-3.5 py-3 text-sm text-primary ring-1 ring-secondary outline-none focus:ring-2 focus:ring-brand";

export default function UnsubscribePage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<MarketingPreferences>(DEFAULT_MARKETING_PREFERENCES);
  const [state, setState] = useState<"loading" | "ready" | "saved" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/marketing/preferences?id=${encodeURIComponent(params.id)}`, { cache: "no-store" }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setState("error"); setMessage(result.error || "This preference link is no longer available."); return; }
      const contact = result.contact;
      setName([contact.first_name, contact.last_name].filter(Boolean).join(" "));
      setEmail(contact.email || ""); setPhone(contact.phone || ""); setPreferences(contact.marketing_preferences || DEFAULT_MARKETING_PREFERENCES); setState("ready");
    }).catch(() => { setState("error"); setMessage("We could not load your preferences."); });
  }, [params.id]);

  const save = async () => {
    setState("loading");
    const response = await fetch("/api/marketing/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: params.id, name, phone, preferences }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setState("error"); setMessage(result.error || "We could not update your preferences."); return; }
    setState("saved");
  };

  const unsubscribeAll = () => setPreferences(Object.fromEntries(MARKETING_PREFERENCE_KEYS.map((key) => [key, false])) as MarketingPreferences);

  return <main className="flex min-h-[70vh] items-center justify-center bg-secondary px-4 py-16"><div className="w-full max-w-2xl rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary sm:p-9">{state === "error" ? <><Mail01 className="size-10 text-fg-brand-primary" /><h1 className="mt-5 text-display-xs font-semibold text-primary">Email preferences</h1><p className="mt-3 text-md text-error-primary">{message}</p></> : state === "saved" ? <><CheckCircle className="size-10 text-fg-success-primary" /><h1 className="mt-5 text-display-xs font-semibold text-primary">Preferences updated</h1><p className="mt-3 text-md leading-7 text-tertiary">Your choices are saved. Messages will follow the categories you selected.</p></> : <><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-brand-primary text-fg-brand-primary"><Mail01 className="size-5" /></span><div><p className="text-xs font-semibold tracking-[0.18em] text-brand-secondary uppercase">ICE communications</p><h1 className="mt-1 text-xl font-semibold text-primary">Manage email preferences</h1></div></div><p className="mt-5 text-sm leading-6 text-tertiary">Update your details and choose which types of messages you want to receive.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-secondary">Name<input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" /></label><label className="text-sm font-medium text-secondary">Email<input value={email} readOnly className={`${fieldClass} cursor-not-allowed opacity-70`} /></label><label className="text-sm font-medium text-secondary sm:col-span-2">Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} autoComplete="tel" /></label></div><fieldset className="mt-7"><legend className="text-sm font-semibold text-primary">Message types</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{MARKETING_PREFERENCE_KEYS.map((key) => { const item = MARKETING_PREFERENCE_LABELS[key]; return <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary"><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="mt-1 size-4 accent-brand-solid" /><span><strong className="block text-sm font-semibold text-primary">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-tertiary">{item.description}</span></span></label>; })}</div></fieldset><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={save} isLoading={state === "loading"}>Save preferences</Button><Button size="lg" color="secondary" onClick={unsubscribeAll}>Unsubscribe from all</Button></div></>}</div><div className="absolute bottom-6"><Link href="/" className="text-sm font-semibold text-brand-secondary hover:underline">Return to ICE</Link></div></main>;
}
