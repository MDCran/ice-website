"use client";

import { motion } from "motion/react";

export default function PrivateCloudHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Dashed border perimeter / fence */}
        <rect
          x="40"
          y="40"
          width="220"
          height="200"
          rx="16"
          fill="rgba(139,92,246,0.03)"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="1.5"
          strokeDasharray="8 4"
        />

        {/* Shield / isolation walls - left side */}
        <rect x="40" y="70" width="6" height="140" rx="3" fill="rgba(4,155,251,0.15)" />
        <rect x="50" y="80" width="3" height="120" rx="1.5" fill="rgba(4,155,251,0.08)" />

        {/* Shield / isolation walls - right side */}
        <rect x="254" y="70" width="6" height="140" rx="3" fill="rgba(4,155,251,0.15)" />
        <rect x="247" y="80" width="3" height="120" rx="1.5" fill="rgba(4,155,251,0.08)" />

        {/* Perimeter corner shields */}
        <circle cx="40" cy="40" r="6" fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />
        <circle cx="260" cy="40" r="6" fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />
        <circle cx="40" cy="240" r="6" fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />
        <circle cx="260" cy="240" r="6" fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />

        {/* Isolated cloud environment inside */}
        <path
          d="M200,155 C212,155 222,145 222,133 C222,122 213,113 202,112 C203,94 188,78 170,78 C157,78 146,86 140,97 C136,94 130,92 124,92 C108,92 96,104 94,120 C80,122 70,134 70,148 C70,163 82,155 96,155 Z"
          fill="rgba(4,155,251,0.06)"
          stroke="#049bfb"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Dedicated server inside cloud */}
        <g transform="translate(115, 115)">
          <rect x="0" y="0" width="70" height="50" rx="6" fill="rgba(4,116,188,0.1)" stroke="rgba(4,116,188,0.4)" strokeWidth="1.2" />
          {/* Server details */}
          <rect x="8" y="8" width="30" height="3" rx="1" fill="rgba(4,155,251,0.4)" />
          <rect x="8" y="15" width="22" height="3" rx="1" fill="rgba(4,155,251,0.25)" />
          <rect x="8" y="22" width="26" height="3" rx="1" fill="rgba(4,155,251,0.3)" />
          {/* Status LEDs */}
          <circle cx="55" cy="11" r="2.5" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="55" cy="20" r="2.5" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          {/* Server base */}
          <rect x="5" y="32" width="60" height="12" rx="3" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
          <rect x="10" y="36" width="8" height="4" rx="1" fill="rgba(139,92,246,0.2)" />
          <rect x="22" y="36" width="8" height="4" rx="1" fill="rgba(139,92,246,0.2)" />
        </g>

        {/* Lock icon above server */}
        <g transform="translate(138, 85)">
          <rect x="0" y="10" width="24" height="18" rx="4" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.2" />
          <path d="M5,10 L5,5 C5,0 19,0 19,5 L19,10" fill="none" stroke="#8b5cf6" strokeWidth="1.2" />
          <circle cx="12" cy="20" r="2.5" fill="#8b5cf6" opacity="0.7" />
          <line x1="12" y1="22" x2="12" y2="25" stroke="#8b5cf6" strokeWidth="1" opacity="0.7" />
        </g>

        {/* Pulsing security rings */}
        <circle cx="150" cy="140" r="65" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="1" className="animate-pulse" />
        <circle cx="150" cy="140" r="80" fill="none" stroke="rgba(139,92,246,0.05)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* "PRIVATE" label at top */}
        <text x="150" y="58" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit" fontWeight="600" letterSpacing="3">PRIVATE</text>

        {/* "Single Tenant" label at bottom */}
        <text x="150" y="225" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Single Tenant</text>

        {/* Floating security nodes */}
        <circle cx="80" cy="75" r="3" fill="#8b5cf6" opacity="0.4" className="animate-pulse" />
        <circle cx="220" cy="75" r="3" fill="#049bfb" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
        <circle cx="80" cy="210" r="3" fill="#049bfb" opacity="0.4" className="animate-pulse" style={{ animationDelay: "1.2s" }} />
        <circle cx="220" cy="210" r="3" fill="#8b5cf6" opacity="0.4" className="animate-pulse" style={{ animationDelay: "1.8s" }} />

        {/* Bottom text */}
        <text x="150" y="270" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Managed Private Cloud</text>
      </svg>
    </motion.div>
  );
}
