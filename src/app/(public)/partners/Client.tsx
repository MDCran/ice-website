"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Building07, CheckCircle, ChevronRight, Settings01, ShieldTick } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { BrandOrbs, PulseAccent } from "@/components/effects/AmbientMotion";
import GenericCMSSections, { type CMSRenderableSection } from "@/components/cms/GenericCMSSections";
import { cx } from "@/utils/cx";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

interface Partner {
    name: string;
    description: string;
    logoSrc?: string;
    specializations: string[];
    partnerSince?: string;
    fullWidth?: boolean;
}

/* Fallback mirrors the CMS `partners_grid` rows (same logo_src per partner)
   so logos still render when the database is unavailable. */
const DEFAULT_PARTNERS: Partner[] = [
    {
        name: "IBM",
        description:
            "World leader in enterprise technology. IBM Power Systems, IBM i, AI, cloud, and hybrid solutions.",
        logoSrc: "/images/v3/b_1.png",
        specializations: ["Power Systems", "IBM i", "AI & Watson", "Hybrid Cloud"],
        partnerSince: "1990",
    },
    {
        name: "Lenovo",
        description:
            "Global technology leader in servers, storage, and data center solutions. ThinkSystem and ThinkAgile platforms.",
        logoSrc: "/images/v3/b_2.png",
        specializations: ["ThinkSystem Servers", "ThinkAgile", "Data Center"],
        partnerSince: "2015",
    },
    {
        name: "Cisco",
        description:
            "Networking, security, collaboration, and data center solutions. Enterprise-grade infrastructure and security.",
        logoSrc: "/images/v3/b_3.png",
        specializations: ["Networking", "Security", "Collaboration"],
        partnerSince: "2005",
    },
    {
        name: "Dell",
        description:
            "Servers, storage, networking, and enterprise solutions. PowerEdge servers and PowerStore storage systems.",
        logoSrc: "/images/v3/b_4.png",
        specializations: ["PowerEdge Servers", "PowerStore", "Enterprise Storage"],
        partnerSince: "2010",
    },
    {
        name: "Printronix",
        description:
            "Industrial and enterprise printing solutions. High-volume printers for manufacturing, logistics, and distribution.",
        logoSrc: "/images/v3/b_5.png",
        specializations: ["Industrial Printing", "Line Printers", "Thermal Printers"],
        partnerSince: "2003",
    },
    {
        name: "CloudSafe",
        description:
            "Enterprise cloud hosting and managed services. Reliable infrastructure for businesses that demand uptime and performance.",
        specializations: ["Cloud Hosting", "Managed Services", "Business Continuity"],
        partnerSince: "2012",
    },
    {
        name: "DASCOM",
        description:
            "Technology solutions and services partner providing innovative business technology solutions.",
        logoSrc: "/images/v3/b_8.png",
        specializations: ["Enterprise Printing", "Document Management"],
        partnerSince: "2008",
    },
    {
        name: "Acronis",
        description:
            "Cyber protection and data backup for enterprise workloads — backup, disaster recovery, and anti-ransomware.",
        logoSrc: "/images/v3/b_6.png",
        specializations: ["Backup", "Disaster Recovery", "Cyber Protection"],
        partnerSince: "2016",
    },
    {
        name: "Cybernetics",
        description:
            "Enterprise technology solutions and services. Infrastructure, security, and managed services for modern businesses.",
        logoSrc: "/images/v3/b_7.png",
        specializations: ["Tape Solutions", "Data Backup", "Archive Storage"],
        partnerSince: "2000",
    },
];

const BENEFIT_ICONS = [CheckCircle, Building07, Settings01];

const DEFAULT_BENEFITS = [
    {
        title: "Certified expertise",
        description:
            "Our engineers hold certifications across the platforms we resell, so your solutions are designed and deployed by people who know them inside and out.",
    },
    {
        title: "Direct vendor relationships",
        description:
            "Decades-long partnerships give us priority escalation paths, competitive pricing, and early access to new technology.",
    },
    {
        title: "End-to-end delivery",
        description:
            "From sizing and procurement to integration, migration, and ongoing support — one partner accountable for the entire lifecycle.",
    },
];

/* -------------------------------------------------------------------------- */
/*  Motion + shared primitives                                                 */
/* -------------------------------------------------------------------------- */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** First sentence of a description — keeps partner cards to a single short line. */
function firstSentence(text?: string): string {
    if (!text) return "";
    const idx = text.indexOf(". ");
    return idx > 0 ? text.slice(0, idx + 1) : text;
}

/** Thin brand gradient hairline. */
function Hairline({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cx("h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent", className)}
        />
    );
}

/** Wide-tracking eyebrow — matches the home hero badge style. */
function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
            {children}
        </span>
    );
}

/** Correct known partner name/logo mismatches from CMS or legacy data. */
function normalizePartner(p: any): Partner {
    let name = typeof p.name === "string" ? p.name.trim() : "";
    if (/^acronix$/i.test(name)) name = "Acronis";

    let logoSrc: string | undefined = p.logo_src ?? p.logoSrc;
    const key = name.toLowerCase();
    if (key === "acronis") logoSrc = "/images/v3/b_6.png";
    else if (key === "cybernetics") logoSrc = "/images/v3/b_7.png";
    else if (key === "cloudsafe" && typeof logoSrc === "string" && logoSrc.includes("b_6")) {
        logoSrc = undefined;
    }

    return {
        name,
        description: p.description,
        logoSrc,
        specializations: p.specializations ?? [],
        partnerSince: p.partner_since ?? p.partnerSince,
        // Keep every partner card the same size — never span full row.
        fullWidth: false,
    };
}

/** Navy logo tile surface — the partner marks are white-on-transparent PNGs,
    so they sit on a constant dark panel that reads well in BOTH themes. */
const NAVY_TILE = "bg-gradient-to-br from-[#0a1730] to-[#0d2444] ring-1 ring-white/10 ring-inset";

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PartnersPage({
    cmsData,
    orderedSections,
}: {
    cmsData?: Record<string, any>;
    orderedSections?: CMSRenderableSection[];
}) {
    const reduceMotion = useReducedMotion();

    /** Scroll-triggered entrance reveal (skips transforms when reduced motion). */
    const reveal = (delay = 0) => ({
        initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6, ease: EASE, delay },
    });

    /** Above-the-fold entrance (plays on mount, not on scroll). */
    const enter = (delay = 0) => ({
        initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE, delay },
    });

    const hero = cmsData?.hero ?? {};
    const intro = cmsData?.intro ?? {};
    const benefitsSection = cmsData?.benefits ?? {};
    const finalCta = cmsData?.final_cta ?? cmsData?.cta ?? {};
    const partners = (cmsData?.partners_grid?.partners ?? DEFAULT_PARTNERS).map(normalizePartner);
    const benefits = (benefitsSection.items ?? benefitsSection.benefits ?? DEFAULT_BENEFITS).map(
        (b: any, i: number) => ({
            title: b.title ?? b.heading,
            description: b.description ?? b.text,
            icon: BENEFIT_ICONS[i % BENEFIT_ICONS.length],
        }),
    );
    const extraSections = (orderedSections ?? []).filter(
        (section) => !["hero", "intro", "partners_grid", "benefits", "final_cta", "cta"].includes(section.section_key),
    );

    return (
        <main className="min-h-screen bg-primary">
            {/* ================================================================= */}
            {/*  Hero — gradient band with layered depth                          */}
            {/* ================================================================= */}
            <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
                {/* Depth layers */}
                <div
                    aria-hidden="true"
                    className="texture-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
                />
                <BrandOrbs />
                <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" />

                <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center md:px-8">
                    <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        aria-label="Breadcrumb"
                    >
                        <ol className="flex items-center gap-1.5 text-sm font-medium">
                            <li>
                                <Link
                                    href="/"
                                    className="text-tertiary transition duration-100 ease-linear hover:text-brand-secondary"
                                >
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">
                                <ChevronRight className="size-4 text-fg-quaternary" />
                            </li>
                            <li>
                                <span aria-current="page" className="text-brand-secondary">
                                    Partners
                                </span>
                            </li>
                        </ol>
                    </motion.nav>

                    <motion.div {...enter(0.1)} className="mt-6 flex items-center gap-2.5">
                        <PulseAccent />
                        <Eyebrow>Partner Ecosystem</Eyebrow>
                    </motion.div>

                    <motion.h1
                        {...enter(0.2)}
                        className="mt-3 text-display-md font-semibold tracking-tight text-primary md:text-display-lg"
                    >
                        {hero.headline ?? "Technology Partners"}
                    </motion.h1>

                    <motion.p {...enter(0.35)} className="mt-4 max-w-2xl text-lg text-tertiary md:mt-6 md:text-xl">
                        {hero.subheadline ??
                            "We partner with the world's leading technology companies to deliver best-in-class enterprise solutions."}
                    </motion.p>

                    <motion.div
                        {...enter(0.45)}
                        className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:justify-center md:mt-10"
                    >
                        <Button
                            color="secondary"
                            size="xl"
                            href={hero.cta_secondary?.href ?? hero.ctaSecondary?.href ?? "/solutions"}
                        >
                            {hero.cta_secondary?.label ?? hero.ctaSecondary?.label ?? "Explore Solutions"}
                        </Button>
                        <Button
                            size="xl"
                            href={hero.cta_primary?.href ?? hero.ctaPrimary?.href ?? "/contact"}
                            iconTrailing={ArrowRight}
                        >
                            {hero.cta_primary?.label ?? hero.ctaPrimary?.label ?? "Get In Touch"}
                        </Button>
                    </motion.div>

                    {/* Quiet proof row removed — keep hero focused on headline + CTAs */}
                </div>
            </section>

            {/* ================================================================= */}
            {/*  Intro                                                            */}
            {/* ================================================================= */}
            <section className="bg-primary py-16 md:py-24">
                <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-16">
                    <motion.div {...reveal()} className="relative">
                        <BackgroundPattern
                            pattern="grid"
                            size="md"
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-10 -left-10 opacity-70"
                        />
                        <Image
                            src="/images/a6a39917-78d3-4c8b-a0f1-f967819a7b01.png"
                            alt="ICE Technology Partners"
                            width={640}
                            height={480}
                            className="relative h-auto w-full rounded-2xl object-cover ring-1 ring-secondary dark:shadow-[0_0_40px_rgb(4_155_251/0.12)]"
                        />
                    </motion.div>

                    <motion.div {...reveal(0.1)}>
                        <Eyebrow>Who We Work With</Eyebrow>
                        <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary">
                            {intro.heading ?? "Technology Partners We Work With"}
                        </h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5">
                            {intro.description ??
                                "ICE resells and integrates solutions from industry-leading technology partners. We work with trusted providers to deliver the best fit for your business needs, from cloud hosting and disaster recovery to hardware and managed services."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ================================================================= */}
            {/*  Partner cards — logo-forward                                     */}
            {/* ================================================================= */}
            <section className="bg-primary pb-16 md:pb-24">
                <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
                    <motion.div {...reveal()} className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <Eyebrow>Strategic Alliances</Eyebrow>
                        <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary">Our Partners</h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5">
                            We partner with industry leaders to deliver enterprise-grade solutions tailored to your business.
                        </p>
                    </motion.div>

                    <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 md:gap-6">
                        {partners.map((partner: any, i: number) => (
                            <motion.li
                                key={partner.name}
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.6, ease: EASE, delay: (i % 2) * 0.08 }}
                                className="h-full"
                            >
                                <div className="group flex h-full flex-col rounded-2xl bg-primary p-3 ring-1 ring-secondary transition duration-200 ease-out ring-inset hover:ring-brand hover:shadow-lg motion-safe:hover:-translate-y-1 dark:hover:shadow-[0_0_32px_rgb(4_155_251/0.14)]">
                                    {/* Logo tile — the partner marks are white-on-transparent
                                        PNGs, so a constant dark navy surface keeps them vivid
                                        and legible in both themes (no filter inversion, which
                                        would corrupt the subtly tinted marks). */}
                                    <div
                                        className={cx(
                                            "relative flex h-32 items-center justify-center overflow-hidden rounded-xl px-6 md:h-36",
                                            NAVY_TILE,
                                        )}
                                    >
                                        <BackgroundPattern
                                            pattern="grid"
                                            size="md"
                                            aria-hidden="true"
                                            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.07]"
                                        />
                                        {/* brand glow */}
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(4_155_251/0.30),transparent)] blur-xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                                        />
                                        {partner.logoSrc ? (
                                            <Image
                                                src={partner.logoSrc}
                                                alt={partner.name}
                                                width={240}
                                                height={96}
                                                loading="lazy"
                                                className="relative h-14 w-auto max-w-[72%] object-contain opacity-90 transition duration-300 ease-out group-hover:scale-[1.04] group-hover:opacity-100 md:h-16"
                                            />
                                        ) : (
                                            <span className="relative text-xl font-semibold tracking-tight text-white/90 transition duration-300 ease-out group-hover:text-white">
                                                {partner.name}
                                            </span>
                                        )}
                                        {partner.partnerSince && (
                                            <span className="pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] font-medium tracking-[0.15em] text-white/40 uppercase">
                                                Since {partner.partnerSince}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name + one-line description + specialization pills */}
                                    <div className="flex flex-1 flex-col px-3 pt-4 pb-3 md:px-4">
                                        <h3 className="text-md font-semibold text-primary md:text-lg">{partner.name}</h3>
                                        <p className="mt-1 line-clamp-1 text-sm text-tertiary md:text-md">
                                            {firstSentence(partner.description)}
                                        </p>
                                        {partner.specializations.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {partner.specializations.slice(0, 4).map((spec: string) => (
                                                    <Badge key={spec} size="sm" color="brand">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ================================================================= */}
            {/*  Partnership benefits                                             */}
            {/* ================================================================= */}
            <section className="bg-primary pb-16 md:pb-24">
                <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
                    <motion.div {...reveal()} className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <Eyebrow>Why It Matters</Eyebrow>
                        <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary">
                            {benefitsSection.heading ?? "Why Partner-Backed Solutions"}
                        </h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5">
                            {benefitsSection.description ??
                                "Our vendor partnerships translate directly into better outcomes for your business."}
                        </p>
                    </motion.div>

                    <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 md:mt-16 md:grid-cols-3">
                        {benefits.map((benefit: any, i: number) => (
                            <motion.li key={benefit.title} {...reveal(i * 0.08)} className="flex flex-col items-start gap-4">
                                <FeaturedIcon icon={benefit.icon} size="lg" color="brand" theme="modern" />
                                <div>
                                    <h3 className="text-lg font-semibold text-primary">{benefit.title}</h3>
                                    <p className="mt-1.5 text-md text-tertiary">{benefit.description}</p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            <GenericCMSSections sections={extraSections} />

            {/* ================================================================= */}
            {/*  IBM partnership spotlight + CTA — textured band with watermark   */}
            {/* ================================================================= */}
            <section className="relative isolate overflow-hidden bg-secondary py-16 md:py-24">
                <Hairline className="absolute inset-x-0 top-0" />
                <Hairline className="absolute inset-x-0 bottom-0" />

                {/* Depth layers */}
                <div
                    aria-hidden="true"
                    className="texture-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_80%)]"
                />
                <BrandOrbs />
                <div aria-hidden="true" className="texture-noise pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]" />

                {/* Oversized decorative glyph bleeding past the band edge */}
                <ShieldTick
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 bottom-0 size-48 text-brand-500/10 md:size-64 dark:text-brand-500/15"
                />

                <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                    <motion.div {...reveal()} className="flex flex-col items-start">
                        <Image
                            src="/images/ibm.svg"
                            alt="IBM Business Partner"
                            width={160}
                            height={64}
                            className="h-12 w-auto md:h-14"
                        />
                        <h2 className="mt-8 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">
                            {finalCta.heading ?? "Proud IBM Business Partner Since 1990"}
                        </h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                            {finalCta.description ??
                                "Leverage our deep IBM expertise and partner ecosystem to modernize your infrastructure and accelerate your digital transformation."}
                        </p>
                        <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row md:mt-10">
                            <Button
                                color="secondary"
                                size="xl"
                                href={finalCta.cta_secondary?.href ?? finalCta.ctaSecondary?.href ?? "/solutions"}
                            >
                                {finalCta.cta_secondary?.label ?? finalCta.ctaSecondary?.label ?? "Explore Solutions"}
                            </Button>
                            <Button
                                size="xl"
                                href={finalCta.cta_primary?.href ?? finalCta.ctaPrimary?.href ?? "/contact"}
                                iconTrailing={ArrowRight}
                            >
                                {finalCta.cta_primary?.label ?? finalCta.ctaPrimary?.label ?? "Get In Touch"}
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div {...reveal(0.12)} className="relative">
                        {/* Gentle continuous ambient glow behind the stat card */}
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-8 rounded-full bg-brand-500/10 blur-3xl"
                            animate={reduceMotion ? undefined : { opacity: [0.4, 0.85, 0.4], scale: [1, 1.05, 1] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center ring-1 ring-secondary md:p-10 dark:shadow-[0_0_40px_rgb(4_155_251/0.12)]">
                            <BackgroundPattern
                                pattern="circle"
                                size="md"
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60"
                            />
                            <div
                                aria-hidden="true"
                                className="texture-noise pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                            />
                            <div className="relative flex flex-col items-center">
                                <span className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text font-mono text-display-xl font-semibold text-transparent md:text-display-2xl dark:from-brand-300 dark:via-brand-400 dark:to-brand-600">
                                    35+
                                </span>
                                <span className="mt-2 text-md font-medium text-primary md:text-lg">
                                    Years as an IBM Business Partner
                                </span>
                                <Hairline className="my-6 max-w-60" />
                                <span className="text-xs font-medium tracking-[0.2em] text-quaternary uppercase">
                                    Partnership est. 1990
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
