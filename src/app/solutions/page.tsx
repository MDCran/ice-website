"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Cloud, Shield, Lock, Server, ArrowRight,
  Database, HardDrive, RefreshCcw, ShieldAlert,
  Monitor, Cpu, Settings, Workflow, Bug,
  ShieldCheck, Radar, Crosshair,
} from "lucide-react";
import TiltCard from "@/components/effects/TiltCard";

const categories = [
  {
    title: "Managed Cloud Services",
    description: "Scalable, reliable cloud infrastructure tailored to enterprise workloads.",
    icon: Cloud,
    gradient: "from-sky-500/20 to-blue-500/20",
    services: [
      { title: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting", icon: Cloud, desc: "Enterprise-grade cloud hosting with 24/7 management and support." },
      { title: "Managed Private Cloud", href: "/solutions/managed-private-cloud", icon: Server, desc: "Dedicated private cloud environments built for security and compliance." },
      { title: "Managed Hybrid Cloud", href: "/solutions/managed-hybrid-cloud", icon: Database, desc: "Seamlessly bridge on-premises and cloud infrastructure." },
      { title: "Cloud Migration Services", href: "/solutions/cloud-migration", icon: RefreshCcw, desc: "Zero-downtime migration strategy and execution for any workload." },
    ],
  },
  {
    title: "Managed Data Protection",
    description: "Comprehensive data resilience and business continuity strategies.",
    icon: Shield,
    gradient: "from-blue-500/20 to-blue-500/20",
    services: [
      { title: "Backup as a Service", href: "/solutions/backup-as-a-service", icon: HardDrive, desc: "Automated, encrypted backups with rapid restore capabilities." },
      { title: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery", icon: RefreshCcw, desc: "Full disaster recovery with guaranteed RTOs and RPOs." },
      { title: "High Availability as a Service", href: "/solutions/high-availability", icon: Database, desc: "Real-time replication and automatic failover for critical systems." },
      { title: "Ransomware Recovery", href: "/solutions/ransomware-recovery", icon: ShieldAlert, desc: "Immutable backups and rapid recovery from ransomware attacks." },
    ],
  },
  {
    title: "Managed Security",
    description: "End-to-end cybersecurity for the modern enterprise threat landscape.",
    icon: Lock,
    gradient: "from-blue-500/20 to-sky-500/20",
    services: [
      { title: "IBM i Security", href: "/solutions/ibm-i-security", icon: ShieldCheck, desc: "Comprehensive security assessments and hardening for IBM i environments." },
      { title: "Protection Suite", href: "/solutions/protection-suite", icon: Shield, desc: "Multi-layered endpoint and network protection suite." },
      { title: "Security Monitoring", href: "/solutions/security-monitoring", icon: Radar, desc: "24/7 SOC monitoring with real-time threat intelligence." },
      { title: "Threat Detection & Response", href: "/solutions/threat-detection", icon: Crosshair, desc: "Advanced threat hunting and automated incident response." },
      { title: "Endpoint Security", href: "/solutions/endpoint-security", icon: Bug, desc: "Next-gen endpoint protection with AI-driven threat prevention." },
    ],
  },
  {
    title: "Managed Services",
    description: "Fully managed IT operations so you can focus on your business.",
    icon: Server,
    gradient: "from-sky-500/20 to-sky-500/20",
    services: [
      { title: "Managed Microsoft Services", href: "/solutions/managed-microsoft", icon: Monitor, desc: "Complete Microsoft 365 and Azure management and optimization." },
      { title: "Automation Suite", href: "/solutions/automation-suite", icon: Workflow, desc: "AI-powered patch management, vulnerability remediation, and security automation." },
      { title: "Systems Management", href: "/solutions/systems-management", icon: Settings, desc: "Proactive monitoring, patching, and performance management." },
      { title: "IBM Power VS", href: "/solutions/ibm-power-vs", icon: Cpu, desc: "IBM Power Virtual Server management in the cloud." },
    ],
  },
];

export default function SolutionsPage() {
  return (
    <main className="pt-28 lg:pt-36">
      {/* Hero */}
      <section className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-4">Our Solutions</p>
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Enterprise <span className="gradient-text">Technology Solutions</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">
              From cloud infrastructure to cybersecurity, we deliver end-to-end solutions engineered for reliability, performance, and scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Categories */}
      {categories.map((cat, catIdx) => (
        <section
          key={cat.title}
          className="section-padding relative overflow-hidden"
          style={catIdx % 2 === 1 ? { background: "linear-gradient(180deg, rgba(10,16,32,0.5), rgba(2,6,23,1))" } : undefined}
        >
          {catIdx % 2 === 1 && <div className="grid-pattern absolute inset-0 opacity-40" />}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/10 to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              {...(catIdx === 0
                ? { animate: { opacity: 1, y: 0 } }
                : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
              )}
              transition={{ duration: 0.6, delay: catIdx === 0 ? 0.3 : 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-sky-400`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl text-white">{cat.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{cat.description}</p>
              </div>
            </motion.div>

            <div className={`grid gap-6 sm:grid-cols-2 ${cat.services.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
              {cat.services.map((svc, i) => (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  {...(catIdx === 0
                    ? { animate: { opacity: 1, y: 0 } }
                    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                  )}
                  transition={{ duration: 0.4, delay: catIdx === 0 ? 0.4 + i * 0.08 : i * 0.08 }}
                >
                  <TiltCard className="h-full">
                    <Link href={svc.href} className="group block h-full">
                      <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${cat.gradient} text-sky-400 transition-all duration-300 group-hover:scale-110`}>
                          <svc.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">{svc.title}</h3>
                        <p className="flex-1 text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 transition-all group-hover:text-sky-300 group-hover:gap-2.5">
                          Learn more <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] ambient-orb ambient-orb-purple opacity-15" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Need a Custom <span className="gradient-text">Solution?</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              Our enterprise architects will design a tailored solution that fits your business requirements and budget.
            </p>
            <div className="mt-10">
              <Link href="/contact" className="btn-primary">
                <span>Contact Our Team</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
