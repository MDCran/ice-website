"use client";

import { motion } from "motion/react";

export default function SecurityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Radar circles */}
        <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="30" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />

        {/* Cross hairs */}
        <line x1="150" y1="30" x2="150" y2="270" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />
        <line x1="30" y1="150" x2="270" y2="150" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />

        {/* Radar sweep */}
        <g style={{ transformOrigin: "150px 150px", animation: "radar-sweep 3s linear infinite" }}>
          <line x1="150" y1="150" x2="150" y2="30" stroke="#049bfb" strokeWidth="1" opacity="0.7" />
          <path d="M 150 150 L 150 30 A 120 120 0 0 1 254 85 Z" fill="url(#secRadarGrad)" opacity="0.12" />
        </g>

        <defs>
          <linearGradient id="secRadarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#049bfb" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#049bfb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Threat detection nodes - green (safe) */}
        <circle cx="100" cy="90" r="4" fill="#10b981" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="110" r="4" fill="#10b981" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="200" r="4" fill="#10b981" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="2s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="190" cy="180" r="4" fill="#10b981" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="2s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="160" cy="100" r="4" fill="#10b981" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>

        {/* Center dot */}
        <circle cx="150" cy="150" r="5" fill="#049bfb" opacity="0.8" />
        <circle cx="150" cy="150" r="8" fill="none" stroke="#049bfb" strokeWidth="1" opacity="0.3" className="animate-pulse" />
      </svg>
    </motion.div>
  );
}
