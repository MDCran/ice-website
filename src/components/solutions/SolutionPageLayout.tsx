"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import SolutionMetrics, { type MetricPreset } from "./SolutionMetrics";

interface SolutionPageLayoutProps {
  title: string;
  subtitle: string;
  categoryBadge: { label: string; icon: React.ReactNode };
  heroVisualization?: React.ReactNode;
  features: Array<{ icon: React.ReactNode; title: string; description: string }>;
  process: Array<{ step: string; title: string; description: string }>;
  benefits: string[];
  metricsPreset?: MetricPreset;
  extraSections?: React.ReactNode;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel?: string;
  breadcrumbLabel: string;
}

export default function SolutionPageLayout({
  title,
  subtitle,
  categoryBadge,
  heroVisualization,
  features,
  process,
  benefits,
  metricsPreset,
  extraSections,
  ctaTitle,
  ctaSubtitle,
  ctaButtonLabel = "Schedule a Consultation",
  breadcrumbLabel,
}: SolutionPageLayoutProps) {
  return (
    <main className="pt-28 lg:pt-36">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pb-20 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 right-0 w-[600px] h-[400px] ambient-orb ambient-orb-purple opacity-10" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[300px] ambient-orb ambient-orb-indigo opacity-10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="flex items-center gap-2 text-sm text-slate-500 mb-8"
          >
            <Link href="/solutions" className="hover:text-sky-400 transition-colors">
              Solutions
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">{breadcrumbLabel}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-4 py-1.5 mb-6">
                {categoryBadge.icon}
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  {categoryBadge.label}
                </span>
              </div>

              <h1
                className="text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-tight"
                dangerouslySetInnerHTML={{ __html: title }}
              />

              <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl">
                {subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  <span>Get Started</span>
                  <ArrowRight className="relative z-10 h-4 w-4" />
                </Link>
                <Link href="/solutions" className="btn-outline">
                  All Solutions
                </Link>
              </div>
            </motion.div>

            {heroVisualization && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" as const }}
                className="hidden lg:flex justify-center"
              >
                {heroVisualization}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/15 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-3">
              Key Capabilities
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Comprehensive <span className="gradient-text">Features</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Purpose-built capabilities designed to deliver measurable results for your
              enterprise.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: "easeOut" as const }}
                className="glass-card rounded-2xl p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-400 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section
        className="section-padding relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,16,32,0.5), rgba(2,6,23,1))",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] ambient-orb ambient-orb-indigo opacity-8" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-3">
              The Process
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" as const }}
                className="relative h-full"
              >
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-sky-500/30 to-transparent z-0" />
                )}
                <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col">
                  <span className="text-4xl font-black text-sky-500/15 absolute top-4 right-4">
                    {step.step}
                  </span>
                  <div className="timeline-dot mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="dot-pattern absolute inset-0 opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/15 to-transparent" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] ambient-orb ambient-orb-indigo opacity-10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-3">
                Why Choose ICE
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                The <span className="gradient-text">Benefits</span>
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                With over three decades of experience as an IBM Business Partner, ICE
                delivers enterprise-grade solutions backed by proven expertise and
                dedicated support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" as const }}
              className="space-y-4"
            >
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" as const }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-sky-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Metrics Dashboard ───────────────────────────────────────── */}
      {metricsPreset && (
        <section
          className="section-padding relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(2,6,23,1), rgba(10,16,32,0.5), rgba(2,6,23,1))" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/15 to-transparent" />
          <div className="dot-grid absolute inset-0 opacity-20" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] ambient-orb ambient-orb-purple opacity-8" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[250px] ambient-orb ambient-orb-indigo opacity-8" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SolutionMetrics preset={metricsPreset} />
          </div>
        </section>
      )}

      {/* ── Extra Sections (e.g. ComparisonTable) ────────────────────── */}
      {extraSections && (
        <section className="section-padding relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/15 to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {extraSections}
          </div>
        </section>
      )}

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] ambient-orb ambient-orb-purple opacity-15" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <h2
              className="text-3xl font-bold sm:text-4xl"
              dangerouslySetInnerHTML={{ __html: ctaTitle }}
            />
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              {ctaSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary">
                <span>{ctaButtonLabel}</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </Link>
              <Link href="/solutions" className="btn-outline">
                Explore All Solutions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
