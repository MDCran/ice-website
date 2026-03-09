"use client";

import { motion } from "motion/react";

const panels = [
  { label: "IBM i", status: "green", x: 40, y: 65, delay: 0 },
  { label: "AIX", status: "green", x: 145, y: 65, delay: 0.2 },
  { label: "Linux", status: "green", x: 40, y: 125, delay: 0.4 },
  { label: "Windows", status: "amber", x: 145, y: 125, delay: 0.6 },
  { label: "Network", status: "green", x: 40, y: 185, delay: 0.8 },
  { label: "Storage", status: "green", x: 145, y: 185, delay: 1.0 },
];

export default function SystemsManagementHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Outer frame */}
        <rect x="20" y="15" width="260" height="270" rx="12" fill="rgba(4,155,251,0.03)" stroke="rgba(4,155,251,0.12)" strokeWidth="1" />

        {/* Top bar */}
        <rect x="20" y="15" width="260" height="35" rx="12" fill="rgba(4,155,251,0.06)" />
        <rect x="20" y="38" width="260" height="12" fill="rgba(4,155,251,0.06)" />

        {/* Traffic lights */}
        <circle cx="38" cy="32" r="3" fill="rgba(239,68,68,0.4)" />
        <circle cx="48" cy="32" r="3" fill="rgba(250,204,21,0.4)" />
        <circle cx="58" cy="32" r="3" fill="rgba(52,211,153,0.4)" />

        {/* 24/7 NOC Label */}
        <rect x="170" y="22" width="95" height="20" rx="5" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.8" />
        <circle cx="182" cy="32" r="3" fill="#10b981" opacity="0.9" className="animate-pulse" />
        <text x="220" y="36" textAnchor="middle" fill="#049bfb" fontSize="10" fontFamily="inherit" fontWeight="bold">24/7 NOC</text>

        {/* 2x3 Server Status Panels */}
        {panels.map((panel) => (
          <g key={panel.label} transform={`translate(${panel.x}, ${panel.y})`}>
            <rect x="0" y="0" width="105" height="50" rx="6" fill={panel.status === "amber" ? "rgba(245,158,11,0.04)" : "rgba(4,155,251,0.04)"} stroke={panel.status === "amber" ? "rgba(245,158,11,0.2)" : "rgba(4,155,251,0.15)"} strokeWidth="0.8" />

            {/* System label */}
            <text x="10" y="16" className="fill-slate-400" fontSize="9" fontFamily="inherit" fontWeight="bold">{panel.label}</text>

            {/* Mini metrics bars */}
            <rect x="10" y="24" width="45" height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.2)" : "rgba(4,155,251,0.15)"} />
            <rect x="10" y="24" width={panel.status === "amber" ? "32" : "42"} height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.5)" : "rgba(4,155,251,0.4)"} />

            <rect x="10" y="31" width="45" height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.2)" : "rgba(4,155,251,0.15)"} />
            <rect x="10" y="31" width={panel.status === "amber" ? "28" : "40"} height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.5)" : "rgba(4,155,251,0.4)"} />

            <rect x="10" y="38" width="45" height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.2)" : "rgba(4,155,251,0.15)"} />
            <rect x="10" y="38" width={panel.status === "amber" ? "38" : "38"} height="3" rx="1" fill={panel.status === "amber" ? "rgba(245,158,11,0.5)" : "rgba(4,155,251,0.4)"} />

            {/* Status indicator */}
            <circle cx="85" cy="14" r="5" fill={panel.status === "amber" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"} />
            <circle cx="85" cy="14" r="3" fill={panel.status === "amber" ? "#f59e0b" : "#10b981"} opacity="0.9">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={panel.status === "amber" ? "1s" : "2.5s"} begin={`${panel.delay}s`} repeatCount="indefinite" />
            </circle>

            {/* Uptime text */}
            <text x="78" y="32" textAnchor="middle" fill={panel.status === "amber" ? "#f59e0b" : "#10b981"} fontSize="7" fontFamily="inherit" fontWeight="bold">{panel.status === "amber" ? "89%" : "100%"}</text>
            <text x="78" y="42" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="inherit">uptime</text>
          </g>
        ))}

        {/* Heartbeat / monitoring line across bottom */}
        <line x1="30" y1="250" x2="270" y2="250" stroke="rgba(4,155,251,0.08)" strokeWidth="0.5" />

        {/* Heartbeat path */}
        <path
          d="M30,250 L70,250 L80,250 L85,240 L90,260 L95,235 L100,265 L105,245 L110,255 L115,250 L145,250 L155,250 L160,242 L165,258 L170,238 L175,262 L180,248 L185,252 L190,250 L270,250"
          fill="none"
          stroke="#049bfb"
          strokeWidth="1.2"
          opacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 2"
          className="animate-[dash-flow_2s_linear_infinite]"
        />

        {/* Pulse dots on heartbeat line */}
        <circle cx="97" cy="250" r="2.5" fill="#049bfb" opacity="0.7" className="animate-pulse" />
        <circle cx="172" cy="250" r="2.5" fill="#049bfb" opacity="0.7" className="animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Bottom label */}
        <text x="150" y="275" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit">SYSTEMS MONITORING</text>
      </svg>
    </motion.div>
  );
}
