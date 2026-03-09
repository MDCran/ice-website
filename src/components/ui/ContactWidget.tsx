"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, CheckCircle, AlertCircle } from "lucide-react";

const SERVICE_OPTIONS = [
  "Managed Cloud Services",
  "Managed Data Protection",
  "Managed Security",
  "Managed Services",
  "Hardware & Resale",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Floating Contact Widget                                           */
/* ------------------------------------------------------------------ */

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
    smsConsent: false,
  });

  /* ── Welcome bubble logic (first visit only, persists until interaction) */

  useEffect(() => {
    try {
      const seen = localStorage.getItem("ice-widget-seen");
      if (!seen) {
        setShowWelcome(true);
      }
    } catch {
      // localStorage unavailable — silently skip
    }
  }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      localStorage.setItem("ice-widget-seen", "true");
    } catch {
      // localStorage unavailable
    }
  }

  /* ── Form helpers ───────────────────────────────────────────────── */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm({ name: "", email: "", company: "", phone: "", service: "", message: "", smsConsent: false });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleToggle() {
    if (showWelcome) dismissWelcome();
    setIsOpen((prev) => !prev);
    if (!isOpen && (status === "success" || status === "error")) {
      setStatus("idle");
      setErrorMessage("");
    }
  }

  /* ── Shared input classes ─────────────────────────────────────── */

  const inputClass =
    "w-full bg-white/[0.06] dark:bg-white/[0.06] border border-slate-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all duration-300";

  const selectClass =
    "w-full bg-white dark:bg-white/[0.06] border border-slate-300 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all duration-300 appearance-none cursor-pointer";

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {/* ── Contact Panel ────────────────────────────────────────── */}
        {isOpen && (
          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            className="mb-4 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border border-sky-500/15 dark:border-sky-500/15 border-slate-200 bg-white dark:bg-[#020617]/95 backdrop-blur-2xl shadow-2xl dark:shadow-sky-500/10 shadow-slate-200/60 overflow-hidden"
          >
            {/* Top gradient line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Send Us a Message</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  We&apos;ll get back to you within 2-3 business days.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                aria-label="Close contact form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pb-5 pt-4 max-h-[70vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  /* ── Success state ─────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                      <CheckCircle className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">Message Sent</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Thank you for reaching out. We&apos;ll be in touch soon.
                    </p>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setIsOpen(false);
                      }}
                      className="mt-5 text-xs text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  /* ── Form ──────────────────────────────────────── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    {/* Name & Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Name *"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email *"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    {/* Company & Phone */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="company"
                        type="text"
                        placeholder="Company"
                        value={form.company}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    {/* Service */}
                    <div className="relative">
                      <select
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="">Service Interested In...</option>
                        {SERVICE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {/* Message */}
                    <textarea
                      name="message"
                      required
                      rows={3}
                      placeholder="Message *"
                      value={form.message}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />

                    {/* SMS Consent */}
                    <div className="flex items-start gap-2.5">
                      <input
                        id="widget-smsConsent"
                        name="smsConsent"
                        type="checkbox"
                        checked={form.smsConsent}
                        onChange={handleChange}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-[#0a1020]/50 text-sky-500 focus:ring-sky-500/30 focus:ring-offset-0"
                      />
                      <label htmlFor="widget-smsConsent" className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        I consent to receive SMS text messages from ICE. Message and data rates may apply. Reply STOP to opt out.
                        See our{" "}
                        <Link href="/sms-consent" className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 underline underline-offset-2">
                          SMS Consent Policy
                        </Link>.
                      </label>
                    </div>

                    {/* Error message */}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2"
                      >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-500 dark:text-red-400">{errorMessage}</p>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "sending" ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Welcome Bubble (first visit, persists until interaction) */}
        {showWelcome && !isOpen && (
          <motion.div
            key="welcome-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            onClick={() => {
              dismissWelcome();
              setIsOpen(true);
            }}
            className="mb-3 cursor-pointer rounded-2xl border border-slate-200 dark:border-sky-500/15 bg-white dark:bg-[#020617]/95 backdrop-blur-2xl px-4 py-3 shadow-xl dark:shadow-sky-500/10 shadow-slate-200/60 max-w-[260px]"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">
              Need help? Schedule a free consultation!
            </p>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Click to get started</p>
            {/* Small arrow pointing down */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-slate-200 dark:border-sky-500/15 bg-white dark:bg-[#020617]/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button (always visible) ─────────────── */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-sky-500/40 cursor-pointer"
        aria-label={isOpen ? "Close contact form" : "Open contact form"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when welcome bubble is visible */}
        {showWelcome && !isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-sky-400/20 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
