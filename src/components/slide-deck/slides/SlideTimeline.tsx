"use client";

import { motion } from "motion/react";
import { FileText, Server, Database, ShieldCheck, Zap } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const PHASES = [
  { icon: FileText, phase: "Project Kickoff", desc: "Architecture validation, infrastructure review, and migration planning", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", accent: "bg-sky-400" },
  { icon: Server, phase: "Infrastructure Provisioning", desc: "Deploy IBM Power10 production & disaster recovery systems", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", accent: "bg-violet-400" },
  { icon: Database, phase: "Data Migration", desc: "Initial system restore, SAN replication setup, and environment validation", color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20", accent: "bg-teal-400" },
  { icon: ShieldCheck, phase: "Testing & Validation", desc: "Application validation, DR readiness testing, and performance verification", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", accent: "bg-emerald-400" },
  { icon: Zap, phase: "Production Cutover", desc: "Final migration, go-live activation, and post-migration monitoring", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", accent: "bg-amber-400" },
];

export default function SlideTimeline({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 left-1/4 w-56 h-56 rounded-full bg-violet-500/5 blur-[90px]" />
      <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-emerald-500/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="mb-5" {...fadeIn(active, 0.05, { y: -10 })}>
          <h2 className="text-2xl font-bold text-white">Migration Timeline</h2>
          <p className="text-slate-500 text-xs mt-1">Structured approach to minimize disruption — recommended start within 30–45 days</p>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center gap-1">
          {PHASES.map(({ icon: Icon, phase, desc, color, bg, border, accent }, i) => (
            <motion.div key={i} className="flex items-stretch gap-4" {...fadeIn(active, 0.1 + i * 0.1, { x: -20 })}>
              <div className="flex flex-col items-center w-10 shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} border ${border}`}><Icon className={`h-4 w-4 ${color}`} /></div>
                {i < PHASES.length - 1 && <div className="flex-1 w-px bg-gradient-to-b from-white/15 to-white/5 my-1" />}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2 mb-0.5"><span className={`text-[10px] font-mono ${color} opacity-70`}>Phase {i + 1}</span><div className={`h-px flex-1 ${accent} opacity-10`} /></div>
                <span className="text-white font-semibold text-[14px] block">{phase}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">{desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-5 py-2.5 flex items-center gap-3" {...fadeIn(active, 0.65, { y: 10 })}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-300 text-xs"><strong className="text-amber-400">Action recommended:</strong> IBM maintenance expires July 2026 — initiate planning now for controlled transition.</span>
        </motion.div>
      </div>
    </div>
  );
}
