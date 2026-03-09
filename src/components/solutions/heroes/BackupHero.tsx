"use client";

import { motion } from "motion/react";

export default function BackupHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background pulsing rings */}
        <circle cx="100" cy="130" r="90" fill="none" stroke="rgba(168,85,247,0.05)" strokeWidth="0.5" />
        <circle cx="100" cy="130" r="70" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="0.5" className="animate-pulse" />

        {/* Stacked snapshot copies (back to front) */}
        {/* Snapshot 3 — furthest back */}
        <ellipse cx="108" cy="100" rx="38" ry="12" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        <rect x="70" y="100" width="76" height="50" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        <ellipse cx="108" cy="150" rx="38" ry="12" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />

        {/* Snapshot 2 — middle */}
        <ellipse cx="104" cy="95" rx="38" ry="12" fill="rgba(4,116,188,0.08)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />
        <rect x="66" y="95" width="76" height="50" fill="rgba(4,116,188,0.05)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />
        <ellipse cx="104" cy="145" rx="38" ry="12" fill="rgba(4,116,188,0.08)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />

        {/* Main database cylinder — front */}
        <ellipse cx="100" cy="90" rx="38" ry="12" fill="rgba(4,155,251,0.15)" stroke="#049bfb" strokeWidth="1.2" />
        <rect x="62" y="90" width="76" height="55" fill="rgba(4,155,251,0.08)" stroke="#049bfb" strokeWidth="1.2" />
        <ellipse cx="100" cy="145" rx="38" ry="12" fill="rgba(4,155,251,0.15)" stroke="#049bfb" strokeWidth="1.2" />
        {/* Cover the side stroke overlap on the cylinder body */}
        <rect x="63" y="91" width="74" height="53" fill="rgba(4,155,251,0.08)" stroke="none" />
        {/* Internal partition lines */}
        <ellipse cx="100" cy="108" rx="38" ry="8" fill="none" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" strokeDasharray="3 2" />
        <ellipse cx="100" cy="126" rx="38" ry="8" fill="none" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" strokeDasharray="3 2" />

        {/* DB label */}
        <text x="100" y="122" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit">DATABASE</text>

        {/* Animated backup arrow from database to vault */}
        <path d="M140,120 C160,120 165,115 175,100 C185,85 195,80 210,80" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <polygon points="210,77 217,80 210,83" fill="#8b5cf6" opacity="0.7" />

        {/* Animated data particles along the path */}
        <circle r="2" fill="#049bfb" opacity="0.6">
          <animateMotion dur="2s" repeatCount="indefinite" path="M140,120 C160,120 165,115 175,100 C185,85 195,80 210,80" />
        </circle>
        <circle r="2" fill="#8b5cf6" opacity="0.6">
          <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M140,120 C160,120 165,115 175,100 C185,85 195,80 210,80" />
        </circle>

        {/* Storage Vault */}
        <g transform="translate(210, 55)">
          <rect x="0" y="0" width="65" height="70" rx="5" fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" strokeWidth="1.2" />
          {/* Vault door detail */}
          <rect x="8" y="8" width="49" height="44" rx="3" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.25)" strokeWidth="0.8" />
          {/* Vault cross bars */}
          <line x1="32" y1="8" x2="32" y2="52" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
          <line x1="8" y1="30" x2="57" y2="30" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />

          {/* Encrypted lock icon */}
          <rect x="22" y="28" width="20" height="15" rx="3" fill="rgba(4,155,251,0.15)" stroke="#049bfb" strokeWidth="1" />
          <path d="M27,28 L27,22 C27,18,37,18,37,22 L37,28" fill="none" stroke="#049bfb" strokeWidth="1" />
          <circle cx="32" cy="35" r="2" fill="#049bfb" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Lock keyhole */}
          <line x1="32" y1="37" x2="32" y2="40" stroke="#049bfb" strokeWidth="1" opacity="0.6" />

          {/* Vault label */}
          <text x="32" y="64" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">VAULT</text>
        </g>

        {/* Encrypted badge */}
        <g transform="translate(215, 130)">
          <rect x="0" y="0" width="55" height="16" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.8" />
          <circle cx="10" cy="8" r="2.5" fill="#10b981" opacity="0.7" className="animate-pulse" />
          <text x="34" y="12" textAnchor="middle" className="fill-emerald-400" fontSize="7" fontFamily="inherit">AES-256</text>
        </g>

        {/* Timeline bar at bottom */}
        <line x1="40" y1="240" x2="260" y2="240" stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" />

        {/* Restore points on timeline */}
        {[
          { x: 60, label: "D-7", active: false },
          { x: 100, label: "D-5", active: false },
          { x: 140, label: "D-3", active: false },
          { x: 180, label: "D-1", active: false },
          { x: 220, label: "Now", active: true },
        ].map((point, i) => (
          <g key={i}>
            <circle cx={point.x} cy={240} r={point.active ? 5 : 3.5} fill={point.active ? "#10b981" : "rgba(4,155,251,0.5)"} stroke={point.active ? "#10b981" : "rgba(4,155,251,0.3)"} strokeWidth="1" opacity={point.active ? 0.9 : 0.7}>
              {point.active && <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />}
            </circle>
            <text x={point.x} y={255} textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">{point.label}</text>
            {/* Vertical tick */}
            <line x1={point.x} y1={234} x2={point.x} y2={236} stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
          </g>
        ))}

        {/* Timeline label */}
        <text x="150" y="272" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit">Recovery Timeline</text>

        {/* Floating accent nodes */}
        <circle cx="50" cy="70" r="2" fill="#049bfb" opacity="0.3" className="animate-pulse" />
        <circle cx="160" cy="55" r="2" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.7s" }} />
      </svg>
    </motion.div>
  );
}
