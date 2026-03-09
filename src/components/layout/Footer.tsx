"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, Clock, MapPin, ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react";


const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Partners", href: "/partners" },
  { label: "Why ICE", href: "/why-ice" },
  { label: "Contact Us", href: "/contact" },
];

const solutionCategories = [
  {
    heading: "Managed Cloud Services",
    links: [
      { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
      { label: "Managed Private Cloud", href: "/solutions/managed-private-cloud" },
      { label: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud" },
      { label: "Cloud Migration Services", href: "/solutions/cloud-migration" },
    ],
  },
  {
    heading: "Managed Data Protection",
    links: [
      { label: "Backup as a Service", href: "/solutions/backup-as-a-service" },
      { label: "Disaster Recovery", href: "/solutions/disaster-recovery" },
      { label: "High Availability", href: "/solutions/high-availability" },
      { label: "Ransomware Recovery", href: "/solutions/ransomware-recovery" },
    ],
  },
  {
    heading: "Managed Security",
    links: [
      { label: "IBM i Security", href: "/solutions/ibm-i-security" },
      { label: "Protection Suite", href: "/solutions/protection-suite" },
      { label: "Security Monitoring", href: "/solutions/security-monitoring" },
      { label: "Threat Detection", href: "/solutions/threat-detection" },
      { label: "Endpoint Security", href: "/solutions/endpoint-security" },
    ],
  },
  {
    heading: "Managed Services",
    links: [
      { label: "Managed Microsoft", href: "/solutions/managed-microsoft" },
      { label: "Automation Suite", href: "/solutions/automation-suite" },
      { label: "Systems Management", href: "/solutions/systems-management" },
      { label: "IBM Power VS", href: "/solutions/ibm-power-vs" },
    ],
  },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "SMS Consent", href: "/sms-consent" },
  { label: "Resources", href: "/resources" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function isUSHoliday(date: Date): boolean {
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  const dow = date.getDay();
  // Fixed holidays
  if (m === 0 && d === 1) return true;   // New Year's Day
  if (m === 6 && d === 4) return true;   // Independence Day
  if (m === 11 && d === 25) return true;  // Christmas
  // MLK Day: 3rd Monday of January
  if (m === 0 && dow === 1 && d >= 15 && d <= 21) return true;
  // Presidents' Day: 3rd Monday of February
  if (m === 1 && dow === 1 && d >= 15 && d <= 21) return true;
  // Memorial Day: last Monday of May
  if (m === 4 && dow === 1 && d >= 25) return true;
  // Labor Day: 1st Monday of September
  if (m === 8 && dow === 1 && d <= 7) return true;
  // Thanksgiving: 4th Thursday of November
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

  if (holiday) {
    return { isOpen: false, label: "Closed", note: "Closed for holiday" };
  }
  if (isWeekday && isDuringHours) {
    return { isOpen: true, label: "Open Now" };
  }
  return { isOpen: false, label: "Closed" };
}

function SolutionsAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Solutions</h3>
      <div className="space-y-1">
        {solutionCategories.map((cat, i) => (
          <div key={cat.heading}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex w-full items-center justify-between py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <span>{cat.heading}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="overflow-hidden pl-3 border-l border-white/[0.06]"
                >
                  {cat.links.map((link) => (
                    <li key={link.href} className="py-1.5">
                      <Link href={link.href} className="group inline-flex items-center gap-1.5 text-[13px] text-slate-500 transition-colors duration-200 hover:text-white">
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function useBusinessStatus() {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string; note?: string }>({ isOpen: false, label: "" });
  useEffect(() => {
    setStatus(getBusinessStatus());
    const timer = setInterval(() => setStatus(getBusinessStatus()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return status;
}

export default function Footer() {
  const logoSrc = "/images/logo/logo-dark.svg";
  const bizStatus = useBusinessStatus();

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Top gradient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

      {/* Contact Info Bar */}
      <div className="relative bg-gradient-to-b from-[#0a1020] to-[#020617]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 transition-colors group-hover:from-sky-500/25 group-hover:to-blue-500/25">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Address</p>
                <p className="text-sm font-semibold text-white">1279 W Palmetto Park Rd #272415</p>
                <p className="text-xs text-slate-400">Boca Raton, FL 33427</p>
              </div>
            </motion.div>

            <motion.a
              href="tel:561-394-9188"
              custom={1}
              variants={fadeUp}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(168,85,247,0.06)] glint-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 transition-colors group-hover:from-sky-500/25 group-hover:to-blue-500/25">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Phone</p>
                <p className="text-sm font-semibold text-white">561-394-9188</p>
              </div>
            </motion.a>

            <motion.a
              href="mailto:sales@icesales.com"
              custom={2}
              variants={fadeUp}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(168,85,247,0.06)] glint-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 transition-colors group-hover:from-sky-500/25 group-hover:to-blue-500/25">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Email</p>
                <p className="text-sm font-semibold text-white">sales@icesales.com</p>
              </div>
            </motion.a>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 transition-colors group-hover:from-sky-500/25 group-hover:to-blue-500/25">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Hours</p>
                <p className="text-sm font-semibold text-white">Mon &ndash; Fri, 9&ndash;5 ET</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${bizStatus.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className={`text-[10px] font-semibold ${bizStatus.isOpen ? "text-emerald-400" : "text-red-400"}`}>{bizStatus.label}</span>
                </div>
                {bizStatus.note && <p className="text-[9px] text-slate-500 mt-0.5">{bizStatus.note}</p>}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Animated gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />

      {/* Main Footer */}
      <div className="relative bg-gradient-to-b from-[#020617] to-[#020617]">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Company Info */}
            <motion.div custom={0} variants={fadeUp} className="lg:col-span-1">
              <Link href="/" className="inline-block mb-5">
                <div className="logo-container rounded-lg bg-[#f8fafc] px-3 py-2 flex flex-col items-center">
                  <Image
                    src={logoSrc}
                    alt="ICE"
                    width={140}
                    height={42}
                    className="h-9 w-auto"
                  />
                  <span className="text-[6.5px] font-semibold tracking-[0.14em] uppercase text-slate-500 mt-0.5 whitespace-nowrap leading-tight">
                    International Computer Exchange
                  </span>
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 mb-6">
                IBM Business Partner since 1990. Delivering enterprise-grade cloud, security, and managed IT solutions.
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
                <Image src="/images/ibm.svg" alt="IBM" width={48} height={20} className="opacity-70" />
                <p className="text-[11px] text-slate-400 font-medium leading-snug">IBM Business Partner<br /><span className="text-slate-500">Since 1990</span></p>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div custom={1} variants={fadeUp}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-white">
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solutions — accordion categories */}
            <motion.div custom={2} variants={fadeUp}>
              <SolutionsAccordion />

              {/* Gradient separator */}
              <div className="my-6 h-px bg-gradient-to-r from-sky-400/15 to-transparent" />

              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-white">
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div custom={3} variants={fadeUp}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Get In Touch</h3>
              <p className="text-sm leading-relaxed text-slate-400 mb-4">
                Ready to modernize your IT infrastructure? Our experts are here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/20 px-5 py-3 text-sm font-semibold text-sky-400 transition-all duration-300 hover:from-sky-500/30 hover:to-blue-500/30 hover:border-sky-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:text-white"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.04] bg-[#020617]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} International Computer Exchange, Inc. All Rights Reserved.
          </p>
          <a
            href="https://mdcran.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-sky-400 transition-colors duration-300"
          >
            by MDCran
          </a>
        </div>
      </div>
    </footer>
  );
}
