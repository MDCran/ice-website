"use client";

import { motion } from "motion/react";

export default function HighAvailabilityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background pulsing rings */}
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(168,85,247,0.05)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="0.5" className="animate-pulse" />

        {/* Primary Server (left) */}
        <g transform="translate(30, 90)">
          {/* Server chassis */}
          <rect x="0" y="0" width="80" height="100" rx="6" fill="rgba(139,92,246,0.08)" stroke="#0474bc" strokeWidth="1.2" />
          {/* Drive bays */}
          <rect x="10" y="12" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="10" y="24" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="10" y="36" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          {/* Status LEDs */}
          <circle cx="18" cy="55" r="2.5" fill="#10b981" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="55" r="2.5" fill="#049bfb" opacity="0.6" />
          {/* Ventilation */}
          <line x1="10" y1="65" x2="70" y2="65" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="70" x2="70" y2="70" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="75" x2="70" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          {/* Green status dot */}
          <circle cx="62" cy="55" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" />
        </g>

        {/* Primary label */}
        <text x="70" y="210" textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="inherit" fontWeight="600">Primary</text>

        {/* Standby Server (right) */}
        <g transform="translate(190, 90)">
          {/* Server chassis */}
          <rect x="0" y="0" width="80" height="100" rx="6" fill="rgba(139,92,246,0.08)" stroke="#0474bc" strokeWidth="1.2" />
          {/* Drive bays */}
          <rect x="10" y="12" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="10" y="24" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          <rect x="10" y="36" width="60" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
          {/* Status LEDs */}
          <circle cx="18" cy="55" r="2.5" fill="#10b981" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="55" r="2.5" fill="#049bfb" opacity="0.6" />
          {/* Ventilation */}
          <line x1="10" y1="65" x2="70" y2="65" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="70" x2="70" y2="70" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="75" x2="70" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          {/* Green status dot */}
          <circle cx="62" cy="55" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        </g>

        {/* Standby label */}
        <text x="230" y="210" textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="inherit" fontWeight="600">Standby</text>

        {/* Bidirectional sync arrows — top arrow (left to right) */}
        <line x1="115" y1="120" x2="185" y2="120" stroke="rgba(4,155,251,0.4)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <polygon points="185,117 192,120 185,123" fill="#049bfb" opacity="0.6" />

        {/* Bottom arrow (right to left) */}
        <line x1="185" y1="140" x2="115" y2="140" stroke="rgba(139,92,246,0.4)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1s" }} />
        <polygon points="115,137 108,140 115,143" fill="#8b5cf6" opacity="0.6" />

        {/* Sync label */}
        <text x="150" y="115" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">SYNC</text>

        {/* Heartbeat line animation */}
        <g transform="translate(115, 155)">
          <polyline
            points="0,10 8,10 12,0 16,20 20,5 24,15 28,10 70,10"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.2"
            opacity="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
          </polyline>
        </g>

        {/* Failover switch indicator */}
        <g transform="translate(135, 60)">
          <rect x="0" y="0" width="30" height="18" rx="9" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
          {/* Toggle dot — positioned to the right = Active */}
          <circle cx="21" cy="9" r="6" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
        <text x="150" y="55" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">AUTO-FAILOVER</text>

        {/* Uptime badge */}
        <g transform="translate(110, 230)">
          <rect x="0" y="0" width="80" height="20" rx="10" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.8" />
          <circle cx="14" cy="10" r="3" fill="#10b981" opacity="0.8" className="animate-pulse" />
          <text x="44" y="14" textAnchor="middle" className="fill-emerald-400" fontSize="8" fontFamily="inherit" fontWeight="600">99.999%</text>
        </g>

        {/* Connection glow accents */}
        <circle cx="110" cy="130" r="3" fill="#049bfb" opacity="0.3" className="animate-pulse" />
        <circle cx="190" cy="130" r="3" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
      </svg>
    </motion.div>
  );
}
