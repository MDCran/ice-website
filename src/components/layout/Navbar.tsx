"use client";

import { useState, useEffect, useCallback, useRef, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SearchLg,
  Menu02,
  XClose,
  ChevronDown,
  ArrowRight,
  Phone01,
  Mail01,
  MarkerPin02,
  Cloud01,
  Shield01,
  Lock01,
  Server01,
} from "@untitledui/icons";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { resolveIcon } from "@/lib/iconMap";
import { Grid as GridPattern } from "@/components/shared-assets/background-patterns/grid";

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
  icon: ComponentType<{ className?: string }>;
  links: { label: string; href: string }[];
}

const SOLUTIONS_MEGA: MegaColumn[] = [
  {
    heading: "Managed Cloud Services",
    icon: Cloud01,
    links: [
      { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
      { label: "Managed Private Cloud", href: "/solutions/managed-private-cloud" },
      { label: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud" },
      { label: "Cloud Migration Services", href: "/solutions/cloud-migration" },
    ],
  },
  {
    heading: "Managed Data Protection",
    icon: Shield01,
    links: [
      { label: "Backup as a Service", href: "/solutions/backup-as-a-service" },
      { label: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery" },
      { label: "High Availability as a Service", href: "/solutions/high-availability" },
      { label: "Ransomware Recovery", href: "/solutions/ransomware-recovery" },
    ],
  },
  {
    heading: "Managed Security",
    icon: Lock01,
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
    icon: Server01,
    links: [
      { label: "Managed Microsoft Services", href: "/solutions/managed-microsoft" },
      { label: "Automation Suite", href: "/solutions/automation-suite" },
      { label: "Systems Management", href: "/solutions/systems-management" },
      { label: "IBM Power VS", href: "/solutions/ibm-power-vs" },
    ],
  },
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const openSearch = () =>
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }));

const DEFAULT_TOP_INFO_HEIGHT = 35;

export interface NavbarCompanyInfo {
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function Navbar({
  navItems,
  companyInfo,
}: {
  navItems?: any[];
  companyInfo?: NavbarCompanyInfo;
}) {
  const addressLine = [
    companyInfo?.address ?? "1279 W Palmetto Park Rd #272415",
    companyInfo?.city ?? "Boca Raton, FL 33427",
  ]
    .filter(Boolean)
    .join(", ");
  const phone = companyInfo?.phone ?? "1-800-786-9188";
  const email = companyInfo?.email ?? "info@icesales.com";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const logoSrc = companyInfo?.logo ?? "/images/logo/ice-logo.jpg";

  // Resolve nav links from CMS or fallback
  // Seed data uses location "navbar"; older rows may use "navbar_top" — accept both.
  const navbarTopItems = navItems?.filter((i: any) => (i.location === "navbar_top" || i.location === "navbar") && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];
  const resolvedNavLinks = navbarTopItems.length > 0
    ? navbarTopItems.map((i: any) => ({
        label: i.label,
        href: i.href,
        // Fall back to href detection so the Solutions mega menu survives
        // environments where the has_mega_menu column doesn't exist yet.
        hasMega: i.has_mega_menu ?? i.href === "/solutions",
      }))
    : NAV_LINKS;
  const navLinks = resolvedNavLinks.filter((item) => {
    const href = typeof item.href === "string" ? item.href.trim() : "";
    return (
      !/^\/enterprise(?:[/?#]|$)/i.test(href) &&
      !/^https?:\/\/(?:www\.)?icesales\.com\/enterprise(?:[/?#]|$)/i.test(
        href,
      )
    );
  });

  const megaItems = navItems?.filter((i: any) => i.location === "navbar_mega" && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];
  const solutionsMega: MegaColumn[] = megaItems.length > 0
    ? (() => {
        const columnMap = new Map<string, MegaColumn>();
        for (const item of megaItems) {
          const col = item.mega_column_title || "Solutions";
          if (!columnMap.has(col)) {
            columnMap.set(col, { heading: col, icon: resolveIcon(item.mega_column_icon), links: [] });
          }
          columnMap.get(col)!.links.push({ label: item.label, href: item.href });
        }
        return Array.from(columnMap.values());
      })()
    : SOLUTIONS_MEGA;

  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopInfo, setShowTopInfo] = useState(true);
  const [topInfoHeight, setTopInfoHeight] = useState(DEFAULT_TOP_INFO_HEIGHT);
  const scrollFrame = useRef<number | null>(null);
  const pendingScrollY = useRef(0);
  const topInfoRef = useRef<HTMLDivElement | null>(null);

  // Close-intent delay so the mega menu doesn't flicker when the cursor
  // briefly leaves the trigger/panel while moving between them.
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaOpenRef = useRef(false);

  const openMega = useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    megaOpenRef.current = true;
    setMegaOpen(true);
  }, []);

  const scheduleMegaClose = useCallback(() => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    // Generous delay: crossing the trigger→panel gap or a column border
    // shouldn't collapse the menu mid-hover.
    megaCloseTimer.current = setTimeout(() => {
      megaOpenRef.current = false;
      setMegaOpen(false);
    }, 320);
  }, []);

  const closeMegaNow = useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    megaOpenRef.current = false;
    setMegaOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    const element = topInfoRef.current;
    if (!element) return;

    const measure = () => {
      setTopInfoHeight(Math.ceil(element.getBoundingClientRect().height) || DEFAULT_TOP_INFO_HEIGHT);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Keep open while pointer is anywhere over the trigger+panel hit area.
  // pointerenter/leave is more reliable than mouseenter when children remount.
  const onMegaPointerEnter = useCallback(() => {
    openMega();
  }, [openMega]);

  const onMegaPointerLeave = useCallback(() => {
    scheduleMegaClose();
  }, [scheduleMegaClose]);

  const handleScroll = useCallback((event?: Event) => {
    const customScroll = (event as CustomEvent<{ scroll?: number }> | undefined)?.detail?.scroll;
    pendingScrollY.current = typeof customScroll === "number" ? customScroll : window.scrollY;
    if (scrollFrame.current !== null) return;

    scrollFrame.current = window.requestAnimationFrame(() => {
      const scrollTop = pendingScrollY.current;

      setScrolled(scrollTop > 8);
      setShowTopInfo(scrollTop <= 8);

      scrollFrame.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("ice:scroll", handleScroll as EventListener);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("ice:scroll", handleScroll as EventListener);
      if (scrollFrame.current !== null) {
        window.cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = null;
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    // Flag the open state on <body> so floating widgets (contact button /
    // accessibility) can drop below the full-screen mobile menu.
    document.body.classList.toggle("menu-open", mobileOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    closeMegaNow();
    setMobileSolutionsOpen(false);
  }, [pathname, closeMegaNow]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header data-site-navbar className="sticky top-0 z-50 w-full">
      {/* ══════════ Top Info Bar ══════════ */}
      <motion.div
        data-top-info-bar
        initial={false}
        animate={
          showTopInfo
            ? { height: topInfoHeight, opacity: 1, y: 0 }
            : { height: 0, opacity: 0, y: -8 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.26, ease: "easeOut" },
                y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              }
        }
        style={{ willChange: "height, opacity, transform" }}
        className="hidden overflow-hidden lg:block"
      >
        <div ref={topInfoRef} className="border-b border-secondary bg-secondary">
          <div className="mx-auto flex max-w-container items-center justify-between px-4 py-2 text-xs text-tertiary md:px-8">
            <span className="inline-flex items-center gap-1.5">
              <MarkerPin02 className="size-3.5 shrink-0 text-fg-quaternary" />
              {addressLine}
            </span>
            <div className="flex items-center gap-6">
              <a
                href={phoneHref}
                className="inline-flex items-center gap-1.5 rounded-sm outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Phone01 className="size-3.5 shrink-0 text-fg-quaternary" />
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 rounded-sm outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Mail01 className="size-3.5 shrink-0 text-fg-quaternary" />
                {email}
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════ Main Nav ══════════ */}
      {/* Light mode: solid pure white so the white logo plate blends seamlessly.
          Dark mode: navy glass (translucent primary + blur) with white plate behind the JPG logo. */}
      <nav
        className={cx(
          "border-b border-secondary bg-white transition-shadow duration-300 dark:bg-primary/80 dark:backdrop-blur-xl",
          scrolled && "shadow-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-8 lg:h-18">
          {/* Logo — same asset on mobile and desktop (white plate for JPG contrast). */}
          <Link
            href="/"
            aria-label="ICE Home"
            className="shrink-0 rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="flex items-center rounded-lg bg-white px-2.5 py-1.5 lg:px-3 lg:py-2">
              <Image
                src={logoSrc}
                alt="International Computer Exchange"
                width={220}
                height={66}
                className="h-8 w-auto lg:h-12"
                priority
              />
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) =>
              link.hasMega ? (
                <div
                  key={link.label}
                  className="relative"
                  onPointerEnter={onMegaPointerEnter}
                  onPointerLeave={onMegaPointerLeave}
                  onBlur={(e) => {
                    // Close when keyboard focus leaves the trigger + panel entirely
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      closeMegaNow();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeMegaNow();
                  }}
                >
                  {/* Dropdown trigger — a button, not a page link. The index
                      page stays reachable via "View All Solutions" in the panel. */}
                  <button
                    type="button"
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                    onFocus={openMega}
                    onClick={() => {
                      if (megaOpenRef.current) closeMegaNow();
                      else openMega();
                    }}
                    className={cx(
                      "inline-flex cursor-pointer items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                      isActive(link.href)
                        ? "text-brand-secondary"
                        : "text-secondary hover:bg-primary_hover hover:text-primary"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cx(
                        "size-4 stroke-[2.625px] text-fg-quaternary transition duration-100 ease-linear",
                        megaOpen && "-rotate-180"
                      )}
                    />
                  </button>

                  {/* ── Mega Dropdown ──
                      Positioning lives on a static wrapper so Framer's transform
                      (opacity/y) never fights `-translate-x-1/2` — that conflict
                      was shifting the panel under the cursor and causing flicker.
                      No scale animation: shrinking the hit box mid-hover also
                      fires pointerleave. */}
                  <AnimatePresence>
                    {megaOpen && (
                      <div className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2">
                        {/* Invisible bridge fills the gap between trigger and panel */}
                        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2" />
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="w-[1100px] overflow-hidden rounded-2xl bg-primary shadow-2xl ring-1 ring-black/5 dark:bg-primary dark:ring-white/10">
                            {/* Brand gradient hairline */}
                            <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
                            <div className="grid grid-cols-[1fr_280px]">
                              <div className="grid grid-cols-4 p-6">
                              {solutionsMega.map((col, colIdx) => (
                                <div
                                  key={col.heading}
                                  className={cx(
                                    "flex flex-col px-4",
                                    colIdx < solutionsMega.length - 1 && "border-r border-secondary"
                                  )}
                                >
                                  {/* Category header — same wide-tracking eyebrow as home hero badge */}
                                  <div className="mb-3 flex h-12 items-center gap-2 border-b border-secondary pb-3">
                                    <col.icon className="size-4 shrink-0 text-fg-brand-primary" />
                                    <span className="text-xs leading-snug font-medium tracking-[0.2em] text-brand-tertiary uppercase">
                                      {col.heading}
                                    </span>
                                  </div>

                                  {/* Links — flex-1 fills remaining space for uniform column height */}
                                  <ul className="flex flex-1 flex-col gap-0.5">
                                    {col.links.map((item) => (
                                      <li key={item.href}>
                                        <Link
                                          href={item.href}
                                          className="group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm leading-snug text-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover/60 hover:text-primary focus-visible:outline-2"
                                        >
                                          <span className="flex-1 text-balance">{item.label}</span>
                                          <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-fg-brand-primary opacity-0 transition duration-100 ease-linear group-hover:translate-x-0 group-hover:opacity-100" />
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              </div>

                              {/* Featured CTA panel — theme-aware so light mode stays crisp */}
                              <div
                                className={cx(
                                  "relative isolate flex flex-col justify-between overflow-hidden border-l p-6",
                                  "border-brand/25 bg-brand-primary_alt",
                                  "dark:border-secondary dark:bg-[rgb(4_11_25)]",
                                )}
                              >
                                {/* Engineering grid */}
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black_25%,transparent_75%)] dark:opacity-[0.45]"
                                >
                                  <GridPattern
                                    size="md"
                                    className="absolute -top-16 -right-20 text-brand-500/35 dark:text-white/35"
                                  />
                                </div>
                                {/* Brand bloom */}
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/30"
                                />
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute right-0 bottom-0 size-32 rounded-full bg-brand-400/10 blur-2xl dark:bg-brand-400/15"
                                />
                                {/* Top hairline */}
                                <div
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/45 to-transparent"
                                />

                                <div className="relative">
                                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-brand-secondary uppercase dark:text-brand-300">
                                    <span
                                      aria-hidden="true"
                                      className="size-1.5 rounded-full bg-brand-solid shadow-[0_0_8px_rgb(4_155_251/0.65)]"
                                    />
                                    Talk to ICE
                                  </span>
                                  <p className="mt-3 text-lg font-semibold tracking-tight text-primary dark:text-white">
                                    Not sure which solution fits?
                                  </p>
                                  <p className="mt-2 text-sm leading-relaxed text-tertiary dark:text-white/65">
                                    Get a free infrastructure assessment — or jump into the solution finder in under a minute.
                                  </p>
                                </div>

                                <div className="relative mt-6 flex flex-col gap-3">
                                  <Button
                                    href="/contact"
                                    size="md"
                                    className="w-full justify-center shadow-sm dark:shadow-[0_0_24px_rgb(4_155_251/0.35)]"
                                    iconTrailing={ArrowRight}
                                  >
                                    Request a consultation
                                  </Button>
                                  <Link
                                    href="/solutions/find"
                                    className="group inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-brand-secondary outline-focus-ring transition hover:text-brand-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-brand-300 dark:hover:text-white"
                                  >
                                    Find your solution
                                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Bottom bar */}
                            <div className="flex items-center justify-between border-t border-secondary bg-secondary/50 px-6 py-3">
                              <span className="text-xs text-quaternary">
                                Providing Enterprise solutions since 1990.
                              </span>
                              <Button href="/solutions" color="link-color" size="sm" iconTrailing={ArrowRight}>
                                View All Solutions
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cx(
                    "rounded-lg px-3 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                    isActive(link.href)
                      ? "text-brand-secondary"
                      : "text-secondary hover:bg-primary_hover hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Search (opens Cmd+K modal) */}
            <div className="ml-2 flex items-center gap-1">
              <ButtonUtility
                color="tertiary"
                size="sm"
                icon={SearchLg}
                onClick={openSearch}
                aria-label="Search (Ctrl+K)"
              />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Controls — comfortable 44px tap targets */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <ButtonUtility
              color="tertiary"
              size="sm"
              icon={SearchLg}
              onClick={openSearch}
              aria-label="Search"
            />
            <ButtonUtility
              color="tertiary"
              size="sm"
              icon={mobileOpen ? XClose : Menu02}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            />
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
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-overlay/70 backdrop-blur-[6px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-secondary bg-primary shadow-xl"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-secondary px-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  aria-label="ICE Home"
                  className="rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="flex items-center rounded-lg bg-white px-2.5 py-1.5">
                    <Image
                      src={logoSrc}
                      alt="International Computer Exchange"
                      width={220}
                      height={66}
                      className="h-8 w-auto"
                    />
                  </span>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <ButtonUtility
                    color="tertiary"
                    size="sm"
                    icon={XClose}
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-0.5 px-4 py-6">
                {navLinks.map((link) =>
                  link.hasMega ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileSolutionsOpen((prev) => !prev)}
                        aria-expanded={mobileSolutionsOpen}
                        className={cx(
                          "flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-md font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                          isActive(link.href)
                            ? "bg-brand-solid text-white shadow-[0_0_24px_rgb(4_155_251/0.28)] ring-1 ring-brand-solid/70"
                            : "text-secondary hover:bg-primary_hover hover:text-primary"
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          className={cx(
                            "size-5 transition duration-100 ease-linear",
                            isActive(link.href) ? "text-white" : "text-fg-quaternary",
                            mobileSolutionsOpen && "-rotate-180"
                          )}
                        />
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
                            <div className="mt-2 flex flex-col gap-4 pb-2 pl-4">
                              <Link
                                href="/solutions"
                                onClick={() => setMobileOpen(false)}
                                aria-current={pathname === "/solutions" ? "page" : undefined}
                                className={cx(
                                  "rounded-lg px-4 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2",
                                  pathname === "/solutions"
                                    ? "bg-brand-solid text-white shadow-[0_0_20px_rgb(4_155_251/0.24)] ring-1 ring-brand-solid/70"
                                    : "text-brand-secondary hover:bg-primary_hover hover:text-brand-secondary_hover"
                                )}
                              >
                                View All Solutions
                              </Link>
                              {solutionsMega.map((col) => (
                                <div key={col.heading}>
                                  <h4 className="mb-2 flex items-center gap-2 px-4 text-xs font-medium tracking-[0.2em] text-brand-tertiary uppercase">
                                    <col.icon className="size-3.5 shrink-0 text-fg-brand-primary" />
                                    {col.heading}
                                  </h4>
                                  <ul className="flex flex-col gap-0.5">
                                    {col.links.map((item) => (
                                      <li key={item.href}>
                                        <Link
                                          href={item.href}
                                          onClick={() => setMobileOpen(false)}
                                          aria-current={isActive(item.href) ? "page" : undefined}
                                          className={cx(
                                            "block rounded-lg px-4 py-2 text-sm outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2",
                                            isActive(item.href)
                                              ? "bg-brand-solid text-white shadow-[0_0_20px_rgb(4_155_251/0.24)] ring-1 ring-brand-solid/70"
                                              : "text-tertiary hover:bg-primary_hover hover:text-primary"
                                          )}
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
                      className={cx(
                        "block rounded-lg px-4 py-3 text-md font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                        isActive(link.href)
                          ? "bg-brand-solid text-white shadow-[0_0_24px_rgb(4_155_251/0.28)] ring-1 ring-brand-solid/70"
                          : "text-secondary hover:bg-primary_hover hover:text-primary"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-secondary px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <a
                  href={phoneHref}
                  className="flex items-center gap-3 rounded-sm text-sm text-tertiary outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Phone01 className="size-4 shrink-0 text-fg-quaternary" />
                  {phone}
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-sm text-sm text-tertiary outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Mail01 className="size-4 shrink-0 text-fg-quaternary" />
                  {email}
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
