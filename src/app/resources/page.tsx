"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Eye,
  FileText,
  BookOpen,
  GraduationCap,
  Code,
  Search,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

interface Resource {
  id: string;
  title: string;
  description: string;
  year: number;
  category: "white-papers" | "case-studies" | "architecture-guides" | "technical-docs";
  coverImage?: string;
  pdfUrl?: string;
  comingSoon?: boolean;
}

const resources: Resource[] = [
  {
    id: "data-centers",
    title: "High-Security Data Centers",
    description: "Comprehensive overview of ICE's SOC 1 SSAE 18 Type II certified data center facilities, redundancy systems, and security protocols.",
    year: 2025,
    category: "white-papers",
    coverImage: "/resources/covers/data_centers.png",
    pdfUrl: "/resources/ICE_High-Security_Data_Centers.pdf",
  },
  {
    id: "hybrid-cloud-arch",
    title: "Enterprise Hybrid Cloud Architecture",
    description: "Best practices for designing hybrid cloud infrastructure that bridges on-premises IBM Power systems with public cloud services.",
    year: 2026,
    category: "white-papers",
    comingSoon: true,
  },
  {
    id: "cloud-migration-case",
    title: "Cloud Migration Best Practices",
    description: "Real-world case study documenting a seamless migration of legacy AS/400 workloads to ICE's managed cloud hosting environment.",
    year: 2026,
    category: "case-studies",
    comingSoon: true,
  },
  {
    id: "dr-planning-case",
    title: "Disaster Recovery Success Story",
    description: "How a financial services firm achieved sub-15-minute RTO with ICE's managed disaster recovery as a service.",
    year: 2026,
    category: "case-studies",
    comingSoon: true,
  },
  {
    id: "ha-case-study",
    title: "Zero-Downtime Operations",
    description: "Case study on implementing high availability as a service for a manufacturing company running mission-critical IBM i workloads.",
    year: 2026,
    category: "case-studies",
    comingSoon: true,
  },
  {
    id: "ibm-i-security-guide",
    title: "IBM i Security Hardening Guide",
    description: "Step-by-step technical documentation for hardening IBM i environments, including exit point monitoring, user profile management, and compliance.",
    year: 2026,
    category: "technical-docs",
    comingSoon: true,
  },
  {
    id: "ransomware-playbook",
    title: "Ransomware Recovery Playbook",
    description: "Technical playbook for enterprise ransomware recovery using immutable backups, air-gapped storage, and rapid restoration procedures.",
    year: 2026,
    category: "technical-docs",
    comingSoon: true,
  },
  {
    id: "endpoint-security-doc",
    title: "Endpoint Security Best Practices",
    description: "Technical documentation covering zero-trust endpoint security, EDR deployment, and automated threat response workflows.",
    year: 2026,
    category: "technical-docs",
    comingSoon: true,
  },
  {
    id: "dr-planning-template",
    title: "Disaster Recovery Planning Template",
    description: "Architecture guide and planning template for enterprise disaster recovery, including RTO/RPO analysis, failover procedures, and testing schedules.",
    year: 2026,
    category: "architecture-guides",
    comingSoon: true,
  },
  {
    id: "hybrid-cloud-reference",
    title: "Hybrid Cloud Reference Architecture",
    description: "Reference architecture for integrating IBM Power VS, private cloud, and public cloud services into a unified hybrid infrastructure.",
    year: 2026,
    category: "architecture-guides",
    comingSoon: true,
  },
  {
    id: "managed-services-arch",
    title: "Managed Services Framework",
    description: "Architecture guide for ICE's managed services delivery model, covering monitoring, automation, patching, and incident response workflows.",
    year: 2026,
    category: "architecture-guides",
    comingSoon: true,
  },
];

const CATEGORIES = [
  { id: "all" as const, label: "All Resources", icon: BookOpen },
  { id: "white-papers" as const, label: "White Papers", icon: FileText },
  { id: "case-studies" as const, label: "Case Studies", icon: GraduationCap },
  { id: "architecture-guides" as const, label: "Architecture Guides", icon: Code },
  { id: "technical-docs" as const, label: "Technical Docs", icon: Code },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesCategory = activeCategory === "all" || r.category === activeCategory;
      const matchesSearch = !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" poster="/images/hero-poster.webp">
          <source src="/videos/data_center.mp4" type="video/mp4" />
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
            <span className="text-sky-400">Resources</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold"
          >
            <span className="gradient-text">Resources</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Featured Resource ─────────────────────────────────────────────── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400 mb-3">Featured</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Latest Publication</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/resources/data-centers"
              className="glass-card glint-card rounded-2xl overflow-hidden block group"
            >
              <div className="grid md:grid-cols-[300px_1fr] gap-0">
                <div className="relative aspect-[3/4] md:aspect-auto bg-[#0a1020]/50 overflow-hidden">
                  <Image
                    src="/resources/covers/data_centers.png"
                    alt="High-Security Data Centers"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#020617]/40" />
                  <div className="absolute top-4 right-4 bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-xs font-semibold text-sky-400">
                    2025
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">White Paper</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                    High-Security Data Centers
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Comprehensive overview of ICE&apos;s SOC 1 SSAE 18 Type II certified data center facilities,
                    redundancy systems, security protocols, and infrastructure capabilities.
                  </p>
                  <div>
                    <span className="btn-primary glint-btn inline-flex">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Read Now
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Resources Library ─────────────────────────────────────────────── */}
      <section className="section-padding grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Resource <span className="gradient-text">Library</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Browse our collection of white papers, case studies, architecture guides, and technical documentation.
            </p>
          </motion.div>

          {/* Search + Category Tabs */}
          <div className="mb-10 space-y-6">
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-sky-500/15 border border-sky-500/30 text-sky-400"
                      : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                {resource.comingSoon ? (
                  <div className="glass-card glint-card rounded-2xl overflow-hidden h-full">
                    <div className="relative aspect-[4/3] bg-[#0a1020]/50 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center mesh-gradient">
                        <FileText className="h-16 w-16 text-sky-400/20" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className="bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-sky-400">
                          {resource.year}
                        </span>
                        <span className="bg-[#020617]/80 backdrop-blur-md border border-amber-500/20 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Coming Soon
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-3.5 w-3.5 text-sky-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {resource.category.replace(/-/g, " ")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{resource.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{resource.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        Available Soon
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/resources/${resource.id}`}
                    className="glass-card glint-card rounded-2xl overflow-hidden group block h-full"
                  >
                    <div className="relative aspect-[4/3] bg-[#0a1020]/50 overflow-hidden">
                      {resource.coverImage ? (
                        <Image
                          src={resource.coverImage}
                          alt={resource.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center mesh-gradient">
                          <FileText className="h-16 w-16 text-sky-400/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-sky-400">
                          {resource.year}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-3.5 w-3.5 text-sky-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {resource.category.replace(/-/g, " ")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">{resource.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{resource.description}</p>
                      <span className="btn-primary w-full justify-center text-sm py-2.5 inline-flex">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </span>
                      </span>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
