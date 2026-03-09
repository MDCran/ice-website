"use client";

import { motion } from "motion/react";

export default function ThreatDetectionHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <radialGradient id="tdScanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#049bfb" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#049bfb" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tdLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#049bfb" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* ML scan lines radiating outward */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={`scan${i}`}
            x1="150"
            y1="150"
            x2={150 + 140 * Math.cos((angle * Math.PI) / 180)}
            y2={150 + 140 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(139,92,246,0.06)"
            strokeWidth="0.5"
            strokeDasharray="4 6"
          />
        ))}

        {/* Scan pulse rings */}
        <circle cx="150" cy="150" r="40" fill="none" stroke="rgba(4,155,251,0.08)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="70" fill="none" stroke="rgba(4,155,251,0.06)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(139,92,246,0.05)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(139,92,246,0.04)" strokeWidth="0.5" />

        {/* Expanding scan pulse */}
        <circle cx="150" cy="150" r="20" fill="none" stroke="#049bfb" strokeWidth="1" opacity="0">
          <animate attributeName="r" values="20;130" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="20" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0">
          <animate attributeName="r" values="20;130" dur="3s" begin="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Neural network nodes - central cluster */}
        {/* Center node */}
        <circle cx="150" cy="150" r="6" fill="rgba(4,155,251,0.2)" stroke="#049bfb" strokeWidth="1" opacity="0.8">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Inner ring nodes */}
        <circle cx="120" cy="125" r="4" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="125" r="4" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="175" r="4" fill="rgba(4,155,251,0.2)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="175" r="4" fill="rgba(4,155,251,0.2)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="110" r="4" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="190" r="4" fill="rgba(4,155,251,0.2)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="1s" repeatCount="indefinite" />
        </circle>

        {/* Outer ring nodes */}
        <circle cx="90" cy="100" r="3" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" />
        <circle cx="210" cy="100" r="3" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
        <circle cx="210" cy="200" r="3" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
        <circle cx="90" cy="200" r="3" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.9s" }} />
        <circle cx="150" cy="80" r="3" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
        <circle cx="150" cy="220" r="3" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
        <circle cx="80" cy="150" r="3" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="220" cy="150" r="3" fill="rgba(4,155,251,0.15)" stroke="rgba(4,155,251,0.4)" strokeWidth="0.5" opacity="0.6" className="animate-pulse" style={{ animationDelay: "1.1s" }} />

        {/* Neural connections - center to inner ring */}
        <line x1="150" y1="150" x2="120" y2="125" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <line x1="150" y1="150" x2="180" y2="125" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.3s" }} />
        <line x1="150" y1="150" x2="180" y2="175" stroke="rgba(4,155,251,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.6s" }} />
        <line x1="150" y1="150" x2="120" y2="175" stroke="rgba(4,155,251,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.9s" }} />
        <line x1="150" y1="150" x2="150" y2="110" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.2s" }} />
        <line x1="150" y1="150" x2="150" y2="190" stroke="rgba(4,155,251,0.2)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.8s" }} />

        {/* Inner to outer ring connections */}
        <line x1="120" y1="125" x2="90" y2="100" stroke="rgba(168,85,247,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="180" y1="125" x2="210" y2="100" stroke="rgba(168,85,247,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="180" y1="175" x2="210" y2="200" stroke="rgba(4,155,251,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="120" y1="175" x2="90" y2="200" stroke="rgba(4,155,251,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="150" y1="110" x2="150" y2="80" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="150" y1="190" x2="150" y2="220" stroke="rgba(4,155,251,0.12)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="120" y1="125" x2="80" y2="150" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="180" y1="125" x2="220" y2="150" stroke="rgba(4,155,251,0.1)" strokeWidth="0.5" strokeDasharray="2 3" />

        {/* Cross connections between inner nodes */}
        <line x1="120" y1="125" x2="180" y2="175" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
        <line x1="180" y1="125" x2="120" y2="175" stroke="rgba(4,155,251,0.06)" strokeWidth="0.3" />
        <line x1="150" y1="110" x2="180" y2="175" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
        <line x1="150" y1="190" x2="120" y2="125" stroke="rgba(4,155,251,0.06)" strokeWidth="0.3" />

        {/* Threat scan node (red pulsing) */}
        <circle cx="195" cy="108" r="3" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="0.8">
          <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Magnifying glass over network */}
        <g transform="translate(185, 60)" opacity="0.7">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#049bfb" strokeWidth="1.5" opacity="0.5" />
          <circle cx="20" cy="20" r="18" fill="rgba(4,155,251,0.03)" />
          <line x1="33" y1="33" x2="45" y2="45" stroke="#049bfb" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* Lens highlight */}
          <path d="M10,12 Q15,8 25,12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </g>

        {/* ML-Driven label */}
        <text x="150" y="265" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(139,92,246,0.4)" letterSpacing="2">ML-DRIVEN ANALYSIS</text>

        {/* Small data flow particles */}
        <circle cx="0" cy="0" r="1.5" fill="#049bfb" opacity="0.6">
          <animateMotion path="M150,150 L120,125 L90,100" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="1.5" fill="#8b5cf6" opacity="0.6">
          <animateMotion path="M150,150 L180,125 L210,100" dur="2s" begin="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="1.5" fill="#049bfb" opacity="0.6">
          <animateMotion path="M150,150 L150,190 L150,220" dur="2s" begin="1.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin="1.3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
}
