"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import * as Accordion from "@radix-ui/react-accordion";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Shield,
  Server,
  Layers,
  Factory,
  Landmark,
  HeartPulse,
  ShieldCheck,
  Scale,
  Award,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import TiltCard from "@/components/effects/TiltCard";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 35, suffix: "+", label: "Years of Experience" },
  { value: 730, suffix: "+", label: "Projects Delivered" },
  { value: 198, suffix: "+", label: "Clients Served" },
  { value: 100, suffix: "%", label: "Uptime SLA" },
];

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    icon: Award,
    title: "IBM Business Partner Since 1990",
    description:
      "Over three decades of trusted expertise as an IBM Business Partner. We bring deep knowledge of IBM Power Systems, IBM i, and enterprise solutions to every engagement.",
  },
  {
    icon: Server,
    title: "Enterprise-Grade Infrastructure",
    description:
      "Our SOC 1-SSAE 18 certified data centers provide the reliability, security, and performance that enterprise workloads demand. Redundant power, cooling, and connectivity ensure maximum uptime.",
  },
  {
    icon: Layers,
    title: "End-to-End Solutions",
    description:
      "From cloud hosting and disaster recovery to hardware procurement and managed services, we provide comprehensive technology solutions that cover your entire IT lifecycle.",
  },
];

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "Why choose International Computer Exchange?",
    answer:
      "International Computer Exchange has been an IBM Business Partner since 1990, providing over 35 years of enterprise technology expertise. We specialize in IBM Power Systems, cloud hosting, disaster recovery, and managed services. Our SOC 1-SSAE 18 certified data centers, combined with our deep technical knowledge and personalized service, make us a trusted partner for businesses that demand reliability and performance.",
  },
  {
    id: "faq-2",
    question: "What solutions does ICE offer?",
    answer:
      "ICE offers a comprehensive suite of enterprise technology solutions including Managed Cloud Hosting (private, hybrid, and public cloud), Disaster Recovery as a Service (DRaaS), Backup as a Service (BaaS), IBM i Security solutions, Managed Security services, Hardware sales (new and refurbished IBM Power Systems, Lenovo, Cisco, Dell), and end-to-end IT managed services.",
  },
  {
    id: "faq-3",
    question: "Where is ICE's infrastructure hosted?",
    answer:
      "ICE leverages Tier-3 data centers with geographically separated backup infrastructure. All facilities are PCI, HIPAA, SOX, and GDPR compliant, featuring redundant power systems, enterprise-grade cooling, Flash Systems Storage, multiple network carriers, and 24/7 physical security monitoring to ensure maximum uptime and data protection.",
  },
  {
    id: "faq-4",
    question: "Does ICE resell new hardware?",
    answer:
      "Yes, ICE resells both new and refurbished enterprise hardware. As an authorized partner for IBM, Lenovo, Cisco, Dell, and other leading manufacturers, we can provide the latest servers, storage systems, and networking equipment. We also offer certified refurbished IBM Power Systems for cost-effective solutions without compromising on quality.",
  },
  {
    id: "faq-5",
    question: "How do I get started?",
    answer:
      "Getting started with ICE is simple. Contact us at 561-394-9188 or email sales@icesales.com to schedule a consultation. Our team will assess your current infrastructure, understand your business requirements, and recommend tailored solutions that fit your needs and budget. We also offer free initial assessments for qualified businesses.",
  },
];

interface Industry {
  icon: LucideIcon;
  title: string;
  description: string;
}

const INDUSTRIES: Industry[] = [
  {
    icon: Factory,
    title: "Manufacturing & Logistics",
    description:
      "Powering supply chains and production systems with reliable IBM infrastructure and cloud solutions.",
  },
  {
    icon: Landmark,
    title: "Financial Services",
    description:
      "Secure, compliant hosting and data protection for banks, credit unions, and financial institutions.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare",
    description:
      "HIPAA-ready infrastructure and managed services for healthcare providers and health systems.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance",
    description:
      "High-availability platforms and disaster recovery for insurance carriers and agencies.",
  },
  {
    icon: Scale,
    title: "Legal & Professional Services",
    description:
      "Secure document management, reliable hosting, and IT support for law firms and professional organizations.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Animated Counter                                                           */
/* -------------------------------------------------------------------------- */

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;
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
  }, [inView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function WhyICEPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const diffInView = useInView(diffRef, { once: true, margin: "-100px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" });
  const industryInView = useInView(industryRef, {
    once: true,
    margin: "-100px",
  });

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ================================================================= */}
      {/*  Page Hero                                                        */}
      {/* ================================================================= */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/data_center.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 pt-20 lg:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Why <span className="gradient-text">ICE</span>
          </motion.h1>

          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-sm text-slate-400"
          >
            <Link href="/" className="hover:text-sky-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <span className="text-sky-400">Why ICE</span>
          </motion.nav>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Value Proposition Section                                        */}
      {/* ================================================================= */}
      <section className="section-padding" ref={statsRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Why Choose{" "}
              <span className="gradient-text">
                International Computer Exchange?
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              For over three decades, businesses have trusted ICE to deliver
              reliable, enterprise-grade technology solutions backed by deep
              expertise and unmatched service.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={scaleIn}
                className="glass-card rounded-2xl p-8 text-center group"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    inView={statsInView}
                  />
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Key Differentiators                                              */}
      {/* ================================================================= */}
      <section className="section-padding bg-[#0a1020]/30" ref={diffRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={diffInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Sets Us <span className="gradient-text">Apart</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={diffInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {DIFFERENTIATORS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                >
                  <TiltCard>
                    <div className="glass-card rounded-2xl p-8 group h-full">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400 mb-6 transition-colors duration-300 group-hover:bg-sky-400/20">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  FAQ Accordion Section                                            */}
      {/* ================================================================= */}
      <section className="section-padding" ref={faqRef}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get answers to common questions about our services, capabilities,
              and how we can help your business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion.Root type="single" collapsible className="space-y-4">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={faqInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <Accordion.Item
                    value={faq.id}
                    className="glass-card rounded-xl overflow-hidden border-l-2 border-l-sky-500/50"
                  >
                    <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer">
                      <span className="text-white font-medium text-base pr-4 group-hover:text-sky-400 transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown className="h-5 w-5 text-sky-400 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                      <div className="px-6 pb-5 pt-0">
                        <div className="gradient-line mb-4" />
                        <p className="text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </motion.div>
              ))}
            </Accordion.Root>
          </motion.div>

          {/* Accordion slide animations */}
          <style jsx global>{`
            @keyframes slideDown {
              from {
                height: 0;
                opacity: 0;
              }
              to {
                height: var(--radix-accordion-content-height);
                opacity: 1;
              }
            }
            @keyframes slideUp {
              from {
                height: var(--radix-accordion-content-height);
                opacity: 1;
              }
              to {
                height: 0;
                opacity: 0;
              }
            }
            .animate-slideDown {
              animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
            }
            .animate-slideUp {
              animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
            }
          `}</style>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Industries Section                                               */}
      {/* ================================================================= */}
      <section className="section-padding bg-[#0a1020]/30" ref={industryRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={industryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Industries <span className="gradient-text">We Serve</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Trusted by organizations across critical industries that depend on
              reliable, secure technology infrastructure.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={industryInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {INDUSTRIES.map((industry, i) => {
              const Icon = industry.icon;
              return (
                <motion.div
                  key={industry.title}
                  custom={i}
                  variants={scaleIn}
                >
                  <TiltCard>
                    <div className="glass-card rounded-2xl p-8 group h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400 mb-5 transition-colors duration-300 group-hover:bg-sky-400/20">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {industry.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  CTA Section                                                      */}
      {/* ================================================================= */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="glass-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            <div className="relative z-10">
              <motion.div
                custom={0}
                variants={fadeUp}
                className="flex justify-center mb-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </motion.div>

              <motion.h2
                custom={1}
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Ready to{" "}
                <span className="gradient-text">Get Started?</span>
              </motion.h2>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-slate-400 text-lg max-w-2xl mx-auto mb-8"
              >
                Let our team of experts help you find the right technology
                solution for your business. Contact us today for a free
                consultation.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/contact" className="btn-primary">
                  <span className="flex items-center gap-2">
                    Contact Us Today
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link href="/solutions" className="btn-outline">
                  Explore Solutions
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
