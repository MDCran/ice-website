"use client";

import { motion } from "motion/react";

export default function RansomwareRecoveryHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background pulsing rings */}
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(168,85,247,0.04)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="0.5" className="animate-pulse" />

        {/* Main System (left side) */}
        <g transform="translate(15, 75)">
          <rect x="0" y="0" width="75" height="85" rx="5" fill="rgba(4,155,251,0.08)" stroke="#049bfb" strokeWidth="1.2" />
          {/* Server rack lines */}
          <rect x="8" y="10" width="59" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" />
          <rect x="8" y="22" width="59" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" />
          <rect x="8" y="34" width="59" height="8" rx="2" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" />
          {/* Status LEDs */}
          <circle cx="15" cy="52" r="2" fill="#049bfb" opacity="0.6" />
          <circle cx="23" cy="52" r="2" fill="#10b981" opacity="0.7" className="animate-pulse" />
          {/* Network icon */}
          <circle cx="37" cy="67" r="6" fill="none" stroke="rgba(4,155,251,0.3)" strokeWidth="0.8" />
          <circle cx="37" cy="67" r="2" fill="#049bfb" opacity="0.4" />
          {/* Label */}
          <text x="37" y="82" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">SYSTEM</text>
        </g>

        {/* Connection line from system toward vault — with AIR GAP break */}
        {/* Line segment 1: from system */}
        <line x1="95" y1="120" x2="120" y2="120" stroke="rgba(4,155,251,0.3)" strokeWidth="1.2" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />

        {/* AIR GAP — visible break */}
        <g transform="translate(120, 108)">
          {/* Gap indicators — zigzag/break marks */}
          <line x1="0" y1="8" x2="5" y2="16" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
          <line x1="5" y1="16" x2="10" y2="8" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
          <line x1="10" y1="8" x2="15" y2="16" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
          <line x1="15" y1="16" x2="20" y2="8" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
          {/* Gap label */}
          <text x="10" y="4" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="inherit">AIR GAP</text>
        </g>

        {/* Line segment 2: to vault (after gap) */}
        <line x1="140" y1="120" x2="160" y2="120" stroke="rgba(139,92,246,0.3)" strokeWidth="1.2" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />

        {/* Broken chain / ransomware blocked icon */}
        <g transform="translate(105, 180)">
          {/* Left chain link */}
          <ellipse cx="10" cy="10" rx="10" ry="7" fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
          {/* Right chain link — offset and broken away */}
          <ellipse cx="35" cy="10" rx="10" ry="7" fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
          {/* Break marks */}
          <line x1="18" y1="7" x2="23" y2="5" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
          <line x1="18" y1="13" x2="23" y2="15" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
          {/* X mark over the chain = blocked */}
          <line x1="19" y1="4" x2="26" y2="16" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
          <line x1="26" y1="4" x2="19" y2="16" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
          {/* Label */}
          <text x="22" y="28" textAnchor="middle" className="fill-red-400/60" fontSize="6" fontFamily="inherit">BLOCKED</text>
        </g>

        {/* Air-gapped Vault — thick bordered box */}
        <g transform="translate(155, 55)">
          {/* Outer thick vault border */}
          <rect x="0" y="0" width="120" height="130" rx="8" fill="rgba(139,92,246,0.04)" stroke="#8b5cf6" strokeWidth="2.5" />
          {/* Inner border for vault depth */}
          <rect x="6" y="6" width="108" height="118" rx="5" fill="rgba(139,92,246,0.03)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />

          {/* Immutable backup copies — stacked layers */}
          {/* Layer 4 (back) */}
          <rect x="18" y="22" width="80" height="14" rx="3" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
          {/* Layer 3 */}
          <rect x="16" y="32" width="80" height="14" rx="3" fill="rgba(4,116,188,0.08)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />
          {/* Layer 2 */}
          <rect x="14" y="42" width="80" height="14" rx="3" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.5" />
          {/* Layer 1 (front) */}
          <rect x="12" y="52" width="80" height="14" rx="3" fill="rgba(4,155,251,0.15)" stroke="#049bfb" strokeWidth="0.8" />

          {/* Lock icon on each layer */}
          <g transform="translate(75, 54)">
            <rect x="0" y="3" width="8" height="6" rx="1.5" fill="none" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />
            <path d="M1.5,3 L1.5,1 C1.5,-0.5,6.5,-0.5,6.5,1 L6.5,3" fill="none" stroke="#049bfb" strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* Immutable label */}
          <text x="60" y="80" textAnchor="middle" className="fill-slate-500" fontSize="7" fontFamily="inherit">IMMUTABLE COPIES</text>

          {/* Vault lock */}
          <g transform="translate(40, 88)">
            <rect x="0" y="6" width="18" height="14" rx="3" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
            <path d="M3,6 L3,1 C3,-2,15,-2,15,1 L15,6" fill="none" stroke="#10b981" strokeWidth="1" />
            <circle cx="9" cy="13" r="2" fill="#10b981" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Vault label */}
          <text x="60" y="118" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit" fontWeight="600">VAULT</text>
        </g>

        {/* Clean Room recovery zone */}
        <g transform="translate(15, 210)">
          <rect x="0" y="0" width="110" height="55" rx="6" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="5 3" />
          {/* Clean room label */}
          <text x="55" y="14" textAnchor="middle" className="fill-emerald-400" fontSize="8" fontFamily="inherit" fontWeight="600">CLEAN ROOM</text>
          {/* Recovery elements inside */}
          <rect x="10" y="22" width="35" height="20" rx="3" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
          <text x="27" y="35" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="inherit">Validate</text>
          <rect x="55" y="22" width="45" height="20" rx="3" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
          <text x="77" y="35" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="inherit">Restore</text>
          {/* Arrow between validate and restore */}
          <line x1="47" y1="32" x2="53" y2="32" stroke="rgba(16,185,129,0.4)" strokeWidth="0.8" />
          <polygon points="53,30 56,32 53,34" fill="rgba(16,185,129,0.4)" />
          {/* Status */}
          <circle cx="100" cy="10" r="2.5" fill="#10b981" opacity="0.7" className="animate-pulse" />
        </g>

        {/* Arrow from vault to clean room */}
        <path d="M200,185 C190,200 150,215 130,225" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1s" }} />
        <polygon points="130,222 126,228 133,228" fill="rgba(16,185,129,0.4)" />

        {/* Recovery arrow label */}
        <text x="175" y="210" textAnchor="middle" className="fill-slate-500" fontSize="6" fontFamily="inherit">RECOVER</text>

        {/* Protected status badge */}
        <g transform="translate(165, 260)">
          <rect x="0" y="0" width="100" height="18" rx="9" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.8" />
          <circle cx="12" cy="9" r="2.5" fill="#10b981" opacity="0.8" className="animate-pulse" />
          <text x="56" y="13" textAnchor="middle" className="fill-emerald-400" fontSize="7" fontFamily="inherit" fontWeight="600">RANSOMWARE-PROOF</text>
        </g>
      </svg>
    </motion.div>
  );
}
