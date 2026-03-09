"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { FloatingInput, FloatingTextarea, FloatingSelect } from "@/components/ui/FloatingLabelInput";

const SERVICE_OPTIONS = [
  "Managed Cloud Services",
  "Managed Data Protection",
  "Managed Security",
  "Managed Services",
  "Hardware & Resale",
  "Other",
];

function isUSHoliday(date: Date): boolean {
  const m = date.getMonth();
  const d = date.getDate();
  const dow = date.getDay();
  if (m === 0 && d === 1) return true;
  if (m === 6 && d === 4) return true;
  if (m === 11 && d === 25) return true;
  if (m === 0 && dow === 1 && d >= 15 && d <= 21) return true;
  if (m === 1 && dow === 1 && d >= 15 && d <= 21) return true;
  if (m === 4 && dow === 1 && d >= 25) return true;
  if (m === 8 && dow === 1 && d <= 7) return true;
  if (m === 10 && dow === 4 && d >= 22 && d <= 28) return true;
  return false;
}

function getBusinessStatus(): { isOpen: boolean; label: string; note?: string } {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const hour = et.getHours();
  const holiday = isUSHoliday(et);
  const isWeekday = day >= 1 && day <= 5;
  const isDuringHours = hour >= 9 && hour < 17;
  if (holiday) return { isOpen: false, label: "Closed", note: "Closed for holiday" };
  if (isWeekday && isDuringHours) return { isOpen: true, label: "Open Now" };
  return { isOpen: false, label: "Closed" };
}

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "1279 W Palmetto Park Rd #272415",
    subValue: "Boca Raton, FL 33427",
    href: null,
  },
  {
    icon: Mail,
    label: "Email",
    value: "sales@icesales.com",
    href: "mailto:sales@icesales.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "561-394-9188",
    href: "tel:5613949188",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon \u2013 Fri, 9:00 AM \u2013 5:00 PM ET",
    href: null,
    showStatus: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function useBusinessStatus() {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string; note?: string }>({ isOpen: false, label: "" });
  useEffect(() => {
    setStatus(getBusinessStatus());
    const timer = setInterval(() => setStatus(getBusinessStatus()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return status;
}

export default function ContactPage() {
  const bizStatus = useBusinessStatus();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
    smsConsent: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setStatusMessage("Your message has been sent successfully. We will get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        service: "",
        message: "",
        smsConsent: false,
      });
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen">
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
            <span className="text-sky-400">Contact Us</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold"
          >
            <span className="gradient-text">Contact Us</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Contact Content ───────────────────────────────────────────────── */}
      <section className="section-padding grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Contact Info */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial="hidden"
              animate="visible"
            >
              <motion.div custom={0} variants={fadeUp}>
                <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
                <p className="text-slate-400 leading-relaxed">
                  We&apos;d love to hear from you. Reach out to our team for enterprise
                  technology solutions, pricing, or any questions.
                </p>
              </motion.div>

              <div className="space-y-4">
                {contactInfo.map((item, i) => {
                  const itemStatus = item.showStatus ? bizStatus : null;
                  const content = (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400 transition-colors group-hover:bg-sky-400/20">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{item.label}</p>
                        <p className="text-sm text-white font-medium">{item.value}</p>
                        {item.subValue && <p className="text-xs text-slate-400">{item.subValue}</p>}
                        {itemStatus && itemStatus.label && (
                          <>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`inline-block h-1.5 w-1.5 rounded-full ${itemStatus.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                              <span className={`text-[10px] font-semibold ${itemStatus.isOpen ? "text-emerald-400" : "text-red-400"}`}>{itemStatus.label}</span>
                            </div>
                            {itemStatus.note && <p className="text-[9px] text-slate-500 mt-0.5">{itemStatus.note}</p>}
                          </>
                        )}
                      </div>
                    </>
                  );

                  return (
                    <motion.div key={item.label} custom={i + 1} variants={fadeUp}>
                      {item.href ? (
                        <a href={item.href} className="glass-card glint-card rounded-xl p-5 flex items-start gap-4 group block">
                          {content}
                        </a>
                      ) : (
                        <div className="glass-card rounded-xl p-5 flex items-start gap-4 group">
                          {content}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Response Time Badge */}
              <motion.div custom={4} variants={fadeUp}>
                <div className="glass-card rounded-xl p-4 flex items-center gap-3 border-sky-500/15">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-0.5">Typical Response Time</p>
                    <p className="text-sm text-white font-bold">2-3 Business Days</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl p-8 md:p-10">
                <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingInput
                      id="name"
                      name="name"
                      type="text"
                      required
                      label="Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      label="Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Company & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingInput
                      id="company"
                      name="company"
                      type="text"
                      label="Company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      id="phone"
                      name="phone"
                      type="tel"
                      label="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Service */}
                  <FloatingSelect
                    id="service"
                    name="service"
                    label="Service Interested In"
                    value={formData.service}
                    onChange={handleChange}
                  >
                    <option value="">Select a service...</option>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </FloatingSelect>

                  {/* Message */}
                  <FloatingTextarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    label="Message"
                    value={formData.message}
                    onChange={handleChange}
                  />

                  {/* SMS Consent */}
                  <div className="flex items-start gap-3">
                    <input
                      id="smsConsent"
                      name="smsConsent"
                      type="checkbox"
                      checked={formData.smsConsent}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0a1020]/50 text-sky-500 focus:ring-sky-500/30 focus:ring-offset-0"
                    />
                    <label htmlFor="smsConsent" className="text-xs text-slate-400 leading-relaxed">
                      I consent to receive SMS text messages from International Computer
                      Exchange. Message and data rates may apply. Reply STOP to opt out.
                      See our{" "}
                      <Link href="/sms-consent" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                        SMS Consent Policy
                      </Link>.
                    </label>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glint-btn w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      {status === "loading" ? "Sending..." : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Status */}
                  {status === "success" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-400">{statusMessage}</p>
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{statusMessage}</p>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
