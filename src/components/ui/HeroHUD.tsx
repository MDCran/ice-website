"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface HUDMetric {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
}

const metrics: HUDMetric[] = [
  { label: "Active Nodes", value: 847, suffix: "" },
  { label: "Data Protected", value: 2.4, suffix: " PB", decimals: 1 },
  { label: "Uptime", value: 99.999, suffix: "%", decimals: 3 },
];

function CountUp({ target, decimals = 0, duration = 2000 }: { target: number; decimals?: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{value.toFixed(decimals)}</>;
}

export default function HeroHUD() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-[4] hidden lg:block"
    >
      <div className="glass-card-static rounded-xl border border-sky-500/15 px-5 py-4 w-56 backdrop-blur-xl">
        {/* Scan line overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"
            style={{ animation: "scan 4s linear infinite" }}
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-400/80">
            Live Telemetry
          </span>
        </div>

        <div className="space-y-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.2 }}
              className="border-b border-white/[0.04] pb-2 last:border-0 last:pb-0"
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
              <p className="text-lg font-bold text-white font-mono">
                <CountUp target={m.value} decimals={m.decimals} />
                <span className="text-sky-400 text-sm">{m.suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
