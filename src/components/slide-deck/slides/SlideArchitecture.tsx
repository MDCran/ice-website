"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { fadeIn } from "../slideAnimations";

interface SlideProps { active?: boolean }

const CAPABILITIES = [
  "IBM Power10 Infrastructure",
  "IBM i Hosting Environment",
  "Standby DR System (Production-Equivalent)",
  "SAN-Level Replication Between Sites",
  "Managed Backup (VTL)",
  "Enterprise Data Center Infrastructure",
  "24/7 Monitoring & Managed Services",
  "Infrastructure Lifecycle Management",
];

export default function SlideArchitecture({ active = false }: SlideProps) {
  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 flex flex-col h-full px-12 py-9">
        <motion.div className="mb-5" {...fadeIn(active, 0.05, { y: -10 })}>
          <h2 className="text-2xl font-bold text-white">Platform Architecture</h2>
          <p className="text-slate-500 text-xs mt-1">Production hosting, SAN replication, and standby disaster recovery</p>
        </motion.div>

        <div className="flex-1 flex gap-6 items-center">
          <motion.div className="flex-1 flex items-center justify-center" {...fadeIn(active, 0.15, { scale: 0.95 })}>
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 max-h-[340px]">
              <img src="/images/carico-graphic-1.png" alt="ICE IBM i Cloud Platform Architecture" className="w-auto h-full max-h-[340px] object-contain" />
            </div>
          </motion.div>

          <div className="w-[300px] flex flex-col gap-2 justify-center">
            <motion.h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-2" {...fadeIn(active, 0.2)}>Platform Capabilities</motion.h3>
            {CAPABILITIES.map((cap, i) => (
              <motion.div key={i} className="flex items-center gap-2.5 text-[12px]" {...fadeIn(active, 0.25 + i * 0.06, { x: 15 })}>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{cap}</span>
              </motion.div>
            ))}
            <motion.div className="mt-3 pt-3 border-t border-white/10" {...fadeIn(active, 0.7, { y: 8 })}>
              <span className="text-sky-400 font-mono text-lg font-bold">$7,700/month</span>
              <p className="text-slate-500 text-[10px] mt-0.5">Fully integrated platform investment</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
