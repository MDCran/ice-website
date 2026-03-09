"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search, Menu, X, ChevronDown, Phone, Mail, MapPin,
  Cloud, Shield, Lock, Server, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/themeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const NAV_LINKS: readonly { label: string; href: string; hasMega?: boolean }[] = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions", hasMega: true },
  { label: "Partners", href: "/partners" },
  { label: "Why ICE", href: "/why-ice" },
  { label: "Contact Us", href: "/contact" },
];

interface MegaColumn {
  heading: string;
  icon: LucideIcon;
  links: { label: string; href: string }[];
}

const SOLUTIONS_MEGA: MegaColumn[] = [
  {
    heading: "Managed Cloud Services",
    icon: Cloud,
    links: [
      { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
      { label: "Managed Private Cloud", href: "/solutions/managed-private-cloud" },
      { label: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud" },
      { label: "Cloud Migration Services", href: "/solutions/cloud-migration" },
    ],
  },
  {
    heading: "Managed Data Protection",
    icon: Shield,
    links: [
      { label: "Backup as a Service", href: "/solutions/backup-as-a-service" },
      { label: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery" },
      { label: "High Availability as a Service", href: "/solutions/high-availability" },
      { label: "Ransomware Recovery", href: "/solutions/ransomware-recovery" },
    ],
  },
  {
    heading: "Managed Security",
    icon: Lock,
    links: [
      { label: "IBM i Security", href: "/solutions/ibm-i-security" },
      { label: "Protection Suite", href: "/solutions/protection-suite" },
      { label: "Security Monitoring", href: "/solutions/security-monitoring" },
      { label: "Threat Detection and Response", href: "/solutions/threat-detection" },
      { label: "Endpoint Security", href: "/solutions/endpoint-security" },
    ],
  },
  {
    heading: "Managed Services",
    icon: Server,
    links: [
      { label: "Managed Microsoft Services", href: "/solutions/managed-microsoft" },
      { label: "Automation Suite", href: "/solutions/automation-suite" },
      { label: "Systems Management", href: "/solutions/systems-management" },
      { label: "IBM Power VS", href: "/solutions/ibm-power-vs" },
    ],
  },
];

/* ─── Component ────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setMobileSolutionsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ══════════ Top Info Bar ══════════ */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 overflow-hidden",
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        )}
      >
        <div className="nav-blur border-b border-white/[0.04]">
          <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-sky-400" />
                1279 W Palmetto Park Rd #272415, Boca Raton, FL 33427
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="tel:5613949188" className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-400">
                <Phone className="h-3 w-3 text-sky-400" />
                561-394-9188
              </a>
              <a href="mailto:sales@icesales.com" className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-400">
                <Mail className="h-3 w-3 text-sky-400" />
                sales@icesales.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Main Nav ══════════ */}
      <nav
        className={cn(
          "nav-blur transition-all duration-300",
          scrolled
            ? "border-b border-sky-500/10 shadow-lg shadow-sky-500/5"
            : "border-b border-white/[0.04]"
        )}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="relative shrink-0 group" aria-label="ICE Home">
            <div className="logo-container rounded-lg bg-[#f8fafc] px-3 py-2 flex flex-col items-center transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(4,155,251,0.3)]">
              <Image
                src="/images/logo/logo-dark.svg"
                alt="International Computer Exchange"
                width={160}
                height={48}
                className="h-9 lg:h-11 w-auto"
                priority
              />
              <span className="text-[6.5px] lg:text-[7.5px] font-semibold tracking-[0.14em] uppercase text-slate-500 mt-0.5 whitespace-nowrap leading-tight">
                International Computer Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.hasMega ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive(link.href)
                        ? "text-sky-400 text-glow-purple"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        megaOpen && "rotate-180"
                      )}
                    />
                  </Link>

                  {/* ── Mega Dropdown ── */}
                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                      >
                        <div
                          className={cn(
                            "w-[820px] rounded-xl overflow-hidden",
                            "border border-white/[0.08]",
                            "bg-[#020617]/97 backdrop-blur-2xl",
                            "shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_1px_rgba(255,255,255,0.05)]"
                          )}
                        >
                          {/* Subtle top accent line */}
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

                          <div className="relative">
                            {/* Subtle background glow */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-sky-500/[0.03] blur-3xl pointer-events-none" />

                            <div className="relative z-10 p-6">
                              <div className="grid grid-cols-4 gap-0">
                                {SOLUTIONS_MEGA.map((col, colIdx) => (
                                  <div
                                    key={col.heading}
                                    className={cn(
                                      "px-4 flex flex-col",
                                      colIdx < 3 && "border-r border-white/[0.04]"
                                    )}
                                  >
                                    {/* Category header — fixed height for uniform alignment */}
                                    <div className="flex items-center gap-2.5 h-10 mb-3 pb-3 border-b border-white/[0.06]">
                                      <col.icon className="h-4 w-4 text-sky-400/80 shrink-0" />
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 leading-tight">
                                        {col.heading}
                                      </span>
                                    </div>

                                    {/* Links — flex-1 fills remaining space for uniform column height */}
                                    <ul className="space-y-0.5 flex-1">
                                      {col.links.map((item) => (
                                        <li key={item.href}>
                                          <Link
                                            href={item.href}
                                            className="group flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-slate-300 transition-all duration-200 hover:text-white hover:bg-white/[0.04]"
                                          >
                                            <span className="flex-1">{item.label}</span>
                                            <ArrowRight className="h-3 w-3 text-sky-400/50 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Bottom bar */}
                            <div className="relative z-10 px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.015] flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 tracking-wide">
                                Enterprise solutions since 1990
                              </span>
                              <Link
                                href="/solutions"
                                className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
                              >
                                View All Solutions
                                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive(link.href)
                      ? "text-sky-400 text-glow-purple nav-link-active"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Search (opens Cmd+K modal) */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
              className="ml-3 inline-flex items-center gap-2 p-2.5 rounded-xl text-slate-400 transition-all duration-300 hover:text-sky-400 hover:bg-sky-400/5 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] cursor-pointer"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
              className="p-2 rounded-lg text-slate-400 transition-colors hover:text-sky-400 cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-300 transition-colors hover:text-white hover:bg-white/5"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ Mobile Menu ══════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ top: 0 }}
          >
            <div
              className="mobile-menu-backdrop absolute inset-0 bg-[#020617]/98 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="mobile-menu absolute inset-y-0 right-0 w-full max-w-sm bg-[#020617] border-l border-sky-500/10 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 mobile-menu-header">
                <Link href="/" onClick={() => setMobileOpen(false)} aria-label="ICE Home">
                  <div className="logo-container rounded-lg bg-[#f8fafc] px-2.5 py-1.5 flex flex-col items-center">
                    <Image
                      src="/images/logo/logo-dark.svg"
                      alt="International Computer Exchange"
                      width={130}
                      height={38}
                      className="h-7 w-auto"
                    />
                    <span className="text-[6px] font-semibold tracking-[0.14em] uppercase text-slate-500 mt-0.5 whitespace-nowrap leading-tight">
                      International Computer Exchange
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="mobile-menu-close p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 px-6 py-8 space-y-1">
                {NAV_LINKS.map((link) =>
                  link.hasMega ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileSolutionsOpen((prev) => !prev)}
                        className={cn(
                          "mobile-menu-link w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors",
                          isActive(link.href) ? "text-sky-400" : "text-slate-300 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {link.label}
                        <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", mobileSolutionsOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {mobileSolutionsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 space-y-4 mt-2">
                              <Link
                                href="/solutions"
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
                              >
                                View All Solutions
                              </Link>
                              {SOLUTIONS_MEGA.map((col) => (
                                <div key={col.heading}>
                                  <h4 className="px-4 text-xs font-semibold uppercase tracking-wider text-sky-400/70 mb-2">
                                    {col.heading}
                                  </h4>
                                  <ul className="space-y-0.5">
                                    {col.links.map((item) => (
                                      <li key={item.href}>
                                        <Link
                                          href={item.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="mobile-menu-sublink block px-4 py-2 text-sm text-slate-400 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                                        >
                                          {item.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "mobile-menu-link block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive(link.href) ? "text-sky-400 bg-sky-400/5" : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              <div className="px-6 py-6 border-t border-white/5 space-y-3 mobile-menu-footer">
                <a href="tel:5613949188" className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-400 transition-colors">
                  <Phone className="h-4 w-4 text-sky-400" />561-394-9188
                </a>
                <a href="mailto:sales@icesales.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-400 transition-colors">
                  <Mail className="h-4 w-4 text-sky-400" />sales@icesales.com
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
