"use client";

import { motion } from "motion/react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { fadeIn, growTo } from "../slideAnimations";

interface SlideProps { active?: boolean }

export default function SlideCost({ active = false }: SlideProps) {
  const maxVal = 7700;
  const barMax = 200;
  const currentH = Math.round((4100 / maxVal) * barMax);
  const proposedH = Math.round((7700 / maxVal) * barMax);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-10 left-20 w-56 h-56 rounded-full bg-amber-500/5 blur-[90px]" />
      <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-sky-500/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="mb-4" {...fadeIn(active, 0.05, { y: -10 })}>
          <h2 className="text-2xl font-bold text-white">Cost Comparison</h2>
          <p className="text-slate-500 text-xs mt-1">Monthly infrastructure investment analysis</p>
        </motion.div>

        <div className="flex-1 flex items-stretch gap-6">
          <div className="flex-1 flex items-end justify-center gap-16 pb-2">
            {/* Current bar */}
            <motion.div className="flex flex-col items-center" style={{ width: 160 }} {...fadeIn(active, 0.15, { y: 20 })}>
              <span className="text-xl font-bold text-white mb-1 font-mono">$4,100+<span className="text-slate-500">*</span></span>
              <span className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">per month</span>
              <motion.div className="w-24 rounded-t-lg relative overflow-hidden" {...growTo(active, 0.3, "height", currentH)}>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600 to-amber-400 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
              </motion.div>
              <div className="w-24 h-[2px] bg-amber-400/40" />
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-amber-400 block">Current</span>
                <span className="text-[10px] text-slate-500 block mt-1 leading-tight">Infrastructure only</span>
                <span className="text-[10px] text-slate-600 block leading-tight">Excludes IT labor & overhead *</span>
              </div>
            </motion.div>

            {/* Proposed bar */}
            <motion.div className="flex flex-col items-center" style={{ width: 160 }} {...fadeIn(active, 0.25, { y: 20 })}>
              <span className="text-xl font-bold text-white mb-1 font-mono">$7,700</span>
              <span className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">per month</span>
              <motion.div className="w-24 rounded-t-lg relative overflow-hidden" {...growTo(active, 0.4, "height", proposedH)}>
                <div className="absolute inset-0 bg-gradient-to-t from-sky-600 to-emerald-400 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
              </motion.div>
              <div className="w-24 h-[2px] bg-sky-400/40" />
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-sky-400 block">Proposed</span>
                <span className="text-[10px] text-slate-500 block mt-1 leading-tight">All-inclusive platform</span>
                <span className="text-[10px] text-slate-600 block leading-tight">Hosting + DR + managed services</span>
              </div>
            </motion.div>
          </div>

          <div className="w-[240px] flex flex-col gap-3 justify-center">
            <motion.div className="rounded-xl border border-red-400/15 bg-red-400/[0.04] p-3.5" {...fadeIn(active, 0.5, { x: 20 })}>
              <div className="flex items-center gap-2 mb-1.5"><AlertTriangle className="h-3.5 w-3.5 text-red-400" /><span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Current Hidden Cost</span></div>
              <span className="text-lg font-bold text-white font-mono block">$120K – $200K</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Pending hardware replacement not included in $4,100/mo *</span>
            </motion.div>
            <motion.div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3.5" {...fadeIn(active, 0.6, { x: 20 })}>
              <div className="flex items-center gap-2 mb-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Proposed Includes</span></div>
              <ul className="text-[10px] text-slate-300 space-y-1">
                {["Production hosting", "SAN-replicated DR", "Managed backup (VTL)", "24/7 monitoring & ops", "Zero capex — ever"].map((t) => (
                  <li key={t} className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-400/60 mt-1 shrink-0" />{t}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
