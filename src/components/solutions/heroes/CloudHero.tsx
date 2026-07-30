"use client";

import { motion } from "motion/react";

export default function CloudHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Bottom layer - On-premises */}
        <rect x="60" y="220" width="180" height="40" rx="8" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.2)" strokeWidth="1" />
        <text x="150" y="244" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">On-Premises</text>

        {/* Middle layer - Hybrid */}
        <rect x="40" y="150" width="220" height="40" rx="8" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <text x="150" y="174" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Hybrid Layer</text>

        {/* Top layer - Cloud */}
        <rect x="20" y="80" width="260" height="40" rx="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        <text x="150" y="104" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Cloud Services</text>

        {/* Cloud icon */}
        <g transform="translate(125, 30)">
          <path d="M42,25c2.8,0,5-2.2,5-5c0-2.8-2.2-5-5-5c-0.3-4.4-4-8-8.5-8c-3.5,0-6.4,2-7.7,5C23,11.6,20,14.4,20,18c0,3.9,3.1,7,7,7H42z"
            fill="none" stroke="#049bfb" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* Animated connection lines */}
        <line x1="150" y1="120" x2="150" y2="150" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <line x1="150" y1="190" x2="150" y2="220" stroke="rgba(99,102,241,0.3)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />

        {/* Floating data nodes */}
        <circle cx="80" cy="60" r="4" fill="#049bfb" opacity="0.5" className="animate-pulse" />
        <circle cx="220" cy="60" r="4" fill="#0474bc" opacity="0.5" className="animate-pulse" style={{ animationDelay: "1s" }} />
        <circle cx="100" cy="130" r="3" fill="#8b5cf6" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="200" cy="200" r="3" fill="#049bfb" opacity="0.4" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
      </svg>
    </motion.div>
  );
}
