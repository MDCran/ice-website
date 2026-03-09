"use client";

import { motion } from "motion/react";

export default function IBMPowerVSHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <linearGradient id="ibmCloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#049bfb" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0474bc" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="ibmServerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
            <stop offset="100%" stopColor="rgba(4,116,188,0.1)" />
          </linearGradient>
        </defs>

        {/* Cloud shape - large backdrop */}
        <path
          d="M240,200 C262,200 278,182 278,160 C278,140 264,124 245,122 C247,92 222,68 192,68 C172,68 154,80 144,98 C137,93 128,90 118,90 C92,90 72,110 70,136 C48,138 32,158 32,180 C32,204 50,200 74,200 Z"
          fill="url(#ibmCloudGrad)"
          stroke="#049bfb"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Inner cloud glow */}
        <path
          d="M240,200 C262,200 278,182 278,160 C278,140 264,124 245,122 C247,92 222,68 192,68 C172,68 154,80 144,98 C137,93 128,90 118,90 C92,90 72,110 70,136 C48,138 32,158 32,180 C32,204 50,200 74,200 Z"
          fill="none"
          stroke="rgba(4,155,251,0.15)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          className="animate-[dash-flow_2s_linear_infinite]"
        />

        {/* "Power VS" label at top of cloud */}
        <rect x="115" y="55" width="80" height="22" rx="5" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="1" />
        <text x="155" y="70" textAnchor="middle" fill="#049bfb" fontSize="11" fontFamily="inherit" fontWeight="bold">Power VS</text>

        {/* === IBM Power Server Unit === */}
        <g transform="translate(95, 95)">
          {/* Server chassis */}
          <rect x="0" y="0" width="110" height="90" rx="6" fill="url(#ibmServerGrad)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.2" />

          {/* Server face details - horizontal drive bays */}
          <rect x="8" y="8" width="70" height="10" rx="2" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
          <rect x="8" y="22" width="70" height="10" rx="2" fill="rgba(4,116,188,0.12)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />
          <rect x="8" y="36" width="70" height="10" rx="2" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />

          {/* Drive activity indicators */}
          <rect x="12" y="11" width="14" height="4" rx="1" fill="rgba(139,92,246,0.3)" />
          <rect x="12" y="25" width="18" height="4" rx="1" fill="rgba(4,116,188,0.3)" />
          <rect x="12" y="39" width="12" height="4" rx="1" fill="rgba(139,92,246,0.3)" />

          {/* Status LEDs column */}
          <circle cx="92" cy="13" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="92" cy="27" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="92" cy="41" r="3" fill="#049bfb" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
          </circle>

          {/* IBM logo area */}
          <rect x="8" y="54" width="94" height="28" rx="4" fill="rgba(4,116,188,0.06)" stroke="rgba(4,116,188,0.15)" strokeWidth="0.5" />
          <text x="55" y="72" textAnchor="middle" fill="#0474bc" fontSize="11" fontFamily="inherit" fontWeight="bold" opacity="0.7">IBM POWER</text>

          {/* Power button */}
          <circle cx="92" cy="68" r="5" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
          <line x1="92" y1="64" x2="92" y2="67" stroke="#10b981" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Virtual Server indicator */}
        <rect x="100" y="195" width="100" height="18" rx="4" fill="rgba(4,155,251,0.08)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.8" />
        <circle cx="114" cy="204" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" />
        <text x="155" y="208" textAnchor="middle" fill="#049bfb" fontSize="8" fontFamily="inherit" fontWeight="bold">Virtual Server</text>

        {/* IBM i badge - left side */}
        <rect x="30" y="130" width="50" height="22" rx="5" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
        <text x="55" y="144" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontFamily="inherit" fontWeight="bold">IBM i</text>
        {/* Connection line from badge to server */}
        <line x1="80" y1="141" x2="95" y2="141" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="3 2" className="animate-[dash-flow_2s_linear_infinite]" />

        {/* AIX badge - right side */}
        <rect x="220" y="130" width="50" height="22" rx="5" fill="rgba(4,116,188,0.1)" stroke="rgba(4,116,188,0.3)" strokeWidth="0.8" />
        <text x="245" y="144" textAnchor="middle" fill="#0474bc" fontSize="9" fontFamily="inherit" fontWeight="bold">AIX</text>
        {/* Connection line from badge to server */}
        <line x1="220" y1="141" x2="205" y2="141" stroke="rgba(4,116,188,0.3)" strokeWidth="1" strokeDasharray="3 2" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />

        {/* Network connection lines from cloud to outside */}
        <line x1="80" y1="200" x2="50" y2="240" stroke="rgba(4,155,251,0.12)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.3s" }} />
        <line x1="150" y1="210" x2="150" y2="250" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.8s" }} />
        <line x1="220" y1="200" x2="250" y2="240" stroke="rgba(4,155,251,0.12)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1.3s" }} />

        {/* Floating data nodes */}
        <circle cx="60" cy="110" r="2.5" fill="#049bfb" opacity="0.4" className="animate-pulse" />
        <circle cx="245" cy="100" r="2.5" fill="#0474bc" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
        <circle cx="180" cy="80" r="2" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1.2s" }} />
        <circle cx="100" cy="80" r="2" fill="#049bfb" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1.6s" }} />

        {/* Bottom endpoints */}
        <circle cx="50" cy="245" r="3" fill="rgba(4,155,251,0.2)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />
        <circle cx="150" cy="255" r="3" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
        <circle cx="250" cy="245" r="3" fill="rgba(4,155,251,0.2)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.5" />

        {/* Bottom label */}
        <text x="150" y="280" textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="inherit">IBM Power Virtual Server</text>

        {/* Pulsing rings around server */}
        <rect x="90" y="90" width="120" height="100" rx="10" fill="none" stroke="rgba(4,155,251,0.06)" strokeWidth="1" className="animate-pulse" />
        <rect x="83" y="83" width="134" height="114" rx="14" fill="none" stroke="rgba(4,155,251,0.03)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
      </svg>
    </motion.div>
  );
}
