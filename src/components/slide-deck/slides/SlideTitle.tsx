"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "motion/react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

export default function SlideTitle({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 flex flex-col h-full px-14 py-10">
        <motion.div className="flex items-center justify-start" {...fadeIn(active, 0.1, { scale: 0.9 })}>
          <div className="rounded-xl bg-white px-4 py-3 shadow-lg shadow-black/20">
            <img src="/images/logo/ice_updated.jpg" alt="International Computer Exchange" className="h-[60px] w-auto" />
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-2">
          <motion.p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400 mb-4" {...fadeIn(active, 0.2, { y: -10 })}>
            Infrastructure Modernization Proposal
          </motion.p>
          <motion.h1 className="text-[44px] font-bold leading-[1.1] mb-5" {...fadeIn(active, 0.35, { y: 15 })}>
            <span className="text-white">Enterprise IBM i Hosting</span><br />
            <span className="gradient-text">and Disaster Recovery Platform</span>
          </motion.h1>
          <motion.div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent mb-5" {...fadeIn(active, 0.5, { scale: 0 })} />
          <motion.div className="flex items-center gap-8 text-sm" {...fadeIn(active, 0.6, { y: 10 })}>
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Prepared For</span>
              <span className="text-white font-semibold">Carico International Inc.</span>
              <span className="text-slate-400 text-xs block">Jason Vickery</span>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Prepared By</span>
              <span className="text-white font-semibold">International Computer Exchange</span>
              <span className="text-slate-400 text-xs block">David Cran · dcran@icesales.com · 561-394-9189</span>
            </div>
          </motion.div>
        </div>

        <motion.div className="flex items-center justify-between text-[10px] text-slate-500" {...fadeIn(active, 0.7)}>
          <span>Confidential</span>
          <span>March 17, 2026</span>
        </motion.div>
      </div>
    </div>
  );
}
