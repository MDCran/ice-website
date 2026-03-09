"use client";

import { motion } from "motion/react";

export default function DisasterRecoveryHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background pulsing rings */}
        <circle cx="150" cy="140" r="120" fill="none" stroke="rgba(168,85,247,0.04)" strokeWidth="0.5" />
        <circle cx="150" cy="140" r="90" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="0.5" className="animate-pulse" />

        {/* Primary Site (left) */}
        <g transform="translate(20, 80)">
          {/* Building / Data center */}
          <rect x="0" y="15" width="70" height="65" rx="4" fill="rgba(4,155,251,0.08)" stroke="#049bfb" strokeWidth="1.2" />
          {/* Roof */}
          <polygon points="35,0 -5,15 75,15" fill="rgba(4,155,251,0.12)" stroke="#049bfb" strokeWidth="1" />
          {/* Windows / server racks */}
          <rect x="10" y="25" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="30" y="25" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="50" y="25" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="10" y="42" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="30" y="42" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="50" y="42" width="15" height="12" rx="2" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          {/* Door */}
          <rect x="27" y="60" width="16" height="20" rx="2" fill="rgba(4,155,251,0.2)" stroke="rgba(4,155,251,0.4)" strokeWidth="0.5" />
          {/* Status indicator */}
          <circle cx="60" cy="72" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" />
        </g>

        {/* Primary Site label */}
        <text x="55" y="175" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit" fontWeight="600">Primary Site</text>

        {/* DR Site (right) */}
        <g transform="translate(210, 80)">
          {/* Building / Data center */}
          <rect x="0" y="15" width="70" height="65" rx="4" fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" strokeWidth="1.2" />
          {/* Roof */}
          <polygon points="35,0 -5,15 75,15" fill="rgba(139,92,246,0.12)" stroke="#8b5cf6" strokeWidth="1" />
          {/* Windows / server racks */}
          <rect x="10" y="25" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          <rect x="30" y="25" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          <rect x="50" y="25" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          <rect x="10" y="42" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          <rect x="30" y="42" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          <rect x="50" y="42" width="15" height="12" rx="2" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
          {/* Door */}
          <rect x="27" y="60" width="16" height="20" rx="2" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.5" />
          {/* Status indicator */}
          <circle cx="60" cy="72" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        </g>

        {/* DR Site label */}
        <text x="245" y="175" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit" fontWeight="600">DR Site</text>

        {/* Curved connection line between sites */}
        <path d="M95,120 C130,60 170,60 210,120" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1" />

        {/* Continuous replication — animated dashed flow (top arc) */}
        <path d="M95,115 C130,55 170,55 210,115" fill="none" stroke="rgba(4,155,251,0.4)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />

        {/* Reverse replication (bottom arc) */}
        <path d="M95,130 C130,190 170,190 210,130" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1s" }} />

        {/* Animated data particles along paths */}
        <circle r="2.5" fill="#049bfb" opacity="0.7">
          <animateMotion dur="3s" repeatCount="indefinite" path="M95,115 C130,55 170,55 210,115" />
        </circle>
        <circle r="2.5" fill="#8b5cf6" opacity="0.7">
          <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="M95,115 C130,55 170,55 210,115" />
        </circle>

        {/* Replication label */}
        <text x="150" y="68" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">CONTINUOUS REPLICATION</text>

        {/* Geographic distance indicator */}
        <g transform="translate(95, 195)">
          <line x1="0" y1="8" x2="110" y2="8" stroke="rgba(168,85,247,0.25)" strokeWidth="0.8" />
          {/* Left tick */}
          <line x1="0" y1="4" x2="0" y2="12" stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
          {/* Right tick */}
          <line x1="110" y1="4" x2="110" y2="12" stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
          {/* Distance arrows */}
          <polygon points="0,8 6,5 6,11" fill="rgba(168,85,247,0.3)" />
          <polygon points="110,8 104,5 104,11" fill="rgba(168,85,247,0.3)" />
          {/* Location pins */}
          <circle cx="0" cy="2" r="3" fill="rgba(4,155,251,0.4)" stroke="#049bfb" strokeWidth="0.5" />
          <circle cx="110" cy="2" r="3" fill="rgba(139,92,246,0.4)" stroke="#8b5cf6" strokeWidth="0.5" />
          {/* Distance label */}
          <text x="55" y="5" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">GEO-SEPARATED</text>
        </g>

        {/* RTO Badge */}
        <g transform="translate(55, 225)">
          <rect x="0" y="0" width="58" height="28" rx="6" fill="rgba(4,155,251,0.08)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.8" />
          <text x="29" y="12" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">RTO</text>
          <text x="29" y="23" textAnchor="middle" fill="#049bfb" fontSize="10" fontFamily="inherit" fontWeight="700">&lt; 15 min</text>
        </g>

        {/* RPO Badge */}
        <g transform="translate(185, 225)">
          <rect x="0" y="0" width="58" height="28" rx="6" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.25)" strokeWidth="0.8" />
          <text x="29" y="12" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">RPO</text>
          <text x="29" y="23" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="inherit" fontWeight="700">Near Zero</text>
        </g>

        {/* Protected badge */}
        <g transform="translate(115, 265)">
          <rect x="0" y="0" width="70" height="18" rx="9" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.8" />
          <circle cx="12" cy="9" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" />
          <text x="42" y="13" textAnchor="middle" className="fill-emerald-400" fontSize="7" fontFamily="inherit" fontWeight="600">PROTECTED</text>
        </g>
      </svg>
    </motion.div>
  );
}
