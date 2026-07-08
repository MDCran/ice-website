"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNT-UP
   ═══════════════════════════════════════════════════════════════════════════ */

function useCountUp(target: number, inView: boolean, decimals = 0, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(parseFloat(start.toFixed(decimals)));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, decimals, duration]);
  return value;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. UPTIME GAUGE — semicircular SVG
   ═══════════════════════════════════════════════════════════════════════════ */

function UptimeGauge({ inView }: { inView: boolean }) {
  const value = useCountUp(99.99, inView, 2);
  const radius = 60;
  const circumference = Math.PI * radius;
  const progress = inView ? (99.99 / 100) * circumference : 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 80" className="w-full max-w-[180px]">
        {/* Track */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-white/[0.06]"
        />
        {/* Progress */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#049bfb" />
            <stop offset="100%" stopColor="#0474bc" />
          </linearGradient>
        </defs>
        {/* Value */}
        <text x="70" y="68" textAnchor="middle" className="fill-white text-lg font-bold" fontSize="18">
          {value}%
        </text>
      </svg>
      <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">Uptime SLA</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. 24/7 CLOCK — SVG analog with rotating hands
   ═══════════════════════════════════════════════════════════════════════════ */

function AlwaysOnClock() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Clock face */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
          {/* Hour marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + 38 * Math.sin(angle);
            const y1 = 50 - 38 * Math.cos(angle);
            const x2 = 50 + 42 * Math.sin(angle);
            const y2 = 50 - 42 * Math.cos(angle);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#049bfb" strokeWidth="1.5" opacity="0.5" />
            );
          })}
          {/* Hour hand */}
          <line
            x1="50" y1="50" x2="50" y2="25"
            stroke="#049bfb" strokeWidth="2.5" strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", animation: "clockHour 12s linear infinite" }}
          />
          {/* Minute hand */}
          <line
            x1="50" y1="50" x2="50" y2="18"
            stroke="#0474bc" strokeWidth="1.5" strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", animation: "clockMinute 4s linear infinite" }}
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="#049bfb" />
        </svg>
      </div>
      <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mt-1">Always On</p>
      <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider">24/7/365</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. SECURITY SCANNER — Radar sweep
   ═══════════════════════════════════════════════════════════════════════════ */

function SecurityScanner({ inView }: { inView: boolean }) {
  const threats = useCountUp(0, inView, 0);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="1" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(168,85,247,0.06)" strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />
          {/* Sweep */}
          {inView && (
            <g style={{ transformOrigin: "50px 50px", animation: "radar-sweep 3s linear infinite" }}>
              <line x1="50" y1="50" x2="50" y2="10" stroke="#049bfb" strokeWidth="1" opacity="0.8" />
              <path
                d="M 50 50 L 50 10 A 40 40 0 0 1 85 30 Z"
                fill="url(#radarSweepGrad)"
                opacity="0.15"
              />
            </g>
          )}
          {/* Detection dots */}
          <circle cx="35" cy="30" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" />
          <circle cx="65" cy="38" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
          <circle cx="42" cy="62" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" style={{ animationDelay: "1s" }} />
          <defs>
            <linearGradient id="radarSweepGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#049bfb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#049bfb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Center */}
          <circle cx="50" cy="50" r="3" fill="#049bfb" opacity="0.6" />
        </svg>
      </div>
      <p className="text-lg font-bold text-emerald-400 font-mono">{threats} Threats</p>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">All Clear</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. CAPACITY METER — Horizontal bars
   ═══════════════════════════════════════════════════════════════════════════ */

const capacityBars = [
  { label: "CPU", value: 34, color: "#049bfb" },
  { label: "RAM", value: 52, color: "#0474bc" },
  { label: "Storage", value: 41, color: "#8b5cf6" },
];

function CapacityMeter({ inView }: { inView: boolean }) {
  return (
    <div className="flex flex-col items-center w-full max-w-[200px]">
      <div className="w-full space-y-3">
        {capacityBars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 uppercase tracking-wider font-medium">{bar.label}</span>
              <span className="text-white font-mono font-semibold">{inView ? bar.value : 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: inView ? `${bar.value}%` : "0%",
                  background: `linear-gradient(90deg, ${bar.color}, ${bar.color}80)`,
                  transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: `0 0 10px ${bar.color}40`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">System Capacity</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. THREAT COUNTER — Animated HUD display
   ═══════════════════════════════════════════════════════════════════════════ */

function ThreatCounter({ inView }: { inView: boolean }) {
  const blocked = useCountUp(14723, inView, 0);
  return (
    <div className="flex flex-col items-center">
      <div className="data-panel rounded-xl border border-sky-500/15 bg-white/[0.02] px-6 py-4 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Threats Blocked (30d)</p>
        <p className="text-3xl font-black text-white font-mono tabular-nums">
          {inView ? blocked.toLocaleString() : "0"}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Protected</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Threat Intelligence</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENTERPRISE METRICS DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

export default function EnterpriseMetrics() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-start">
        {[
          <UptimeGauge key="uptime" inView={inView} />,
          <AlwaysOnClock key="clock" />,
          <SecurityScanner key="scanner" inView={inView} />,
          <CapacityMeter key="capacity" inView={inView} />,
          <ThreatCounter key="threats" inView={inView} />,
        ].map((component, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex justify-center"
          >
            {component}
          </motion.div>
        ))}
      </div>

    </div>
  );
}
