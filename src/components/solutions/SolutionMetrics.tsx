"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, inView: boolean, decimals = 0, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(parseFloat(start.toFixed(decimals)));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, decimals, duration]);
  return value;
}

/* Semantic token colors for SVG fills/strokes — adapt to light & dark mode */
const TOKEN = {
  brand: "var(--color-fg-brand-secondary)",
  brandDeep: "var(--color-utility-brand-600)",
  success: "var(--color-fg-success-secondary)",
  error: "var(--color-fg-error-secondary)",
  warning: "var(--color-fg-warning-primary)",
  track: "var(--color-bg-quaternary)",
  ring: "var(--color-border-secondary)",
  text: "var(--color-text-primary)",
};

function svgId(prefix: string, label: string) {
  return `${prefix}-${label.replace(/[^a-zA-Z0-9]/g, "")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   METRIC WIDGETS
   ═══════════════════════════════════════════════════════════════════════════ */

/* 1. Donut Gauge — circular progress with center value */
function DonutGauge({ inView, percent, label, suffix = "%", color = "emerald" }: { inView: boolean; percent: number; label: string; suffix?: string; color?: string }) {
  const value = useCountUp(percent, inView, percent % 1 !== 0 ? 1 : 0);
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const colors: Record<string, [string, string]> = {
    emerald: [TOKEN.success, TOKEN.brand],
    sky: [TOKEN.brand, TOKEN.brandDeep],
    purple: [TOKEN.brand, TOKEN.brandDeep],
    red: [TOKEN.error, TOKEN.warning],
  };
  const [c1, c2] = colors[color] || colors.emerald;
  const gId = svgId("dg", label);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-center">
        <div className="relative h-[130px] w-[130px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke={TOKEN.track} strokeWidth="7" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={`url(#${gId})`} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }} />
            <defs><linearGradient id={gId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-primary tabular-nums">{value}{suffix}</span>
          </div>
        </div>
      </div>
      <p className="mt-2 max-w-[140px] text-center text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
    </div>
  );
}

/* 2. Speedometer — half-circle gauge with needle */
function Speedometer({ inView, value: target, label, max = 100 }: { inView: boolean; value: number; label: string; max?: number }) {
  const value = useCountUp(target, inView, 0);
  const r = 52;
  const circ = Math.PI * r;
  const progress = (value / max) * circ;
  const gId = svgId("speed", label);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-center">
        <svg viewBox="0 0 130 78" className="w-full max-w-[160px]">
          <path d="M 12 72 A 52 52 0 0 1 118 72" fill="none" stroke={TOKEN.track} strokeWidth="7" />
          <path d="M 12 72 A 52 52 0 0 1 118 72" fill="none" stroke={`url(#${gId})`} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - progress} style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }} />
          <line x1="65" y1="72" x2="65" y2="25" stroke={TOKEN.brand} strokeWidth="2" strokeLinecap="round"
            style={{ transformOrigin: "65px 72px", transform: `rotate(${-90 + (value / max) * 180}deg)`, transition: "transform 2s cubic-bezier(0.4,0,0.2,1)" }} />
          <circle cx="65" cy="72" r="3.5" fill={TOKEN.brand} />
          <defs><linearGradient id={gId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={TOKEN.error} /><stop offset="50%" stopColor={TOKEN.warning} /><stop offset="100%" stopColor={TOKEN.success} />
          </linearGradient></defs>
          <text x="65" y="64" textAnchor="middle" fontSize="18" fontWeight="600" style={{ fill: TOKEN.text }}>{value}</text>
        </svg>
      </div>
      <p className="mt-1 max-w-[140px] text-center text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
    </div>
  );
}

/* 3. Uptime Bar — horizontal progress with SLA scale */
function UptimeBar({ inView, sla, label }: { inView: boolean; sla: number; label: string }) {
  const value = useCountUp(sla, inView, sla >= 99.999 ? 3 : 2, 2500);

  return (
    <div className="flex h-full w-full max-w-[190px] flex-col items-center justify-between">
      <div className="flex w-full flex-1 items-center">
        <div className="w-full">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-[10px] font-medium tracking-wider text-quaternary uppercase">SLA</span>
            <span className="text-lg font-semibold text-fg-success-primary tabular-nums">{value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-quaternary">
            <div
              className="h-full rounded-full bg-brand-solid"
              style={{
                width: inView ? `${(sla / 100) * 100}%` : "0%",
                transition: "width 2.5s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between">
            {["99%", "99.9%", "99.99%", "99.999%"].map((s) => (
              <span key={s} className="text-[8px] text-quaternary tabular-nums">{s}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
    </div>
  );
}

/* 4. Timer Display — HH:MM:SS countdown */
function TimerDisplay({ inView, minutes, label }: { inView: boolean; minutes: number; label: string }) {
  const value = useCountUp(minutes, inView, 0, 1800);
  const hrs = Math.floor(value / 60);
  const mins = Math.floor(value % 60);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="rounded-xl bg-primary px-4 py-3 shadow-xs ring-1 ring-secondary">
        <p className="mb-2 text-center text-[9px] font-semibold tracking-widest text-quaternary uppercase">{label}</p>
        <div className="flex items-center justify-center gap-1">
          {[
            { val: String(hrs).padStart(2, "0"), unit: "HR" },
            { val: String(mins).padStart(2, "0"), unit: "MIN" },
          ].map((t, i) => (
            <div key={t.unit} className="flex items-center gap-1">
              {i > 0 && <span className="mx-0.5 text-lg font-semibold text-fg-quaternary">:</span>}
              <div className="flex flex-col items-center">
                <span className="rounded-lg bg-secondary px-2 py-0.5 text-2xl font-semibold text-primary tabular-nums">{t.val}</span>
                <span className="mt-0.5 text-[7px] tracking-widest text-quaternary uppercase">{t.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-fg-success-secondary" />
          <span className="text-[9px] font-semibold tracking-wider text-fg-success-primary uppercase">Guaranteed</span>
        </div>
      </div>
    </div>
  );
}

/* 5. Shield — animated shield with checkmark */
function ShieldMetric({ inView, value: target, unit, label }: { inView: boolean; value: number; unit: string; label: string }) {
  const value = useCountUp(target, inView, 0, 2200);
  const gId = svgId("sh", label);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-center">
        <div className="relative h-[110px] w-[110px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path d="M50 8 L85 25 L85 55 Q85 80 50 95 Q15 80 15 55 L15 25 Z" fill="none" stroke={`url(#${gId}g)`} strokeWidth="2" opacity="0.6" />
            <path d="M50 18 L75 30 L75 52 Q75 72 50 84 Q25 72 25 52 L25 30 Z" fill={`url(#${gId}f)`} opacity={inView ? "0.1" : "0"} style={{ transition: "opacity 1.5s" }} />
            <path d="M 35 52 L 45 62 L 65 40" fill="none" stroke={TOKEN.success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="50" strokeDashoffset={inView ? "0" : "50"} style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1) 0.5s" }} />
            <defs>
              <linearGradient id={`${gId}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOKEN.brand} /><stop offset="100%" stopColor={TOKEN.success} /></linearGradient>
              <linearGradient id={`${gId}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOKEN.brand} /><stop offset="100%" stopColor={TOKEN.success} /></linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-primary tabular-nums">{value.toLocaleString()}<span className="ml-1 text-sm font-medium text-fg-brand-secondary">{unit}</span></p>
        <p className="mt-0.5 max-w-[140px] text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
      </div>
    </div>
  );
}

/* 6. Radar — threat scanner with sweep */
function RadarScan({ inView, count, label }: { inView: boolean; count: number; label: string }) {
  const value = useCountUp(count, inView, 0, 2500);
  const rId = svgId("rs", label);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-center">
        <div className="relative h-[120px] w-[120px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke={TOKEN.ring} strokeWidth="1" />
            <circle cx="50" cy="50" r="28" fill="none" stroke={TOKEN.ring} strokeWidth="1" opacity="0.7" />
            <circle cx="50" cy="50" r="16" fill="none" stroke={TOKEN.ring} strokeWidth="1" opacity="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke={TOKEN.ring} strokeWidth="0.5" opacity="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke={TOKEN.ring} strokeWidth="0.5" opacity="0.5" />
            {inView && (
              <g style={{ transformOrigin: "50px 50px", animation: "radar-sweep 3s linear infinite" }}>
                <line x1="50" y1="50" x2="50" y2="10" stroke={TOKEN.brand} strokeWidth="1" opacity="0.7" />
                <path d="M 50 50 L 50 10 A 40 40 0 0 1 85 30 Z" fill={`url(#${rId})`} opacity="0.12" />
              </g>
            )}
            {[{ cx: 33, cy: 28 }, { cx: 67, cy: 36 }, { cx: 40, cy: 64 }, { cx: 70, cy: 58 }].map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r="2" fill={TOKEN.success} opacity="0.7" className="animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
            <defs><linearGradient id={rId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={TOKEN.brand} stopOpacity="0.4" /><stop offset="100%" stopColor={TOKEN.brand} stopOpacity="0" />
            </linearGradient></defs>
            <circle cx="50" cy="50" r="2.5" fill={TOKEN.brand} opacity="0.5" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-primary tabular-nums">{value.toLocaleString()}</p>
        <p className="mt-0.5 max-w-[140px] text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
      </div>
    </div>
  );
}

/* 7. Before/After Bars */
function ComparisonBars({ inView, bars, label }: { inView: boolean; bars: { label: string; before: number; after: number }[]; label: string }) {
  return (
    <div className="flex h-full w-full max-w-[200px] flex-col items-center justify-between">
      <div className="flex w-full flex-1 items-center">
        <div className="w-full space-y-3.5">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="font-semibold tracking-wider text-quaternary uppercase">{bar.label}</span>
                <span className="font-semibold text-fg-success-primary tabular-nums">{inView ? Math.round(((bar.before - bar.after) / bar.before) * 100) : 0}% ↓</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-9 shrink-0 text-[7px] text-quaternary uppercase">Before</span>
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-quaternary">
                    <div className="h-full rounded-full bg-error-solid" style={{ width: inView ? `${bar.before}%` : "0%", opacity: 0.6, transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-9 shrink-0 text-[7px] text-quaternary uppercase">After</span>
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-quaternary">
                    <div className="h-full rounded-full bg-brand-solid" style={{
                      width: inView ? `${bar.after}%` : "0%",
                      transition: "width 1.8s cubic-bezier(0.4,0,0.2,1) 0.3s",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 max-w-[160px] text-center text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
    </div>
  );
}

/* 8. Checklist — animated sequential check */
function Checklist({ inView, items, label }: { inView: boolean; items: string[]; label: string }) {
  const [checked, setChecked] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => { i++; setChecked(i); if (i >= items.length) clearInterval(timer); }, 350);
    return () => clearInterval(timer);
  }, [inView, items.length]);

  return (
    <div className="flex h-full w-full max-w-[170px] flex-col items-center justify-between">
      <div className="flex w-full flex-1 items-center">
        <div className="w-full space-y-1.5">
          {items.map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1 transition-colors duration-500 ${i < checked ? "bg-primary shadow-xs ring-1 ring-secondary" : ""}`}
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                i < checked ? "border-transparent bg-success-solid" : "border-secondary bg-primary"}`}>
                {i < checked && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className={`text-[10px] transition-colors duration-500 ${i < checked ? "font-medium text-secondary" : "text-quaternary"}`}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-quaternary">
          <div className="h-full rounded-full bg-success-solid" style={{ width: `${(checked / items.length) * 100}%`, transition: "width 0.4s ease" }} />
        </div>
        <p className="mt-2 text-center text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
      </div>
    </div>
  );
}

/* 9. Counter — big number with label */
function BigCounter({ inView, value: target, suffix, prefix, label }: { inView: boolean; value: number; suffix?: string; prefix?: string; label: string }) {
  const value = useCountUp(target, inView, 0, 2200);
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="rounded-xl bg-primary px-5 py-3 text-center shadow-xs ring-1 ring-secondary">
        <p className="mb-1 text-[9px] font-semibold tracking-widest text-quaternary uppercase">{label}</p>
        <p className="text-3xl font-semibold text-primary tabular-nums">
          {prefix}{value.toLocaleString()}{suffix}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-fg-success-secondary" />
          <span className="text-[8px] font-semibold tracking-wider text-fg-success-primary uppercase">Active</span>
        </div>
      </div>
    </div>
  );
}

/* 10. Scale Blocks — animated rising bars */
function ScaleBlocks({ inView, label }: { inView: boolean; label: string }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => { i++; setLevel(i); if (i >= 5) clearInterval(timer); }, 280);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-end justify-center">
        <div className="flex h-[100px] items-end gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-5 rounded-sm transition-all duration-500" style={{
              height: `${i * 16}px`,
              background: i <= level ? "var(--color-bg-brand-solid)" : "var(--color-bg-quaternary)",
              opacity: i <= level ? 1 : 0.5,
            }} />
          ))}
        </div>
      </div>
      <div className="text-center">
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-fg-brand-secondary" />
          <span className="text-[8px] font-semibold tracking-wider text-fg-brand-secondary uppercase">Dynamic</span>
        </div>
        <p className="mt-1 text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
      </div>
    </div>
  );
}

/* 11. Clock — spinning hands for 24/7 */
function ClockWidget({ inView, hours, label }: { inView: boolean; hours: number; label: string }) {
  const value = useCountUp(hours, inView, 0, 2000);

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 items-center">
        <div className="relative h-[105px] w-[105px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="42" fill="none" stroke={TOKEN.ring} strokeWidth="2" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={50 + 36 * Math.sin(a)} y1={50 - 36 * Math.cos(a)} x2={50 + 40 * Math.sin(a)} y2={50 - 40 * Math.cos(a)}
                stroke={TOKEN.brand} strokeWidth={i % 3 === 0 ? "2" : "1"} opacity={i % 3 === 0 ? "0.5" : "0.2"} />;
            })}
            <line x1="50" y1="50" x2="50" y2="20" stroke={TOKEN.brand} strokeWidth="2" strokeLinecap="round"
              style={{ transformOrigin: "50px 50px", animation: inView ? "clockMinute 2s linear infinite" : "none" }} />
            <line x1="50" y1="50" x2="50" y2="28" stroke={TOKEN.brandDeep} strokeWidth="1.5" strokeLinecap="round"
              style={{ transformOrigin: "50px 50px", animation: inView ? "clockHour 8s linear infinite" : "none" }} />
            <circle cx="50" cy="50" r="2.5" fill={TOKEN.brand} />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-primary tabular-nums">{value}<span className="ml-1 text-xs font-medium text-fg-brand-secondary">hrs</span></p>
        <p className="mt-0.5 max-w-[140px] text-xs font-medium tracking-wider text-quaternary uppercase">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   METRIC CONFIG — unique set per solution page
   ═══════════════════════════════════════════════════════════════════════════ */

export type MetricPreset =
  | "managed-cloud-hosting" | "managed-private-cloud" | "managed-hybrid-cloud" | "cloud-migration"
  | "backup-as-a-service" | "disaster-recovery" | "high-availability" | "ransomware-recovery"
  | "ibm-i-security" | "protection-suite" | "security-monitoring" | "threat-detection" | "endpoint-security"
  | "managed-microsoft" | "automation-suite" | "systems-management" | "ibm-power-vs"
  // Legacy presets still work — they map to a representative page
  | "cloud" | "data-protection" | "security" | "managed-services";

const PRESET_ALIAS: Partial<Record<MetricPreset, MetricPreset>> = {
  cloud: "managed-cloud-hosting",
  "data-protection": "backup-as-a-service",
  security: "ibm-i-security",
  "managed-services": "managed-microsoft",
};

interface PageConfig { heading: string; subtitle: string }

function getPageConfig(preset: MetricPreset): PageConfig {
  const configs: Record<string, PageConfig> = {
    "managed-cloud-hosting": { heading: "Cloud hosting by the numbers", subtitle: "Real-world performance metrics from Tier-3 data center infrastructure." },
    "managed-private-cloud": { heading: "Private cloud performance", subtitle: "Dedicated environment metrics delivering predictable, compliant results." },
    "managed-hybrid-cloud": { heading: "Hybrid cloud impact", subtitle: "Measurable outcomes from unified hybrid cloud management." },
    "cloud-migration": { heading: "Migration results", subtitle: "Proven outcomes from ICE-managed cloud migration projects." },
    "backup-as-a-service": { heading: "Backup performance", subtitle: "Enterprise data protection metrics that give you peace of mind." },
    "disaster-recovery": { heading: "Recovery readiness", subtitle: "Guaranteed disaster recovery metrics backed by SLA commitments." },
    "high-availability": { heading: "Availability metrics", subtitle: "Mission-critical uptime metrics for zero-tolerance environments." },
    "ransomware-recovery": { heading: "Cyber resilience", subtitle: "Ransomware defense and recovery metrics with immutable, air-gapped protection." },
    "ibm-i-security": { heading: "IBM i security posture", subtitle: "Hardening and compliance metrics for your IBM i environment." },
    "protection-suite": { heading: "Protection coverage", subtitle: "Multi-layered defense metrics across your entire threat surface." },
    "security-monitoring": { heading: "SOC performance", subtitle: "24/7 Security Operations Center monitoring metrics." },
    "threat-detection": { heading: "Detection intelligence", subtitle: "AI-powered threat detection and response performance." },
    "endpoint-security": { heading: "Endpoint defense", subtitle: "Next-gen endpoint protection metrics across every device." },
    "managed-microsoft": { heading: "Microsoft optimization", subtitle: "Managed M365 and Azure performance and savings metrics." },
    "automation-suite": { heading: "Automation impact", subtitle: "Measurable efficiency gains from AI-powered security and patch automation." },
    "systems-management": { heading: "Operations excellence", subtitle: "Proactive systems management performance metrics." },
    "ibm-power-vs": { heading: "Power VS performance", subtitle: "Cloud-based IBM Power infrastructure metrics." },
  };
  return configs[preset] || { heading: "Measurable results", subtitle: "Enterprise-grade performance metrics." };
}

function getMetrics(preset: MetricPreset, inView: boolean): ReactNode[] {
  const p = PRESET_ALIAS[preset] || preset;
  const m: Record<string, ReactNode[]> = {
    "managed-cloud-hosting": [
      <DonutGauge key="a" inView={inView} percent={50} label="Avg Cost Reduction (3yr)" />,
      <DonutGauge key="b" inView={inView} percent={70} label="Time Saved on Infra Mgmt" color="sky" />,
      <ScaleBlocks key="c" inView={inView} label="Auto-Scale" />,
      <Speedometer key="d" inView={inView} value={97} label="Performance Score" />,
      <Checklist key="e" inView={inView} label="Compliance" items={["PCI", "HIPAA", "SOX", "GDPR"]} />,
    ],
    "managed-private-cloud": [
      <DonutGauge key="a" inView={inView} percent={40} label="Lower TCO" />,
      <Checklist key="b" inView={inView} label="Compliance Ready" items={["ISO 27001", "SOC 2", "HIPAA", "PCI-DSS", "GDPR", "NIST-800-53"]} />,
      <DonutGauge key="c" inView={inView} percent={70} label="IT Mgmt Time Saved" color="sky" />,
      <ShieldMetric key="d" inView={inView} value={100} unit="%" label="Tenant Isolation" />,
      <DonutGauge key="e" inView={inView} percent={0} label="Resource Oversubscription" suffix="%" color="emerald" />,
    ],
    "managed-hybrid-cloud": [
      <DonutGauge key="a" inView={inView} percent={45} label="Cost Optimization" />,
      <ScaleBlocks key="b" inView={inView} label="Elastic Bursting" />,
      <Checklist key="c" inView={inView} label="Unified Compliance" items={["On-Prem", "Private Cloud", "Public Cloud", "Edge"]} />,
      <UptimeBar key="d" inView={inView} sla={99.99} label="Hybrid SLA" />,
      <ComparisonBars key="e" inView={inView} label="Before vs After" bars={[
        { label: "Vendor Lock-in", before: 85, after: 20 }, { label: "Deploy Time", before: 80, after: 25 }, { label: "Costs", before: 75, after: 42 },
      ]} />,
    ],
    "cloud-migration": [
      <BigCounter key="a" inView={inView} value={1200} suffix="+" label="ICE Migrations" />,
      <DonutGauge key="b" inView={inView} percent={50} label="Avg Cost Reduction" />,
      <BigCounter key="c" inView={inView} value={3} suffix="x" label="Faster Deployments" />,
      <DonutGauge key="d" inView={inView} percent={40} label="Fewer Post-Migration Issues" color="sky" />,
      <Checklist key="e" inView={inView} label="Compliance" items={["HIPAA", "PCI-DSS", "SOC II", "GDPR"]} />,
    ],
    "backup-as-a-service": [
      <ShieldMetric key="a" inView={inView} value={2.5} unit="PB" label="Data Protected" />,
      <TimerDisplay key="b" inView={inView} minutes={15} label="Recovery Time (RTO)" />,
      <UptimeBar key="c" inView={inView} sla={99.999} label="Backup Success Rate" />,
      <DonutGauge key="d" inView={inView} percent={60} label="Infrastructure Savings" />,
      <Checklist key="e" inView={inView} label="Compliance Ready" items={["SOC 2", "HIPAA", "PCI-DSS", "SOX", "GDPR"]} />,
    ],
    "disaster-recovery": [
      <TimerDisplay key="a" inView={inView} minutes={15} label="Guaranteed RTO" />,
      <DonutGauge key="b" inView={inView} percent={100} label="DR Test Pass Rate" color="emerald" />,
      <RadarScan key="c" inView={inView} count={0} label="Unplanned Outages" />,
      <UptimeBar key="d" inView={inView} sla={99.99} label="Recovery SLA" />,
      <ComparisonBars key="e" inView={inView} label="Business Impact" bars={[
        { label: "Downtime Cost", before: 90, after: 8 }, { label: "Data Loss Risk", before: 75, after: 5 }, { label: "Recovery Time", before: 85, after: 12 },
      ]} />,
    ],
    "high-availability": [
      <UptimeBar key="a" inView={inView} sla={99.999} label="Target Uptime" />,
      <TimerDisplay key="b" inView={inView} minutes={30} label="Failover RTO" />,
      <TimerDisplay key="c" inView={inView} minutes={10} label="RPO (Data Loss Window)" />,
      <Speedometer key="d" inView={inView} value={99} label="Replication Health" />,
      <Checklist key="e" inView={inView} label="Platform Coverage" items={["IBM i (HA4i)", "AIX", "Linux", "Windows"]} />,
    ],
    "ransomware-recovery": [
      <ShieldMetric key="a" inView={inView} value={100} unit="%" label="Immutable Backups" />,
      <RadarScan key="b" inView={inView} count={847} label="Threats Scanned (24h)" />,
      <TimerDisplay key="c" inView={inView} minutes={240} label="Full System Recovery" />,
      <DonutGauge key="d" inView={inView} percent={100} label="Air-Gap Isolation" color="emerald" />,
      <Checklist key="e" inView={inView} label="Cyber Vault" items={["Immutable Copy", "Air-Gapped", "Threat Scanned", "Clean Room", "Time-Locked"]} />,
    ],
    "ibm-i-security": [
      <RadarScan key="a" inView={inView} count={342} label="Vulnerabilities Found" />,
      <Checklist key="b" inView={inView} label="Compliance" items={["ISO 27001", "SOC 2", "HIPAA", "PCI-DSS", "GDPR", "NIST-800-53"]} />,
      <Speedometer key="c" inView={inView} value={96} label="Security Score" />,
      <BigCounter key="d" inView={inView} value={48} label="Exit Points Monitored" />,
      <ComparisonBars key="e" inView={inView} label="Risk Reduction" bars={[
        { label: "Breach Risk", before: 75, after: 8 }, { label: "Unauth Access", before: 60, after: 5 }, { label: "Audit Gaps", before: 80, after: 10 },
      ]} />,
    ],
    "protection-suite": [
      <RadarScan key="a" inView={inView} count={18432} label="Threats Blocked (30d)" />,
      <Speedometer key="b" inView={inView} value={99} label="Detection Rate" />,
      <TimerDisplay key="c" inView={inView} minutes={2} label="Avg Response Time" />,
      <DonutGauge key="d" inView={inView} percent={95} label="False Positive Reduction" />,
      <Checklist key="e" inView={inView} label="Layers Active" items={["Endpoint", "Network", "Email", "Web", "SOAR"]} />,
    ],
    "security-monitoring": [
      <BigCounter key="a" inView={inView} value={24} suffix="/7" label="SOC Coverage" />,
      <RadarScan key="b" inView={inView} count={2100000} label="Events Analyzed (30d)" />,
      <DonutGauge key="c" inView={inView} percent={92} label="Alert Noise Reduction" />,
      <Speedometer key="d" inView={inView} value={98} label="Detection Accuracy" />,
      <ComparisonBars key="e" inView={inView} label="SOC Impact" bars={[
        { label: "Dwell Time", before: 80, after: 12 }, { label: "Alert Fatigue", before: 85, after: 15 }, { label: "Response Time", before: 70, after: 10 },
      ]} />,
    ],
    "threat-detection": [
      <Speedometer key="a" inView={inView} value={99} label="AI Detection Rate" />,
      <BigCounter key="b" inView={inView} value={24} suffix="/7" label="MDR Coverage" />,
      <TimerDisplay key="c" inView={inView} minutes={3} label="Containment Time" />,
      <RadarScan key="d" inView={inView} count={14723} label="Threats Neutralized" />,
      <Checklist key="e" inView={inView} label="MITRE ATT&CK" items={["Recon", "Initial Access", "Execution", "Persistence", "Exfiltration"]} />,
    ],
    "endpoint-security": [
      <DonutGauge key="a" inView={inView} percent={70} label="Breaches Start at Endpoint" color="red" />,
      <BigCounter key="b" inView={inView} value={24} suffix="/7" label="EDR Monitoring" />,
      <ClockWidget key="c" inView={inView} hours={4} label="Patch Window" />,
      <Checklist key="d" inView={inView} label="Zero-Trust Checks" items={["Device Health", "Compliance", "Identity", "Posture", "Encryption"]} />,
      <ComparisonBars key="e" inView={inView} label="Endpoint Impact" bars={[
        { label: "Threats", before: 80, after: 2 }, { label: "Vuln Window", before: 85, after: 15 }, { label: "Incidents", before: 70, after: 8 },
      ]} />,
    ],
    "managed-microsoft": [
      <DonutGauge key="a" inView={inView} percent={38} label="Cost Savings" />,
      <UptimeBar key="b" inView={inView} sla={99.99} label="Service Availability" />,
      <ClockWidget key="c" inView={inView} hours={0} label="Migration Downtime" />,
      <Speedometer key="d" inView={inView} value={96} label="User Satisfaction" />,
      <ComparisonBars key="e" inView={inView} label="Operational Impact" bars={[
        { label: "License Waste", before: 80, after: 12 }, { label: "Ticket Volume", before: 70, after: 22 }, { label: "Config Drift", before: 65, after: 8 },
      ]} />,
    ],
    "automation-suite": [
      <DonutGauge key="a" inView={inView} percent={50} label="Downtime Reduction" />,
      <BigCounter key="b" inView={inView} value={100} suffix="+" label="OSs Supported" />,
      <Speedometer key="c" inView={inView} value={76} label="IT Leaders: Automation Critical" />,
      <Checklist key="d" inView={inView} label="Automation Coverage" items={["Patch Mgmt", "Vuln Remediation", "Endpoint Security", "Cloud Gateway"]} />,
      <ComparisonBars key="e" inView={inView} label="Automation ROI" bars={[
        { label: "Patch Time", before: 85, after: 15 }, { label: "Vuln Window", before: 80, after: 20 }, { label: "Incidents", before: 70, after: 25 },
      ]} />,
    ],
    "systems-management": [
      <DonutGauge key="a" inView={inView} percent={40} label="IT Support Cost Savings" />,
      <BigCounter key="b" inView={inView} value={24} suffix="/7" label="NOC Operations" />,
      <UptimeBar key="c" inView={inView} sla={100} label="Uptime Commitment" />,
      <Speedometer key="d" inView={inView} value={99} label="Platform Health" />,
      <Checklist key="e" inView={inView} label="Platforms Managed" items={["IBM i", "AIX", "Linux", "Windows", "Cloud"]} />,
    ],
    "ibm-power-vs": [
      <BigCounter key="a" inView={inView} value={15} suffix="x" label="Faster Provisioning" />,
      <DonutGauge key="b" inView={inView} percent={40} label="Cost Savings" />,
      <DonutGauge key="c" inView={inView} percent={70} label="On-Prem Infra Reduction" color="sky" />,
      <BigCounter key="d" inView={inView} value={35} suffix="+" label="Years IBM Expertise" />,
      <DonutGauge key="e" inView={inView} percent={80} label="Lower DR Costs" color="emerald" />,
    ],
  };
  return m[p] || m["managed-cloud-hosting"]!;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SolutionMetrics({ preset }: { preset: MetricPreset }) {
  const { ref, inView } = useInView(0.15);
  const reduceMotion = useHydratedReducedMotion();
  const resolved = PRESET_ALIAS[preset] || preset;
  const config = getPageConfig(resolved);
  const metrics = getMetrics(preset, inView);

  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 };
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <div ref={ref}>
      <motion.div
        initial={hidden}
        whileInView={shown}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
      >
        <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
          Measurable results
        </span>
        <h2 className="mt-3 text-display-sm font-semibold tracking-tight text-primary md:text-display-md">{config.heading}</h2>
        <p className="mt-4 text-lg text-tertiary md:mt-5">{config.subtitle}</p>
      </motion.div>

      <div className="mt-12 rounded-2xl bg-secondary px-6 py-10 ring-1 ring-secondary ring-inset md:mt-16 md:p-12">
        <div className="grid grid-cols-2 items-stretch justify-items-center gap-8 md:grid-cols-3 lg:grid-cols-5">
          {metrics.map((widget, i) => (
            <motion.div key={i} initial={hidden} whileInView={shown}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.1 }} className="flex w-full flex-col items-center justify-center">
              {widget}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
