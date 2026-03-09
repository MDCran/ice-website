"use client";

import { motion } from "motion/react";

export default function DataProtectionHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Pulsing rings */}
        <circle cx="150" cy="140" r="100" fill="none" stroke="rgba(168,85,247,0.06)" strokeWidth="1" />
        <circle cx="150" cy="140" r="80" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="1" className="animate-pulse" />
        <circle cx="150" cy="140" r="60" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Shield */}
        <g transform="translate(120, 100)">
          <path d="M30,5 L5,18 L5,40 C5,58 15,72 30,78 C45,72 55,58 55,40 L55,18 Z"
            fill="rgba(168,85,247,0.1)" stroke="#049bfb" strokeWidth="1.5" />
          {/* Lock icon inside shield */}
          <rect x="20" y="35" width="20" height="15" rx="3" fill="none" stroke="#049bfb" strokeWidth="1.2" opacity="0.8" />
          <path d="M25,35 L25,28 C25,24,35,24,35,28 L35,35" fill="none" stroke="#049bfb" strokeWidth="1.2" opacity="0.8" />
          <circle cx="30" cy="42" r="2" fill="#049bfb" opacity="0.8" />
        </g>

        {/* Data vault bars */}
        <rect x="60" y="240" width="30" height="20" rx="3" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />
        <rect x="100" y="235" width="30" height="25" rx="3" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
        <rect x="140" y="230" width="30" height="30" rx="3" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
        <rect x="180" y="238" width="30" height="22" rx="3" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
        <rect x="220" y="243" width="30" height="17" rx="3" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />

        {/* Connection lines from shield to vault */}
        <line x1="150" y1="178" x2="75" y2="240" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_3s_linear_infinite]" />
        <line x1="150" y1="178" x2="150" y2="230" stroke="rgba(99,102,241,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_3s_linear_infinite]" style={{ animationDelay: "0.5s" }} />
        <line x1="150" y1="178" x2="235" y2="243" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_3s_linear_infinite]" style={{ animationDelay: "1s" }} />
      </svg>
    </motion.div>
  );
}
