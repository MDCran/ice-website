"use client";

import { motion } from "motion/react";

export default function CloudMigrationHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Source system - old server/database on left */}
        <g transform="translate(25, 90)">
          {/* Old server box */}
          <rect x="0" y="0" width="70" height="90" rx="6" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />

          {/* Server unit 1 */}
          <rect x="8" y="8" width="54" height="16" rx="3" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />
          <rect x="14" y="13" width="18" height="3" rx="1" fill="rgba(139,92,246,0.25)" />
          <circle cx="52" cy="16" r="2" fill="rgba(139,92,246,0.4)" />

          {/* Server unit 2 */}
          <rect x="8" y="30" width="54" height="16" rx="3" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />
          <rect x="14" y="35" width="18" height="3" rx="1" fill="rgba(139,92,246,0.25)" />
          <circle cx="52" cy="38" r="2" fill="rgba(139,92,246,0.4)" />

          {/* Database cylinder */}
          <ellipse cx="35" cy="58" rx="20" ry="5" fill="rgba(4,116,188,0.06)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.8" />
          <path d="M15,58 L15,78 C15,83 55,83 55,78 L55,58" fill="rgba(4,116,188,0.04)" stroke="rgba(4,116,188,0.2)" strokeWidth="0.8" />
          <ellipse cx="35" cy="78" rx="20" ry="5" fill="none" stroke="rgba(4,116,188,0.15)" strokeWidth="0.5" />
        </g>

        {/* "Source" label */}
        <text x="60" y="82" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit" fontWeight="600">SOURCE</text>

        {/* Cloud destination on right */}
        <g transform="translate(195, 75)">
          <path
            d="M65,60 C76,60 85,52 85,42 C85,33 77,25 67,24 C68,10 56,0 42,0 C32,0 23,6 18,14 C15,12 11,11 7,11 C-2,11 -5,22 -5,32 C-5,43 2,60 12,60 Z"
            fill="rgba(4,155,251,0.07)"
            stroke="#049bfb"
            strokeWidth="1.2"
            opacity="0.6"
          />
          {/* Checkmark inside cloud */}
          <path d="M30,32 L38,40 L54,24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        </g>

        {/* "Target" label */}
        <text x="240" y="82" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit" fontWeight="600">TARGET</text>

        {/* Curved migration path */}
        <path
          d="M100,140 C140,100 180,100 220,115"
          fill="none"
          stroke="rgba(4,155,251,0.25)"
          strokeWidth="2"
          strokeDasharray="8 5"
          className="animate-[dash-flow_2s_linear_infinite]"
        />

        {/* Second curved path below */}
        <path
          d="M100,160 C140,190 180,180 220,145"
          fill="none"
          stroke="rgba(139,92,246,0.2)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Animated data packet dots along top path */}
        <circle r="4" fill="#049bfb" opacity="0.8">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M100,140 C140,100 180,100 220,115" />
        </circle>
        <circle r="3" fill="#0474bc" opacity="0.6">
          <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite" path="M100,140 C140,100 180,100 220,115" />
        </circle>
        <circle r="2.5" fill="#049bfb" opacity="0.5">
          <animateMotion dur="2.5s" begin="1.6s" repeatCount="indefinite" path="M100,140 C140,100 180,100 220,115" />
        </circle>

        {/* Animated data packet dots along bottom path */}
        <circle r="3" fill="#8b5cf6" opacity="0.6">
          <animateMotion dur="3s" repeatCount="indefinite" path="M100,160 C140,190 180,180 220,145" />
        </circle>
        <circle r="2.5" fill="#8b5cf6" opacity="0.4">
          <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="M100,160 C140,190 180,180 220,145" />
        </circle>

        {/* Arrow head at end of top path */}
        <polygon points="218,111 218,119 226,115" fill="#049bfb" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
        </polygon>

        {/* Progress indicator bar */}
        <g transform="translate(80, 220)">
          {/* Progress background */}
          <rect x="0" y="0" width="140" height="14" rx="7" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8" />
          {/* Progress fill */}
          <rect x="2" y="2" width="98" height="10" rx="5" fill="url(#migrationGrad)" opacity="0.7" />
          {/* Progress text */}
          <text x="70" y="10" textAnchor="middle" className="fill-slate-200" fontSize="7" fontFamily="inherit" fontWeight="bold">72%</text>
        </g>

        <defs>
          <linearGradient id="migrationGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#049bfb" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Migration label under progress */}
        <text x="150" y="250" textAnchor="middle" className="fill-slate-500" fontSize="8" fontFamily="inherit">MIGRATION IN PROGRESS</text>

        {/* Floating accent dots */}
        <circle cx="150" cy="60" r="2.5" fill="#049bfb" opacity="0.3" className="animate-pulse" />
        <circle cx="130" cy="210" r="2" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
        <circle cx="180" cy="200" r="2" fill="#0474bc" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1.2s" }} />

        {/* Bottom label */}
        <text x="150" y="280" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Cloud Migration Services</text>
      </svg>
    </motion.div>
  );
}
