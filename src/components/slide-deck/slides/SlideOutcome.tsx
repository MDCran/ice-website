"use client";

import { motion } from "motion/react";
import { Zap, Server, ShieldCheck, Users, Layers, TrendingUp, Building2 } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const OUTCOMES = [
  { icon: Server, label: "Eliminates Hardware Replacement", desc: "No future Power hardware purchases or lifecycle management", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/10" },
  { icon: ShieldCheck, label: "Enterprise Disaster Recovery", desc: "SAN replication to geographically separate data centers", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/10" },
  { icon: Users, label: "Reduces IT Workload", desc: "ICE specialists handle infrastructure, monitoring, and maintenance", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/10" },
  { icon: Layers, label: "Predictable Costs", desc: "Fixed monthly opex replaces unpredictable capex & maintenance", color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/10" },
  { icon: Building2, label: "SOC-Aligned Facilities", desc: "Enterprise data centers with redundant power, cooling, and network", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/10" },
  { icon: TrendingUp, label: "Scalable Platform", desc: "Capacity can expand as business requirements evolve", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/10" },
];

export default function SlideOutcome({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="flex items-center gap-3 mb-6" {...fadeIn(active, 0.05, { x: -20 })}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/20"><Zap className="h-5 w-5 text-sky-400" /></div>
          <div><h2 className="text-2xl font-bold text-white">Business Outcomes</h2><p className="text-slate-500 text-xs">Key benefits of transitioning to the ICE hosted platform</p></div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 flex-1 content-center">
          {OUTCOMES.map(({ icon: Icon, label, desc, color, bg, border }, i) => (
            <motion.div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-2.5" {...fadeIn(active, 0.1 + i * 0.07, { scale: 0.92, y: 10 })}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} border ${border}`}><Icon className={`h-4 w-4 ${color}`} /></div>
              <div><span className="text-white font-semibold text-[13px] block">{label}</span><span className="text-slate-500 text-[10px] leading-snug block mt-0.5">{desc}</span></div>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-4 rounded-lg border border-sky-400/15 bg-sky-400/[0.04] px-5 py-3 text-center" {...fadeIn(active, 0.6, { y: 10 })}>
          <p className="text-slate-300 text-xs leading-relaxed">A fully managed, resilient IBM i platform — without the burden of maintaining on-premise infrastructure.</p>
        </motion.div>
      </div>
    </div>
  );
}
