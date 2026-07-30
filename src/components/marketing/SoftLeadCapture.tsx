"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";

const STORAGE_KEY = "ice-soft-lead-dismissed";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Soft exit-intent / idle lead capture (#24).
 * Shows once per session after exit intent (desktop) or ~25s idle (mobile).
 */
export default function SoftLeadCapture({
  enabled = true,
  headline = "Want a free infrastructure assessment?",
  description = "Share your name, work email, and phone — an ICE specialist will follow up with next steps.",
}: {
  enabled?: boolean;
  headline?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const suppressed =
    !enabled ||
    pathname === "/contact" ||
    pathname?.startsWith("/solutions/find") ||
    pathname === "/sms-consent" ||
    pathname === "/terms-of-service";

  useEffect(() => {
    if (suppressed || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      pushEvent("soft_lead_shown", {});
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    const idleTimer = window.setTimeout(show, 28000);

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(idleTimer);
    };
  }, [suppressed]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    pushEvent("soft_lead_dismissed", {});
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setStatus("error");
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          service: "Free Assessment",
          message: "Soft lead capture — requested a free infrastructure assessment.",
          smsConsent: false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to submit. Please try again.");
      }
      pushEvent("contact_submitted", { form: "soft_lead", service: "Free Assessment" });
      setStatus("success");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-overlay/50 backdrop-blur-[2px]"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="soft-lead-title"
        className={cx(
          "relative w-full max-w-md rounded-2xl bg-primary p-6 shadow-2xl ring-1 ring-secondary",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 rounded-md p-1.5 text-fg-quaternary hover:bg-secondary hover:text-fg-secondary"
          aria-label="Close"
        >
          <XClose className="size-4" />
        </button>

        {status === "success" ? (
          <div className="flex items-start gap-3 py-2">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" />
            <div>
              <p className="text-md font-semibold text-primary">Thanks — we got it.</p>
              <p className="mt-1 text-sm text-tertiary">An ICE specialist will follow up shortly.</p>
              <Button size="sm" className="mt-4" onClick={dismiss}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="soft-lead-title" className="pr-8 text-lg font-semibold text-primary">
              {headline}
            </h2>
            <p className="mt-2 text-sm text-tertiary">{description}</p>
            <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
              <Input isRequired size="md" label="Name" value={name} onChange={setName} />
              <Input
                isRequired
                size="md"
                type="email"
                label="Work email"
                value={email}
                onChange={setEmail}
              />
              <Input
                isRequired
                size="md"
                type="tel"
                label="Phone"
                value={phone}
                onChange={(v) => setPhone(formatPhone(v))}
                placeholder="(561) 555-0100"
              />
              <Input size="md" label="Company" value={company} onChange={setCompany} />
              <Button type="submit" size="lg" isLoading={status === "loading"} showTextWhileLoading>
                {status === "loading" ? "Sending…" : "Request assessment"}
              </Button>
              {status === "error" && (
                <p role="alert" className="flex items-start gap-2 text-sm text-error-primary">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {errorMsg}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
