"use client";

import { motion } from "motion/react";
import { DollarSign, CheckCircle, ArrowRight } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

export default function SlideInvestment({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 right-1/4 w-56 h-56 rounded-full bg-sky-500/6 blur-[90px]" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-emerald-500/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="flex items-center gap-3 mb-5" {...fadeIn(active, 0.05, { x: -20 })}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/20"><DollarSign className="h-5 w-5 text-sky-400" /></div>
          <div><h2 className="text-2xl font-bold text-white">Platform Investment Summary</h2><p className="text-slate-500 text-xs">Fully managed IBM i hosting, DR, backup, and operational support</p></div>
        </motion.div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          <motion.div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3.5 flex items-center justify-between" {...fadeIn(active, 0.1, { y: 12 })}>
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Estimated Infrastructure Cost</span><p className="text-slate-400 text-[10px] mt-0.5">Hardware maintenance + Flexential colocation</p></div>
            <span className="text-white font-mono text-lg font-bold">~$4,100/mo <span className="text-slate-500">*</span></span>
          </motion.div>
          <motion.div className="flex justify-center" {...fadeIn(active, 0.25, { scale: 0.5 })}><ArrowRight className="h-4 w-4 text-sky-400/40 rotate-90" /></motion.div>
          <motion.div className="rounded-xl border border-sky-400/20 bg-sky-400/[0.04] px-6 py-4 flex items-center justify-between" {...fadeIn(active, 0.3, { y: 12 })}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Proposed Monthly Recurring Service (MRS)</span>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                {["Production hosting", "SAN-replicated DR", "Managed backup (VTL)", "24/7 monitoring & ops", "Lifecycle management"].map((item) => (
                  <span key={item} className="flex items-center gap-1 text-[10px] text-slate-400"><CheckCircle className="h-2.5 w-2.5 text-emerald-400" />{item}</span>
                ))}
              </div>
            </div>
            <span className="text-sky-400 font-mono text-2xl font-bold shrink-0 ml-4">$7,700/mo</span>
          </motion.div>
          <motion.div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3.5 flex items-center justify-between" {...fadeIn(active, 0.45, { y: 12 })}>
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Non-Recurring Services (NRS)</span><p className="text-slate-400 text-[10px] mt-0.5">One-time provisioning, configuration, and migration</p></div>
            <span className="text-white font-mono text-lg font-bold">$5,000 – $10,000</span>
          </motion.div>
          <motion.div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mt-1" {...fadeIn(active, 0.55, { y: 12 })}>
            <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
              <div className="px-4 py-3 text-center"><span className="text-[10px] text-slate-500 block uppercase tracking-wider">Service Term</span><span className="text-white font-bold text-sm mt-0.5 block">36 Months</span></div>
              <div className="px-4 py-3 text-center"><span className="text-[10px] text-slate-500 block uppercase tracking-wider">MRS Billing</span><span className="text-white font-bold text-sm mt-0.5 block">Monthly / Quarterly</span></div>
              <div className="px-4 py-3 text-center"><span className="text-[10px] text-slate-500 block uppercase tracking-wider">NRS Billing</span><span className="text-white font-bold text-sm mt-0.5 block">One-Time</span></div>
            </div>
          </motion.div>
        </div>

        <motion.p className="text-[8px] text-slate-600 mt-2" {...fadeIn(active, 0.65)}>* Infrastructure costs only — excludes IT labor & overhead. Pricing valid for 60 days from date of issue.</motion.p>
      </div>
    </div>
  );
}
