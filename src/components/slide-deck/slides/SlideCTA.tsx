"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "motion/react";
import { FileText, Download, ArrowRight } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

export default function SlideCTA({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-14 py-10 text-center">
        <motion.div className="rounded-xl bg-white px-5 py-3 shadow-lg shadow-black/20 mb-8" {...fadeIn(active, 0.1, { scale: 0.85 })}>
          <img src="/images/logo/ice_updated.jpg" alt="International Computer Exchange" className="h-[60px] w-auto" />
        </motion.div>

        <div className="flex items-stretch gap-5">
          <motion.a href="https://icesales.com/access/carico-iaas-2026" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-sky-400/20 px-8 py-5 flex flex-col items-center gap-3 transition-all w-56" style={{ backgroundColor: "rgba(56, 189, 248, 0.08)" }} {...fadeIn(active, 0.25, { y: 15 })}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/20 group-hover:bg-sky-400/25 transition-colors"><FileText className="h-6 w-6 text-sky-400" /></div>
            <span className="text-white font-semibold text-sm">View Full Proposal</span>
            <span className="text-slate-500 text-[10px] leading-tight">Complete interactive proposal with all sections and details</span>
            <div className="flex items-center gap-1 text-sky-400 text-xs font-medium mt-auto"><span>Open</span><ArrowRight className="h-3 w-3" /></div>
          </motion.a>
          <motion.a href="https://icesales.com/access/carico-iaas-2026" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-emerald-400/20 px-8 py-5 flex flex-col items-center gap-3 transition-all w-56" style={{ backgroundColor: "rgba(52, 211, 153, 0.08)" }} {...fadeIn(active, 0.35, { y: 15 })}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 border border-emerald-400/20 group-hover:bg-emerald-400/25 transition-colors"><Download className="h-6 w-6 text-emerald-400" /></div>
            <span className="text-white font-semibold text-sm">Download PDF</span>
            <span className="text-slate-500 text-[10px] leading-tight">Full proposal document for review and approval signature</span>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-auto"><span>Download</span><Download className="h-3 w-3" /></div>
          </motion.a>
        </div>

        <motion.div className="mt-8 text-[10px] text-slate-500" {...fadeIn(active, 0.5)}>David Cran · dcran@icesales.com · 561-394-9189</motion.div>
      </div>
    </div>
  );
}
