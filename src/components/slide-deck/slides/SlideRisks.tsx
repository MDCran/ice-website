"use client";

import { motion } from "motion/react";
import { AlertTriangle, Clock, MapPin, DollarSign, HardDrive } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const RISKS = [
  { icon: Clock, title: "End of Service", desc: "IBM Power9 reached end of standard service lifecycle — Jan 31, 2026", color: "text-red-400", bg: "bg-red-400/10" },
  { icon: HardDrive, title: "Tape-Based DR", desc: "Disaster recovery relies on manual tape restoration — slow & untested", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: MapPin, title: "Same Metro DR", desc: "Production & DR both in Ft. Lauderdale metro — regional risk", color: "text-orange-400", bg: "bg-orange-400/10" },
  { icon: DollarSign, title: "Capital Exposure", desc: "$120K–$200K hardware replacement pending for production & DR", color: "text-red-400", bg: "bg-red-400/10" },
  { icon: AlertTriangle, title: "Maintenance Expiry", desc: "IBM hardware & software maintenance expires July 15, 2026", color: "text-amber-400", bg: "bg-amber-400/10" },
];

export default function SlideRisks({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-500/6 blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-red-500/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full px-10 py-8">
        <motion.div className="flex items-center gap-3 mb-4" {...fadeIn(active, 0.05, { x: -20 })}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/20"><AlertTriangle className="h-4 w-4 text-amber-400" /></div>
          <div><h2 className="text-[22px] font-bold text-white leading-tight">Current Environment Risks</h2><p className="text-slate-500 text-[10px]">Critical infrastructure challenges requiring immediate attention</p></div>
        </motion.div>

        <div className="flex-1 flex flex-col gap-2 justify-center">
          {RISKS.map((risk, i) => {
            const Icon = risk.icon;
            return (
              <motion.div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5" {...fadeIn(active, 0.12 + i * 0.07, { x: -25 })}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${risk.bg} border border-white/[0.06]`}><Icon className={`h-3.5 w-3.5 ${risk.color}`} /></div>
                <div className="flex-1 min-w-0"><span className={`text-[10px] font-bold uppercase tracking-wider ${risk.color}`}>{risk.title}</span><p className="text-slate-300 text-[12px] leading-snug">{risk.desc}</p></div>
              </motion.div>
            );
          })}
        </div>

        <motion.div className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-4 py-2 flex items-center justify-between" {...fadeIn(active, 0.55, { y: 10 })}>
          <span className="text-slate-300 text-[11px]">Current infrastructure spend</span>
          <span className="text-amber-400 font-bold text-sm font-mono">~$4,100/mo</span>
          <span className="text-slate-500 text-[9px]">(infrastructure only — excludes IT labor & overhead)</span>
        </motion.div>
      </div>
    </div>
  );
}
