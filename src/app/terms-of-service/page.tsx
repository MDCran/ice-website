"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Download } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing, browsing, or using the International Computer Exchange, Inc. ("ICE," "we," "us," or "our") website located at icesales.com (the "Site"), you acknowledge that you have read, understood, and agree to be bound by these Website Terms and Conditions ("Terms"). If you do not agree to these Terms, you should not use or access the Site.

We reserve the right to change, modify, or update these Terms at any time without prior notice. Your continued use of the Site following the posting of any changes constitutes your acceptance of such changes. We encourage you to review these Terms periodically.`,
  },
  {
    id: "use-of-site",
    title: "2. Use of the Site",
    content: `You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:

\u2022 Use the Site in any way that violates any applicable federal, state, local, or international law or regulation.
\u2022 Use the Site to transmit or procure the sending of any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.
\u2022 Impersonate or attempt to impersonate ICE, an ICE employee, another user, or any other person or entity.
\u2022 Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site, or which, as determined by us, may harm ICE or users of the Site.
\u2022 Use any robot, spider, or other automatic device, process, or means to access the Site for any purpose, including monitoring or copying any of the material on the Site.
\u2022 Introduce any viruses, Trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.`,
  },
  {
    id: "intellectual-property",
    title: "3. Intellectual Property",
    content: `The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, audio, and the design, selection, and arrangement thereof) are owned by ICE, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.

These Terms permit you to use the Site for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material on our Site without the prior written consent of ICE.`,
  },
  {
    id: "disclaimer-of-warranties",
    title: "4. Disclaimer of Warranties",
    content: `THE SITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER ICE NOR ANY PERSON ASSOCIATED WITH ICE MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SITE.

WITHOUT LIMITING THE FOREGOING, NEITHER ICE NOR ANYONE ASSOCIATED WITH ICE REPRESENTS OR WARRANTS THAT THE SITE, ITS CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SITE WILL BE ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT THE SITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT THE SITE OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SITE WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.

ICE HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.`,
  },
  {
    id: "limitation-of-liability",
    title: "5. Limitation of Liability",
    content: `IN NO EVENT WILL ICE, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SITE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE SITE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.`,
  },
  {
    id: "third-party-links",
    title: "6. Links to Third-Party Sites",
    content: `The Site may contain links to other websites and resources provided by third parties. These links are provided for your convenience only. We have no control over the contents of those sites or resources, and accept no responsibility for them or for any loss or damage that may arise from your use of them.

If you decide to access any of the third-party websites linked to the Site, you do so entirely at your own risk and subject to the terms and conditions of use for such websites.`,
  },
  {
    id: "changes-to-terms",
    title: "7. Changes to Terms",
    content: `We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the Site thereafter.

Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.`,
  },
  {
    id: "contact",
    title: "8. Contact",
    content: `If you have any questions about these Terms of Service, please contact us:

International Computer Exchange, Inc.

Email: sales@icesales.com
Phone: 561-394-9188`,
  },
];

export default function TermsOfServicePage() {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <main className="min-h-screen terms-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" poster="/images/hero-poster.webp">
          <source src="/videos/hero.mp4" type="video/mp4" />
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
            <span className="text-sky-400">Terms of Service</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold"
          >
            <span className="gradient-text">Terms of Service</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[220px_1fr] gap-10">
            {/* Sticky Table of Contents (desktop) */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block print:hidden"
            >
              <div className="sticky top-28">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400 mb-4">On This Page</p>
                <nav className="space-y-1.5">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block text-xs transition-all duration-200 py-1 border-l-2 pl-3 ${
                        activeId === section.id
                          ? "text-sky-400 border-sky-400 font-semibold"
                          : "text-slate-400 border-white/[0.06] hover:text-sky-400 hover:border-sky-400/40"
                      }`}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-8 md:p-12 print:!bg-white print:!border-none print:!shadow-none print:!backdrop-filter-none"
            >
              {/* Header */}
              <div className="mb-10 border-b border-white/10 pb-8 print:border-gray-200">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 print:!text-black">
                  Website Terms and Conditions
                </h2>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1 text-xs text-sky-400 font-semibold print:!text-blue-600 print:!border-blue-200 print:!bg-blue-50">
                  Last Updated: March 2026
                </div>
                <p className="text-slate-400 mt-4 leading-relaxed print:!text-gray-600">
                  Please read these terms and conditions carefully before using the
                  International Computer Exchange, Inc. website.
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-10">
                {sections.map((section, i) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                  >
                    <h3 className="text-lg font-semibold text-sky-400 mb-4 print:!text-blue-700">{section.title}</h3>
                    <div className="text-sm text-slate-300 leading-[1.8] whitespace-pre-line print:!text-gray-800">
                      {section.content}
                    </div>
                    {i < sections.length - 1 && (
                      <div className="mt-8 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-transparent print:!bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>

              {/* Download as PDF */}
              <div className="mt-12 pt-8 border-t border-white/10 flex justify-center print:hidden">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.print()}
                  className="btn-outline cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download as PDF
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
