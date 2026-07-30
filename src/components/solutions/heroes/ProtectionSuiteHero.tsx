"use client";

import { motion } from "motion/react";

export default function ProtectionSuiteHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <linearGradient id="protShieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#049bfb" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer ring - Web */}
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(4,155,251,0.15)" strokeWidth="18" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(4,155,251,0.08)" strokeWidth="18" strokeDasharray="6 4" />
        <text x="150" y="12" textAnchor="middle" fontSize="8" fill="rgba(4,155,251,0.6)" fontFamily="inherit" fontWeight="500">Web</text>

        {/* Second ring - Email */}
        <circle cx="150" cy="150" r="105" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="16" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="105" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="16" strokeDasharray="5 4" />
        <text x="256" y="150" textAnchor="start" fontSize="8" fill="rgba(99,102,241,0.6)" fontFamily="inherit" fontWeight="500">Email</text>

        {/* Third ring - Network */}
        <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth="14" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="14" strokeDasharray="4 3" />
        <text x="150" y="238" textAnchor="middle" fontSize="8" fill="rgba(139,92,246,0.6)" fontFamily="inherit" fontWeight="500">Network</text>

        {/* Inner ring - Endpoint */}
        <circle cx="150" cy="150" r="55" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="12" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="55" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="12" strokeDasharray="3 3" />
        <text x="40" y="150" textAnchor="end" fontSize="8" fill="rgba(168,85,247,0.6)" fontFamily="inherit" fontWeight="500">Endpoint</text>

        {/* Center shield with checkmark */}
        <circle cx="150" cy="150" r="30" fill="rgba(4,155,251,0.06)" stroke="rgba(4,155,251,0.25)" strokeWidth="1" />

        {/* Shield shape */}
        <g transform="translate(135, 130)">
          <path d="M15,2 L2,9 L2,20 C2,30 7,36 15,39 C23,36 28,30 28,20 L28,9 Z"
            fill="url(#protShieldGrad)" stroke="#049bfb" strokeWidth="1" />
          {/* Checkmark inside shield */}
          <path d="M9,20 L13,24 L22,14" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </g>

        {/* Status glow at center */}
        <circle cx="150" cy="150" r="34" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" className="animate-pulse" />

        {/* Accent nodes on each ring */}
        <circle cx="150" cy="20" r="3" fill="#049bfb" opacity="0.6" className="animate-pulse" />
        <circle cx="255" cy="150" r="3" fill="#049bfb" opacity="0.5" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="150" cy="230" r="3" fill="#8b5cf6" opacity="0.5" className="animate-pulse" style={{ animationDelay: "1s" }} />
        <circle cx="45" cy="150" r="3" fill="#8b5cf6" opacity="0.5" className="animate-pulse" style={{ animationDelay: "1.5s" }} />

        {/* Ring segment highlights rotating */}
        <circle cx="150" cy="150" r="130" fill="none" stroke="#049bfb" strokeWidth="2" strokeDasharray="20 798" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" values="0 150 150;360 150 150" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="80" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="15 488" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" values="360 150 150;0 150 150" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
}
