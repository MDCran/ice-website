"use client";

import { motion } from "motion/react";

const bars = [
  { height: 60, delay: 0, color: "#049bfb" },
  { height: 85, delay: 0.1, color: "#0474bc" },
  { height: 45, delay: 0.2, color: "#8b5cf6" },
  { height: 70, delay: 0.3, color: "#049bfb" },
  { height: 95, delay: 0.4, color: "#0474bc" },
  { height: 55, delay: 0.5, color: "#8b5cf6" },
];

export default function ManagedServicesHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <div className="glass-card-static rounded-2xl p-6 w-full h-full border border-sky-500/10">
        {/* Dashboard header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/40" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Dashboard</span>
        </div>

        {/* Mini metrics row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Services", value: "24" },
            { label: "Active", value: "24" },
            { label: "Health", value: "100%" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-2 py-1.5 text-center">
              <p className="text-[8px] text-slate-500 uppercase">{m.label}</p>
              <p className="text-xs font-bold text-white font-mono">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="flex-1 flex items-end justify-center gap-3 h-28">
          {bars.map((bar, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: bar.height }}
              transition={{ duration: 0.8, delay: 0.5 + bar.delay, ease: "easeOut" as const }}
              className="w-5 rounded-t-sm"
              style={{
                background: `linear-gradient(to top, ${bar.color}40, ${bar.color})`,
                boxShadow: `0 0 8px ${bar.color}30`,
              }}
            />
          ))}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] text-emerald-400 font-semibold uppercase">All Systems Normal</span>
          </span>
          <span className="text-[8px] text-slate-500 font-mono">Live</span>
        </div>
      </div>
    </motion.div>
  );
}
