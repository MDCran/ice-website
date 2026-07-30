"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { pushEvent } from "@/lib/analytics";
import type { SalesEnablementConfig } from "@/lib/salesEnablement";
import { cx } from "@/utils/cx";

type BriefingConfig = SalesEnablementConfig["briefingForm"];

type SubmitStatus = "idle" | "loading" | "success" | "error";

function readAttribution() {
  if (typeof window === "undefined") {
    return {
      pagePath: "",
      referrer: "",
      utm: {},
    };
  }

  const search = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].flatMap((key) => {
      const value = search.get(key)?.trim();
      return value ? [[key, value]] : [];
    }),
  );

  return {
    pagePath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer,
    utm,
  };
}

export function EnterpriseBriefingForm({
  config,
  className,
}: {
  config: BriefingConfig;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [priority, setPriority] = useState("");
  const [timeline, setTimeline] = useState("");
  const [context, setContext] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const attribution = readAttribution();
    const message = [
      "Enterprise executive briefing request.",
      `Priority: ${priority}`,
      `Decision timeline: ${timeline}`,
      context.trim() ? `Additional context: ${context.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          service: config.serviceValue,
          message,
          smsConsent: false,
          website,
          formKey: "enterprise_briefing",
          source: "enterprise_briefing",
          pagePath: attribution.pagePath,
          referrer: attribution.referrer,
          utm: attribution.utm,
          qualification: {
            priority,
            timeline,
            company,
          },
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Unable to submit the briefing request. Please try again.");
      }

      pushEvent("contact_submitted", {
        form: "enterprise_briefing",
        service: config.serviceValue,
        priority,
        timeline,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to submit the briefing request. Please try again.",
      );
    }
  };

  return (
    <section
      id="executive-briefing"
      aria-labelledby="executive-briefing-heading"
      className={cx("scroll-mt-24 bg-secondary py-16 md:py-24", className)}
    >
      <div className="mx-auto grid max-w-container gap-10 px-4 md:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">
            {config.eyebrow}
          </p>
          <h2
            id="executive-briefing-heading"
            className="mt-3 max-w-xl text-display-sm font-semibold tracking-tight text-primary md:text-display-md"
          >
            {config.heading}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-tertiary">{config.description}</p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-secondary ring-1 ring-secondary">
            <CheckCircle className="size-4 text-fg-success-primary" aria-hidden="true" />
            {config.responsePromise}
          </div>
        </div>

        <div className="rounded-3xl bg-primary p-6 shadow-xl ring-1 ring-secondary sm:p-8">
          {status === "success" ? (
            <div role="status" aria-live="polite" className="flex min-h-80 flex-col items-start justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-success-primary text-fg-success-primary">
                <CheckCircle className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-display-xs font-semibold text-primary">{config.successHeading}</h3>
              <p className="mt-3 max-w-xl text-md leading-7 text-tertiary">{config.successDescription}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
                <label htmlFor="enterprise-briefing-website">Website</label>
                <input
                  id="enterprise-briefing-website"
                  name="website"
                  type="text"
                  value={website}
                  onChange={(event) => setWebsite(event.currentTarget.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <Input
                isRequired
                size="lg"
                label="Full name"
                autoComplete="name"
                value={name}
                onChange={setName}
              />
              <Input
                isRequired
                size="lg"
                type="email"
                label="Work email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
              />
              <Input
                isRequired
                size="lg"
                label="Company"
                autoComplete="organization"
                value={company}
                onChange={setCompany}
              />
              <Input
                size="lg"
                type="tel"
                label="Direct phone"
                autoComplete="tel"
                value={phone}
                onChange={setPhone}
              />
              <NativeSelect
                required
                size="lg"
                label="Primary priority"
                value={priority}
                onChange={(event) => setPriority(event.currentTarget.value)}
                options={[
                  { label: "Select a priority", value: "", disabled: true },
                  ...config.priorities.map((item) => ({ label: item, value: item })),
                ]}
              />
              <NativeSelect
                required
                size="lg"
                label="Decision timeline"
                value={timeline}
                onChange={(event) => setTimeline(event.currentTarget.value)}
                options={[
                  { label: "Select a timeline", value: "", disabled: true },
                  ...config.timelines.map((item) => ({ label: item, value: item })),
                ]}
              />
              <TextArea
                className="sm:col-span-2"
                size="md"
                label="Current environment and decision context"
                placeholder="Platforms, locations, constraints, recovery targets, or procurement requirements"
                rows={5}
                value={context}
                onChange={setContext}
              />

              {status === "error" && (
                <p
                  role="alert"
                  className="flex items-start gap-2 text-sm text-error-primary sm:col-span-2"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-quaternary">{config.responsePromise}</p>
                <Button
                  type="submit"
                  size="xl"
                  iconTrailing={Send01}
                  isLoading={status === "loading"}
                  showTextWhileLoading
                  className="justify-center"
                >
                  {status === "loading" ? "Sending…" : config.submitLabel}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
