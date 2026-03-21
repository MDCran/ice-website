"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { ArrowRight, ChevronRight, HelpCircle } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const PARTNER_LOGOS = Array.from({ length: 8 }, (_, i) => ({
  src: `/images/v3/b_${i + 1}.png`,
  alt: `Technology Partner ${i + 1}`,
}));

interface Partner {
  name: string;
  description: string;
  logoSrc?: string;
  specializations: string[];
  partnerSince?: string;
  fullWidth?: boolean;
}

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
    name: "Acronix",
    description:
      "Technology solutions and services provider specializing in enterprise infrastructure and support.",
    logoSrc: "/images/v3/b_7.png",
    specializations: ["Infrastructure", "Enterprise Support"],
    partnerSince: "2016",
  },
  {
    name: "Cybernetics",
    description:
      "Enterprise technology solutions and services. Infrastructure, security, and managed services for modern businesses.",
    logoSrc: "/images/v3/b_7.png",
    specializations: ["Tape Solutions", "Data Backup", "Archive Storage"],
    partnerSince: "2000",
    fullWidth: true,
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
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PartnersPage({ cmsData }: { cmsData?: Record<string, any> }) {
  const partners = (cmsData?.partners_grid?.partners ?? DEFAULT_PARTNERS).map((p: any) => ({
    name: p.name,
    description: p.description,
    logoSrc: p.logo_src ?? p.logoSrc,
    specializations: p.specializations ?? [],
    partnerSince: p.partner_since ?? p.partnerSince,
    fullWidth: p.full_width ?? p.fullWidth,
  }));

  const introRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const introInView = useInView(introRef, { once: true, margin: "-100px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-100px" });

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ================================================================= */}
      {/*  Page Hero                                                        */}
      {/* ================================================================= */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/videos/data_center.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 text-center px-6 pt-20 lg:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Technology <span className="gradient-text">Partners</span>
          </motion.h1>
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-sm text-slate-400"
          >
            <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <span className="text-sky-400">Partners</span>
          </motion.nav>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Intro Section                                                    */}
      {/* ================================================================= */}
      <section className="section-padding" ref={introRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={introInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-sky-500/10">
                <Image
                  src="/images/a6a39917-78d3-4c8b-a0f1-f967819a7b01.png"
                  alt="ICE Technology Partners"
                  width={640}
                  height={480}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-transparent to-blue-500/10" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={introInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" as const }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Technology Partners{" "}
                <span className="gradient-text">We Work With</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                ICE resells and integrates solutions from industry-leading
                technology partners. We work with trusted providers to deliver
                the best fit for your business needs—from cloud hosting and
                disaster recovery to hardware and managed services.
              </p>
              <div className="mt-8">
                <div className="gradient-line" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Partner Logos Marquee                                             */}
      {/* ================================================================= */}
      <section className="py-12 overflow-hidden border-y border-white/5">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />
          <div className="overflow-hidden">
            <div className="flex w-fit animate-marquee">
              {[0, 1].map((setIdx) =>
                PARTNER_LOGOS.map((logo, idx) => (
                  <div key={`${setIdx}-${idx}`} className="partner-logo-wrap flex-shrink-0 mx-8 flex items-center justify-center relative">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={160}
                      height={60}
                      className="h-12 w-auto object-contain opacity-50 hover:opacity-100 transition-all duration-300 partner-logo-marquee"
                      loading="lazy"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  Partner Cards Grid                                               */}
      {/* ================================================================= */}
      <section className="section-padding" ref={cardsRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our <span className="gradient-text">Partners</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We partner with industry leaders to deliver enterprise-grade
              solutions tailored to your business.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={cardsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {partners.map((partner: any, i: number) => (
              <motion.div
                key={partner.name}
                custom={i}
                variants={scaleIn}
                className={partner.fullWidth ? "md:col-span-2" : ""}
              >
                <div className="glass-card glint-card rounded-2xl p-8 group h-full transition-all duration-500 hover:border-sky-500/25">
                  <div className="flex items-start gap-5">
                    {/* Partner logo instead of icon */}
                    <div className="partner-card-icon flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] p-2 transition-all duration-300 group-hover:bg-white/[0.1] group-hover:border-sky-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                      {partner.logoSrc ? (
                        <Image
                          src={partner.logoSrc}
                          alt={partner.name}
                          width={80}
                          height={40}
                          className="w-full h-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 partner-card-logo"
                          loading="lazy"
                        />
                      ) : (
                        <HelpCircle className="h-7 w-7 text-slate-500 group-hover:text-sky-400 transition-colors duration-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{partner.name}</h3>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-sm">{partner.description}</p>

                      {/* Specializations */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {partner.specializations.map((spec: string) => (
                          <span
                            key={spec}
                            className="text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1 transition-colors duration-300 group-hover:text-slate-300 group-hover:border-sky-500/15 group-hover:bg-sky-500/5"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/*  IBM CTA Section                                                  */}
      {/* ================================================================= */}
      <section className="section-padding relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="glass-card glint-card rounded-2xl p-10 md:p-16 text-center"
          >
            <motion.div custom={0} variants={fadeUp}>
              <Image
                src="/images/ibm.svg"
                alt="IBM Business Partner"
                width={160}
                height={64}
                className="mx-auto mb-8 opacity-60"
              />
            </motion.div>
            <motion.h2 custom={1} variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Proud <span className="gradient-text">IBM Business Partner</span> Since 1990
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
              Leverage our deep IBM expertise and partner ecosystem to modernize
              your infrastructure and accelerate your digital transformation.
            </motion.p>
            <motion.div custom={3} variants={fadeUp}>
              <Link href="/contact" className="btn-primary glint-btn">
                <span className="flex items-center gap-2">
                  Get In Touch
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
