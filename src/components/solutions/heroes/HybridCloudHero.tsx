"use client";

import { motion } from "motion/react";

export default function HybridCloudHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Left side - On-Prem environment */}
        <rect x="20" y="80" width="100" height="130" rx="10" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />

        {/* On-Prem label */}
        <text x="70" y="100" textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="inherit" fontWeight="600">On-Prem</text>

        {/* On-Prem server icon */}
        <g transform="translate(40, 110)">
          {/* Server box */}
          <rect x="0" y="0" width="60" height="20" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <rect x="6" y="5" width="20" height="3" rx="1" fill="rgba(139,92,246,0.3)" />
          <rect x="6" y="11" width="14" height="3" rx="1" fill="rgba(139,92,246,0.2)" />
          <circle cx="50" cy="10" r="2.5" fill="#10b981" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Server box 2 */}
          <rect x="0" y="26" width="60" height="20" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <rect x="6" y="31" width="20" height="3" rx="1" fill="rgba(139,92,246,0.3)" />
          <rect x="6" y="37" width="16" height="3" rx="1" fill="rgba(139,92,246,0.2)" />
          <circle cx="50" cy="36" r="2.5" fill="#10b981" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>

          {/* Database icon */}
          <ellipse cx="30" cy="62" rx="18" ry="6" fill="rgba(4,116,188,0.08)" stroke="rgba(4,116,188,0.3)" strokeWidth="0.8" />
          <path d="M12,62 L12,76 C12,80 48,80 48,76 L48,62" fill="rgba(4,116,188,0.05)" stroke="rgba(4,116,188,0.3)" strokeWidth="0.8" />
          <ellipse cx="30" cy="76" rx="18" ry="6" fill="none" stroke="rgba(4,116,188,0.2)" strokeWidth="0.5" />
        </g>

        {/* Right side - Cloud environment */}
        <circle cx="220" cy="145" r="65" fill="rgba(4,155,251,0.04)" stroke="rgba(4,155,251,0.2)" strokeWidth="1" />

        {/* Cloud label */}
        <text x="220" y="100" textAnchor="middle" className="fill-slate-400" fontSize="9" fontFamily="inherit" fontWeight="600">Cloud</text>

        {/* Cloud icon inside circle */}
        <g transform="translate(190, 110)">
          <path
            d="M50,38 C56,38 62,33 62,27 C62,21 57,16 51,16 C51,8 43,2 34,2 C27,2 21,6 18,12 C16,11 13,10 10,10 C4,10 0,15 0,22 C0,29 5,38 10,38 Z"
            fill="rgba(4,155,251,0.08)"
            stroke="#049bfb"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* Cloud server nodes */}
        <rect x="200" y="152" width="40" height="12" rx="3" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.8" />
        <circle cx="230" cy="158" r="2" fill="#10b981" opacity="0.7" className="animate-pulse" />

        <rect x="200" y="170" width="40" height="12" rx="3" fill="rgba(4,155,251,0.1)" stroke="rgba(4,155,251,0.3)" strokeWidth="0.8" />
        <circle cx="230" cy="176" r="2" fill="#10b981" opacity="0.7" className="animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Bridge / data flow connection - top line (left to right) */}
        <path
          d="M120,135 C145,135 155,125 180,125"
          fill="none"
          stroke="rgba(4,155,251,0.4)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="animate-[dash-flow_2s_linear_infinite]"
        />

        {/* Bridge / data flow connection - bottom line (right to left) */}
        <path
          d="M180,160 C155,160 145,170 120,170"
          fill="none"
          stroke="rgba(139,92,246,0.4)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "1s" }}
        />

        {/* Bidirectional arrow - right arrow (top line) */}
        <polygon points="178,121 178,129 186,125" fill="#049bfb" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </polygon>

        {/* Bidirectional arrow - left arrow (bottom line) */}
        <polygon points="122,174 122,166 114,170" fill="#8b5cf6" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1s" repeatCount="indefinite" />
        </polygon>

        {/* Data packet dots flowing along top path */}
        <circle r="3" fill="#049bfb" opacity="0.7">
          <animateMotion dur="2s" repeatCount="indefinite" path="M120,135 C145,135 155,125 180,125" />
        </circle>

        {/* Data packet dots flowing along bottom path */}
        <circle r="3" fill="#8b5cf6" opacity="0.7">
          <animateMotion dur="2s" repeatCount="indefinite" path="M180,160 C155,160 145,170 120,170" />
        </circle>

        {/* Center bridge indicator */}
        <rect x="140" y="140" width="20" height="20" rx="4" fill="rgba(4,155,251,0.08)" stroke="rgba(4,155,251,0.2)" strokeWidth="0.8" />
        <text x="150" y="153" textAnchor="middle" fill="#049bfb" fontSize="7" fontFamily="inherit" opacity="0.6">API</text>

        {/* Floating accent nodes */}
        <circle cx="70" cy="70" r="3" fill="#8b5cf6" opacity="0.4" className="animate-pulse" />
        <circle cx="250" cy="80" r="3" fill="#049bfb" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
        <circle cx="150" cy="60" r="2.5" fill="#0474bc" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1.5s" }} />

        {/* Bottom label */}
        <text x="150" y="260" textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="inherit">Managed Hybrid Cloud</text>
      </svg>
    </motion.div>
  );
}
