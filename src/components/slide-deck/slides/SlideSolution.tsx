"use client";

import { motion } from "motion/react";
import { Cloud, CheckCircle, Shield, RefreshCw, Database, Monitor, Server, Cpu } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const FEATURES = [
  { icon: Cpu, label: "IBM Power10 enterprise platform" },
  { icon: Shield, label: "Full disaster recovery with SAN replication" },
  { icon: Server, label: "Geographically separate data centers" },
  { icon: RefreshCw, label: "Hardware lifecycle management included" },
];

const SERVICES = [
  { icon: Monitor, label: "24/7 Monitoring", desc: "Infrastructure & IBM i platform" },
  { icon: Database, label: "Managed Backups", desc: "VTL-based backup services" },
  { icon: Shield, label: "DR Readiness", desc: "Annual testing & validation" },
  { icon: RefreshCw, label: "Lifecycle Mgmt", desc: "PTF, firmware & OS updates" },
];

export default function SlideSolution({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="flex items-center gap-3 mb-6" {...fadeIn(active, 0.05, { x: -20 })}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/20"><Cloud className="h-5 w-5 text-sky-400" /></div>
          <div><h2 className="text-2xl font-bold text-white">Proposed Solution</h2><p className="text-slate-500 text-xs">Fully managed IBM i hosting with enterprise disaster recovery</p></div>
        </motion.div>

        <div className="flex gap-6 flex-1">
          <div className="flex-1 flex flex-col">
            <motion.h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-4" {...fadeIn(active, 0.1)}>Platform Features</motion.h3>
            <div className="flex flex-col gap-3 flex-1 justify-center">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3" {...fadeIn(active, 0.15 + i * 0.08, { x: -20 })}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 border border-sky-400/10"><Icon className="h-4 w-4 text-sky-400" /></div>
                  <span className="text-slate-200 text-sm font-medium">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <motion.h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4" {...fadeIn(active, 0.15)}>ICE Managed Services</motion.h3>
            <div className="grid grid-cols-2 gap-3 flex-1 content-center">
              {SERVICES.map(({ icon: Icon, label, desc }, i) => (
                <motion.div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col items-center text-center gap-2" {...fadeIn(active, 0.2 + i * 0.08, { scale: 0.9 })}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 border border-emerald-400/10"><Icon className="h-4 w-4 text-emerald-400" /></div>
                  <span className="text-white text-xs font-semibold">{label}</span>
                  <span className="text-slate-500 text-[10px] leading-tight">{desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div className="mt-4 rounded-lg border border-sky-400/15 bg-sky-400/[0.04] px-5 py-2.5 flex items-center gap-3" {...fadeIn(active, 0.6, { y: 10 })}>
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 text-xs">Replaces on-premises hardware with a scalable, predictable managed platform</span>
        </motion.div>
      </div>
    </div>
  );
}
