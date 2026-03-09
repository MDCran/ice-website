"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import {
  Cloud, Shield, Lock, Server, ArrowRight, CheckCircle,
  Cpu, Globe, Database, Zap, Building2, Landmark,
  HeartPulse, Scale, Factory, Award, Clock, Users,
  type LucideIcon,
} from "lucide-react";
import LazyCanvas from "@/components/three/LazyCanvas";
import TiltCard from "@/components/effects/TiltCard";
import MagneticButton from "@/components/effects/MagneticButton";
import CyberRadar from "@/components/ui/CyberRadar";
import InfrastructureDiagram from "@/components/ui/InfrastructureDiagram";
import EnterpriseMetrics from "@/components/ui/EnterpriseMetrics";
import { useParallax } from "@/hooks/useParallax";

/* ══════════════════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════════════════ */

const services = [
  {
    icon: Cloud,
    title: "Managed Cloud Services",
    description: "Scalable cloud hosting, private cloud, hybrid cloud, and seamless migration services for enterprise workloads.",
    href: "/solutions/managed-cloud-hosting",
    gradient: "from-sky-500/20 to-blue-500/20",
    glowColor: "group-hover:shadow-sky-500/20",
  },
  {
    icon: Shield,
    title: "Data Protection",
    description: "Enterprise backup, disaster recovery, high availability, and ransomware recovery to safeguard critical data.",
    href: "/solutions/backup-as-a-service",
    gradient: "from-blue-500/20 to-sky-500/20",
    glowColor: "group-hover:shadow-blue-500/20",
  },
  {
    icon: Lock,
    title: "Managed Security",
    description: "IBM i security, endpoint protection, threat detection, and 24/7 security monitoring for complete coverage.",
    href: "/solutions/ibm-i-security",
    gradient: "from-blue-500/20 to-sky-500/20",
    glowColor: "group-hover:shadow-blue-500/20",
  },
  {
    icon: Server,
    title: "Managed Services",
    description: "Microsoft services, automation, systems management, and IBM Power VS — fully managed by our experts.",
    href: "/solutions/managed-microsoft",
    gradient: "from-sky-500/20 to-blue-500/20",
    glowColor: "group-hover:shadow-sky-500/20",
  },
];

const stats: { value: number; suffix: string; label: string; icon: LucideIcon }[] = [
  { value: 35, suffix: "+", label: "Years of Experience", icon: Clock },
  { value: 730, suffix: "+", label: "Successful Projects", icon: Zap },
  { value: 198, suffix: "+", label: "Enterprise Clients", icon: Users },
  { value: 100, suffix: "%", label: "Uptime SLA", icon: Award },
];

const timeline = [
  { year: "1990", title: "Founded", description: "Established as an IBM Business Partner in Boca Raton, Florida." },
  { year: "2000", title: "Cloud Pioneer", description: "Early adoption of cloud infrastructure and managed hosting solutions." },
  { year: "2010", title: "Security Focus", description: "Expanded into managed security, threat detection, and data protection." },
  { year: "2020", title: "Hybrid Cloud Era", description: "Full-suite hybrid cloud, disaster recovery, and automation services." },
  { year: "2025", title: "35 Years Strong", description: "Serving 198+ enterprises across manufacturing, finance, healthcare, and more." },
];

const industries = [
  { name: "Manufacturing", icon: Factory },
  { name: "Financial Services", icon: Landmark },
  { name: "Healthcare", icon: HeartPulse },
  { name: "Insurance", icon: Shield },
  { name: "Legal", icon: Scale },
];

const partnerNames = [
  "IBM", "Lenovo", "Cisco", "Dell", "Printronix", "CloudSafe", "Acronix", "DASCOM",
];

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ══════════════════════════════════════════════════════════════════════════ */

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

function StatCard({ value, suffix, label, icon: Icon, inView }: {
  value: number; suffix: string; label: string; icon: LucideIcon; inView: boolean;
}) {
  const count = useCountUp(value, inView);
  return (
    <div className="text-center group">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 mb-4 transition-all duration-300 group-hover:from-sky-500/25 group-hover:to-blue-500/25 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-4xl md:text-5xl font-bold gradient-text-glow">
        {count}{suffix}
      </p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════════════════════ */

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  const parallaxSlow = useParallax(0.1);
  const parallaxMed = useParallax(0.2);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay loop muted playsInline
          poster="/videos/data_center_cover.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/data_center.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay hero-overlay-home absolute inset-0 z-[1]" />
        <div className="absolute inset-0 z-[2]">
          <LazyCanvas scene="particles" />
        </div>

        {/* Ambient orbs with parallax */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 ambient-orb ambient-orb-cyan z-[1] animate-float" style={{ transform: `translateY(${parallaxSlow}px)`, willChange: "transform" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 ambient-orb ambient-orb-blue z-[1]" style={{ animationDelay: "3s", transform: `translateY(${parallaxMed}px)`, willChange: "transform" }} />

        <div className="relative z-[3] flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-4 py-2 text-sm text-sky-400 backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            IBM Business Partner Since 1990
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            You Know Your Business.{" "}
            <br className="hidden sm:block" />
            <span className="shimmer-text">We Know Technology.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 max-w-2xl text-lg text-slate-300/90 sm:text-xl leading-relaxed"
          >
            Together, we create innovative solutions. Cloud hosting, data protection, cybersecurity, and managed services — delivered by a team with 35+ years of enterprise expertise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton>
              <Link href="/contact" className="btn-primary">
                <span>Schedule a Consultation</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/solutions" className="btn-outline">
                <span>Explore Solutions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-[3]" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SERVICES GRID
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative">
        <div className="absolute inset-0 mesh-gradient-animated" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">What We Do</p>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Enterprise-Grade <span className="gradient-text">Solutions</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400 leading-relaxed">
              End-to-end technology solutions engineered for reliability, security, and performance across every layer of your infrastructure.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard className="h-full">
                  <Link href={s.href} className={`group block h-full`}>
                    <div className={`glass-card flex h-full flex-col rounded-2xl p-7 transition-shadow duration-500 ${s.glowColor} group-hover:shadow-[0_0_40px]`}>
                      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-sky-400 transition-all duration-300 group-hover:scale-110`}>
                        <s.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                      <p className="flex-1 text-sm leading-relaxed text-slate-400">{s.description}</p>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 transition-all group-hover:text-sky-300 group-hover:gap-2.5">
                        Learn more
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="section-padding relative bg-gradient-to-b from-[#020617] via-[#0a1020] to-[#020617] overflow-hidden"
      >
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] ambient-orb ambient-orb-cyan opacity-20" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">By The Numbers</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Proven <span className="gradient-text">Enterprise Track Record</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-10 md:grid-cols-4"
          >
            {stats.map((s) => (
              <StatCard key={s.label} {...s} inView={statsInView} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DATA CENTERS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
                <Image
                  src="/images/service/data_center.jpg"
                  alt="ICE high-security data center"
                  width={720}
                  height={480}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 lg:bottom-6 lg:-right-6 glass-card-static rounded-xl px-5 py-3 border border-sky-500/20 shadow-lg">
                <p className="text-xs text-slate-400">Certified</p>
                <p className="text-sm font-bold text-white">SOC 1 SSAE 18 Type II</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Infrastructure</p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                High-Security{" "}
                <span className="gradient-text">Data Centers</span>
              </h2>
              <p className="mt-5 leading-relaxed text-slate-400">
                Our SOC&nbsp;1 SSAE&nbsp;18 Type&nbsp;II certified data centers
                deliver the reliability, redundancy, and security your
                mission-critical workloads demand.
              </p>
              <ul className="mt-7 space-y-4">
                {[
                  "Tier-3 data centers with guaranteed uptime",
                  "PCI, HIPAA, SOX, and GDPR compliant",
                  "Geographically separated backup data centers",
                  "Redundant power, cooling, and Flash Systems Storage",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Link href="/solutions/managed-cloud-hosting" className="btn-primary">
                  <span>Learn More</span>
                  <ArrowRight className="relative z-10 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INFRASTRUCTURE DIAGRAM
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-animated opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Architecture</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Enterprise <span className="gradient-text">Data Flow</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400 leading-relaxed">
              From client to backup — every layer of your infrastructure is protected, monitored, and optimized.
            </p>
          </motion.div>
          <InfrastructureDiagram />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          COMPANY TIMELINE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative bg-gradient-to-b from-[#020617] via-[#0a1020]/50 to-[#020617] overflow-hidden">
        <div className="dot-pattern absolute inset-0 opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Our Journey</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              35+ Years of <span className="gradient-text">Innovation</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sky-400/40 via-blue-400/40 to-transparent md:-translate-x-px" />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start gap-8 mb-12 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                  <div className="timeline-dot" />
                </div>

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8 md:ml-auto"}`}>
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUSTED PARTNERS (fixed marquee)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Technology Partners</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Trusted <span className="gradient-text">Partners</span>
            </h2>
          </motion.div>
        </div>

        {/* Seamless infinite marquee */}
        <div className="relative">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />

          <div className="overflow-hidden">
            <div className="flex w-fit animate-marquee">
              {[0, 1].map((setIdx) =>
                Array.from({ length: 8 }, (_, i) => (
                  <div key={`${setIdx}-${i}`} className="flex-shrink-0 mx-8 flex items-center justify-center">
                    <Image
                      src={`/images/v3/b_${i + 1}.png`}
                      alt={partnerNames[i] || `Partner ${i + 1}`}
                      width={160}
                      height={60}
                      className="h-12 w-auto object-contain opacity-50 hover:opacity-100 transition-all duration-300 partner-logo-marquee"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INDUSTRIES + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative bg-gradient-to-b from-[#020617] via-[#0a1020]/40 to-[#020617] overflow-hidden">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-card relative rounded-2xl p-8 md:p-14 overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 ambient-orb ambient-orb-cyan opacity-15" />
            <div className="absolute bottom-0 left-0 w-60 h-60 ambient-orb ambient-orb-blue opacity-10" />

            <div className="relative z-10 grid gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Why Choose ICE</p>
                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                  Ready to Modernize Your{" "}
                  <span className="gradient-text">IT Infrastructure?</span>
                </h2>
                <p className="mt-5 leading-relaxed text-slate-400">
                  Let our experts conduct a free assessment of your current IT
                  environment and show you how we can reduce costs, improve
                  performance, and strengthen security.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/contact" className="btn-primary">
                    <span>Get Free Assessment</span>
                    <ArrowRight className="relative z-10 h-4 w-4" />
                  </Link>
                  <Link href="/why-ice" className="btn-outline">
                    <span>Why ICE</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400 mb-6">
                  Industries We Serve
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {industries.map((ind) => (
                    <div
                      key={ind.name}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-sky-500/20 hover:bg-white/[0.04]"
                    >
                      <ind.icon className="h-4 w-4 text-sky-400 shrink-0" />
                      <span className="text-sm text-slate-300">{ind.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4 rounded-xl border border-sky-500/10 bg-sky-500/[0.03] p-4">
                  <Image
                    src="/images/ibm.svg"
                    alt="IBM Business Partner"
                    width={44}
                    height={44}
                    className="h-9 w-auto opacity-60"
                  />
                  <p className="text-sm text-slate-400">
                    Proud IBM Business Partner — delivering enterprise solutions since 1990.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST & SECURITY BADGES
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-animated opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Enterprise Trust</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Built for <span className="gradient-text">Reliability</span>
            </h2>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-[1fr_300px] items-center">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { icon: Shield, title: "SOC 1 Certified", desc: "SSAE 18 Type II audited data centers" },
                { icon: Lock, title: "Zero-Trust Security", desc: "Multi-layered threat detection and response" },
                { icon: Database, title: "99.999% Uptime", desc: "Redundant infrastructure with failover" },
                { icon: Globe, title: "24/7 Monitoring", desc: "Round-the-clock NOC and SOC operations" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <TiltCard>
                    <div className="glass-card shine-sweep rounded-2xl p-6 text-center group">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-400 mb-4 transition-all duration-300 group-hover:from-sky-500/25 group-hover:to-blue-500/25 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {/* Cyber Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="hidden lg:flex justify-center"
            >
              <CyberRadar />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PERFORMANCE METRICS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Performance</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Enterprise <span className="gradient-text">Metrics</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400 leading-relaxed">
              Real-time performance indicators that reflect our commitment to reliability and security.
            </p>
          </motion.div>
          <EnterpriseMetrics />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a1020]/30 to-[#020617]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] ambient-orb ambient-orb-cyan opacity-15" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight">
              Let&apos;s Build Your{" "}
              <span className="gradient-text">Future Together</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              Schedule a free consultation with our enterprise architects and discover how ICE can transform your infrastructure.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary">
                <span>Get Started</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </Link>
              <a href="tel:5613949188" className="btn-outline">
                <span>Call 561-394-9188</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
