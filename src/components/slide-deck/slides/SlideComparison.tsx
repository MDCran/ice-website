"use client";

import { motion } from "motion/react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const ROWS = [
  { category: "Infrastructure", current: "On-premises IBM Power9 (EOS)", proposed: "Hosted IBM Power10 platform" },
  { category: "Disaster Recovery", current: "Tape-based / cold standby", proposed: "SAN replication + standby Power10" },
  { category: "DR Location", current: "Same metro (Ft. Lauderdale)", proposed: "Geographically separate DCs" },
  { category: "Operations", current: "Customer managed", proposed: "Fully managed by ICE" },
  { category: "Hardware Lifecycle", current: "Customer responsibility", proposed: "Included — ICE managed" },
  { category: "Capital Investment", current: "$120K–$200K refresh pending", proposed: "Zero capex required" },
  { category: "Cost Model", current: "Capex + unpredictable costs", proposed: "Fixed monthly opex" },
];

export default function SlideComparison({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sky-500/5 blur-[90px]" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-emerald-500/5 blur-[70px]" />

      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="mb-5" {...fadeIn(active, 0.05, { y: -10 })}>
          <h2 className="text-2xl font-bold text-white">Current vs Proposed</h2>
          <p className="text-slate-500 text-xs mt-1">Strategic infrastructure comparison</p>
        </motion.div>

        <div className="flex-1 flex flex-col rounded-xl border border-white/[0.08] overflow-hidden">
          <motion.div className="grid grid-cols-[1.1fr_1.2fr_1.2fr] border-b border-white/10 bg-white/[0.03]" {...fadeIn(active, 0.1)}>
            <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</div>
            <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400/60" />Current Environment</div>
            <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400/60" />Proposed Platform</div>
          </motion.div>
          <div className="flex-1 flex flex-col">
            {ROWS.map((r, i) => (
              <motion.div key={i} className={`grid grid-cols-[1.1fr_1.2fr_1.2fr] flex-1 ${i % 2 === 1 ? "bg-white/[0.015]" : ""} ${i < ROWS.length - 1 ? "border-b border-white/[0.04]" : ""}`} {...fadeIn(active, 0.15 + i * 0.06, { x: -15 })}>
                <div className="px-4 flex items-center text-white text-[12px] font-medium">{r.category}</div>
                <div className="px-4 flex items-center text-slate-400 text-[12px]">{r.current}</div>
                <div className="px-4 flex items-center text-emerald-400/90 text-[12px]">{r.proposed}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
