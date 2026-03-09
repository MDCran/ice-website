"use client";

import { motion } from "motion/react";

export default function CloudHostingHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Cloud shape backdrop */}
        <path
          d="M230,195 C250,195 265,180 265,160 C265,142 252,128 235,126 C236,100 215,78 190,78 C172,78 156,88 148,104 C142,100 134,98 126,98 C104,98 86,114 84,136 C64,138 50,155 50,175 C50,196 66,195 86,195 Z"
          fill="rgba(4,155,251,0.05)"
          stroke="#049bfb"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Server rack inside cloud */}
        <g transform="translate(95, 110)">
          {/* Server unit 1 */}
          <rect x="0" y="0" width="90" height="22" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <rect x="8" y="6" width="24" height="3" rx="1" fill="rgba(139,92,246,0.3)" />
          <rect x="8" y="12" width="16" height="3" rx="1" fill="rgba(139,92,246,0.2)" />
          {/* Status LED 1 - green */}
          <circle cx="76" cy="11" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Server unit 2 */}
          <rect x="0" y="28" width="90" height="22" rx="4" fill="rgba(4,116,188,0.1)" stroke="rgba(4,116,188,0.3)" strokeWidth="1" />
          <rect x="8" y="34" width="24" height="3" rx="1" fill="rgba(4,116,188,0.3)" />
          <rect x="8" y="40" width="20" height="3" rx="1" fill="rgba(4,116,188,0.2)" />
          {/* Status LED 2 - green */}
          <circle cx="76" cy="39" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>

          {/* Server unit 3 */}
          <rect x="0" y="56" width="90" height="22" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <rect x="8" y="62" width="24" height="3" rx="1" fill="rgba(139,92,246,0.3)" />
          <rect x="8" y="68" width="18" height="3" rx="1" fill="rgba(139,92,246,0.2)" />
          {/* Status LED 3 - green */}
          <circle cx="76" cy="67" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Uptime gauge on the right side */}
        <g transform="translate(220, 120)">
          {/* Gauge background arc */}
          <path
            d="M0,50 A30,30 0 1,1 60,50"
            fill="none"
            stroke="rgba(168,85,247,0.15)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Gauge filled arc */}
          <path
            d="M0,50 A30,30 0 1,1 60,50"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="140"
            strokeDashoffset="1"
            opacity="0.8"
          />
          {/* Gauge center text */}
          <text x="30" y="40" textAnchor="middle" fill="#10b981" fontSize="9" fontFamily="inherit" fontWeight="bold">99.99%</text>
          <text x="30" y="52" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">UPTIME</text>
        </g>

        {/* Animated pulse rings around server rack */}
        <circle cx="140" cy="150" r="55" fill="none" stroke="rgba(4,155,251,0.08)" strokeWidth="1" className="animate-pulse" />
        <circle cx="140" cy="150" r="70" fill="none" stroke="rgba(4,155,251,0.05)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Network activity dots */}
        <circle cx="70" cy="130" r="3" fill="#049bfb" opacity="0.5" className="animate-pulse" />
        <circle cx="60" cy="170" r="2.5" fill="#0474bc" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
        <circle cx="240" cy="170" r="2.5" fill="#8b5cf6" opacity="0.4" className="animate-pulse" style={{ animationDelay: "1.2s" }} />

        {/* Bottom label */}
        <text x="150" y="260" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Managed Cloud Hosting</text>

        {/* Connection lines from cloud to bottom */}
        <line x1="120" y1="195" x2="100" y2="240" stroke="rgba(4,155,251,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <line x1="150" y1="195" x2="150" y2="240" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />
        <line x1="180" y1="195" x2="200" y2="240" stroke="rgba(4,155,251,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1s" }} />
      </svg>
    </motion.div>
  );
}
