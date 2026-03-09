"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Download, CheckCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { motion } from "motion/react";

const tocItems = [
  { id: "default-opt-in", label: "Default Opt-In" },
  { id: "opting-out", label: "Opting Out" },
  { id: "sign-up", label: "How to Sign Up" },
  { id: "frequency", label: "Frequency & Types" },
  { id: "carrier", label: "Carrier Compliance" },
  { id: "questions", label: "Questions" },
];

export default function SmsConsentPage() {
  const [activeId, setActiveId] = useState(tocItems[0].id);

  useEffect(() => {
    const ids = tocItems.map((t) => t.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <main className="min-h-screen sms-consent-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" poster="/images/hero-poster.webp">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 text-center pt-20 lg:pt-24">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4"
          >
            <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sky-400">SMS Consent</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold"
          >
            <span className="gradient-text">SMS Consent</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[220px_1fr] gap-10">
            {/* Sticky TOC (desktop) */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block print:hidden"
            >
              <div className="sticky top-28">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400 mb-4">On This Page</p>
                <nav className="space-y-1.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs transition-all duration-200 py-1 border-l-2 pl-3 ${
                        activeId === item.id
                          ? "text-sky-400 border-sky-400 font-semibold"
                          : "text-slate-400 border-white/[0.06] hover:text-sky-400 hover:border-sky-400/40"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-8 md:p-12"
            >
              {/* Header */}
              <div className="mb-10 border-b border-white/10 pb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  SMS / Text Messaging &ndash; Opt-In &amp; Opt-Out
                </h2>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-xs text-sky-400 font-semibold">
                  Last Updated: March 2027
                </div>
                <p className="text-slate-400 mt-4 leading-[1.8]">
                  International Computer Exchange, Inc. (&ldquo;ICE&rdquo;) uses SMS text messaging
                  via RingCentral to communicate with customers who have opted in. Below you
                  will find information about how we handle SMS consent, how to opt in, and
                  how to opt out at any time.
                </p>
              </div>

              {/* Default Opt-In */}
              <div id="default-opt-in" className="mb-10 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Default Opt-In
                </h3>
                <p className="text-sm text-slate-300 leading-[1.8]">
                  By providing your phone number through our website contact form, during a
                  phone call with our sales or support team, or by texting us directly, you
                  are giving International Computer Exchange consent to send you SMS text
                  messages related to your inquiry, account, services, and promotional
                  information. Message and data rates may apply depending on your carrier
                  plan. You may opt out at any time using any of the methods described below.
                </p>
                <div className="mt-6 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent" />
              </div>

              {/* Opting Out */}
              <div id="opting-out" className="mb-10 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Opting Out
                </h3>
                <p className="text-sm text-slate-300 leading-[1.8] mb-4">
                  You can opt out of receiving SMS text messages from ICE at any time:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400 mt-0.5">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Reply STOP</p>
                      <p className="text-sm text-slate-400 leading-[1.8]">
                        Reply <span className="font-mono text-sky-400">STOP</span> to any
                        SMS message you receive from us.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400 mt-0.5">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Email Us</p>
                      <p className="text-sm text-slate-400 leading-[1.8]">
                        Send an email to{" "}
                        <a href="mailto:sales@icesales.com" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                          sales@icesales.com
                        </a>{" "}
                        with the subject &ldquo;SMS Opt-Out&rdquo;.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400 mt-0.5">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Call Us</p>
                      <p className="text-sm text-slate-400 leading-[1.8]">
                        Call{" "}
                        <a href="tel:5613949188" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                          561-394-9188
                        </a>{" "}
                        during business hours (9:00 AM &ndash; 5:00 PM ET).
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent" />
              </div>

              {/* How to Sign Up */}
              <div id="sign-up" className="mb-10 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">How You Can Sign Up</h3>
                <ul className="space-y-3">
                  {[
                    { bold: "By phone:", text: "Provide verbal consent during a phone call with our team." },
                    { bold: "By texting us:", text: "Send a text message to our business number to initiate communication." },
                    { bold: "Via our website:", text: "Check the SMS consent checkbox on our contact form or footer subscription form." },
                  ].map((item) => (
                    <li key={item.bold} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">{item.bold}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent" />
              </div>

              {/* Frequency & Types */}
              <div id="frequency" className="mb-10 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Frequency &amp; Types of Messages</h3>
                <p className="text-sm text-slate-300 leading-[1.8] mb-3">Message frequency varies. You may receive:</p>
                <ul className="space-y-2">
                  {[
                    "Responses to your inquiries or support requests",
                    "Service updates, appointment confirmations, or account notifications",
                    "Promotional offers, product announcements, or newsletters",
                    "Follow-up communications related to ongoing projects",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-slate-400 mt-4 leading-[1.8]">
                  Standard message and data rates may apply. Carriers are not liable for delayed or undelivered messages.
                </p>
                <div className="mt-6 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent" />
              </div>

              {/* Carrier Compliance */}
              <div id="carrier" className="mb-10 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Carrier Compliance</h3>
                <p className="text-sm text-slate-300 leading-[1.8]">
                  Our SMS messaging program is compliant with carrier requirements and industry
                  best practices. We use RingCentral as our messaging platform. Carriers
                  supported include but are not limited to AT&amp;T, Verizon, T-Mobile, Sprint,
                  and other major US carriers.
                </p>
                <div className="mt-6 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent" />
              </div>

              {/* Questions */}
              <div id="questions" className="mb-8 scroll-mt-28">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Questions?</h3>
                <p className="text-sm text-slate-300 leading-[1.8]">
                  If you have any questions about our SMS messaging practices, please contact us:
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>International Computer Exchange, Inc.</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:sales@icesales.com" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                      sales@icesales.com
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a href="tel:5613949188" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                      561-394-9188
                    </a>
                  </p>
                </div>
              </div>

              {/* Download as PDF */}
              <div className="mt-12 pt-8 border-t border-white/10 flex justify-center print:hidden">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.print()}
                  className="btn-outline cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download as PDF
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
