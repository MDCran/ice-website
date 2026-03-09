"use client";

import { motion } from "motion/react";

export default function EndpointSecurityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background concentric protection rings */}
        <circle cx="150" cy="145" r="120" fill="none" stroke="rgba(168,85,247,0.04)" strokeWidth="0.5" />
        <circle cx="150" cy="145" r="90" fill="none" stroke="rgba(168,85,247,0.06)" strokeWidth="0.5" />
        <circle cx="150" cy="145" r="60" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />

        {/* Central protection hub */}
        <circle cx="150" cy="145" r="28" fill="rgba(4,155,251,0.06)" stroke="rgba(4,155,251,0.25)" strokeWidth="1" />
        <circle cx="150" cy="145" r="22" fill="rgba(4,155,251,0.04)" stroke="rgba(4,155,251,0.15)" strokeWidth="0.5" />

        {/* Shield icon in hub */}
        <g transform="translate(140, 130)">
          <path d="M10,2 L2,6 L2,14 C2,20 5,23 10,25 C15,23 18,20 18,14 L18,6 Z"
            fill="rgba(4,155,251,0.15)" stroke="#049bfb" strokeWidth="1" />
          <path d="M6,14 L9,17 L15,10" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </g>

        {/* Pulsing ring around hub */}
        <circle cx="150" cy="145" r="32" fill="none" stroke="#049bfb" strokeWidth="0.5" opacity="0.3" className="animate-pulse" />

        {/* AI-Driven label near hub */}
        <rect x="120" y="175" width="60" height="14" rx="7" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <text x="150" y="185" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(139,92,246,0.6)" fontWeight="500">AI-Driven</text>

        {/* === Server (left) === */}
        <g transform="translate(30, 95)">
          {/* Server body */}
          <rect x="0" y="0" width="40" height="55" rx="4" fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.2)" strokeWidth="1" />
          {/* Server drive bays */}
          <rect x="5" y="6" width="30" height="6" rx="1" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <rect x="5" y="16" width="30" height="6" rx="1" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          <rect x="5" y="26" width="30" height="6" rx="1" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
          {/* Status LEDs */}
          <circle cx="30" cy="9" r="1.5" fill="#10b981" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="19" r="1.5" fill="#10b981" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="29" r="1.5" fill="#10b981" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.6s" repeatCount="indefinite" />
          </circle>
          {/* Vents */}
          <line x1="8" y1="40" x2="32" y2="40" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />
          <line x1="8" y1="43" x2="32" y2="43" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />
          <line x1="8" y1="46" x2="32" y2="46" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />

          {/* Shield overlay on server */}
          <g transform="translate(12, 35)">
            <path d="M8,1 L1,4 L1,10 C1,14 4,16 8,17 C12,16 15,14 15,10 L15,4 Z"
              fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7" />
            <path d="M5,9 L7,11 L12,6" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>
        <text x="50" y="165" textAnchor="middle" fontSize="7" fill="rgba(168,85,247,0.4)" fontFamily="inherit">Server</text>

        {/* === Laptop (center) === */}
        <g transform="translate(115, 50)">
          {/* Screen */}
          <rect x="0" y="0" width="70" height="45" rx="4" fill="rgba(4,155,251,0.04)" stroke="rgba(4,155,251,0.2)" strokeWidth="1" />
          {/* Screen content lines */}
          <line x1="8" y1="10" x2="40" y2="10" stroke="rgba(4,155,251,0.12)" strokeWidth="1" />
          <line x1="8" y1="17" x2="55" y2="17" stroke="rgba(4,155,251,0.08)" strokeWidth="1" />
          <line x1="8" y1="24" x2="45" y2="24" stroke="rgba(4,155,251,0.08)" strokeWidth="1" />
          <line x1="8" y1="31" x2="35" y2="31" stroke="rgba(4,155,251,0.06)" strokeWidth="1" />
          {/* Keyboard base */}
          <path d="M-5,45 L75,45 L80,55 L-10,55 Z" fill="rgba(4,155,251,0.04)" stroke="rgba(4,155,251,0.15)" strokeWidth="0.8" />
          {/* Touchpad */}
          <rect x="25" y="47" width="20" height="5" rx="1" fill="rgba(4,155,251,0.06)" stroke="rgba(4,155,251,0.1)" strokeWidth="0.3" />

          {/* Shield overlay on laptop */}
          <g transform="translate(25, 8)">
            <path d="M10,1 L1,5 L1,13 C1,18 5,21 10,22 C15,21 19,18 19,13 L19,5 Z"
              fill="rgba(4,155,251,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7" />
            <path d="M6,12 L9,15 L15,8" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>
        <text x="150" y="118" textAnchor="middle" fontSize="7" fill="rgba(4,155,251,0.4)" fontFamily="inherit">Laptop</text>

        {/* === Mobile phone (right) === */}
        <g transform="translate(230, 95)">
          {/* Phone body */}
          <rect x="0" y="0" width="30" height="55" rx="5" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
          {/* Screen area */}
          <rect x="3" y="8" width="24" height="36" rx="2" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.1)" strokeWidth="0.3" />
          {/* Top notch */}
          <rect x="10" y="3" width="10" height="3" rx="1.5" fill="rgba(99,102,241,0.15)" />
          {/* Bottom bar */}
          <rect x="10" y="48" width="10" height="2" rx="1" fill="rgba(99,102,241,0.1)" />
          {/* Screen content */}
          <line x1="7" y1="15" x2="20" y2="15" stroke="rgba(99,102,241,0.1)" strokeWidth="0.8" />
          <line x1="7" y1="20" x2="23" y2="20" stroke="rgba(99,102,241,0.08)" strokeWidth="0.8" />
          <line x1="7" y1="25" x2="18" y2="25" stroke="rgba(99,102,241,0.06)" strokeWidth="0.8" />

          {/* Shield overlay on phone */}
          <g transform="translate(7, 14)">
            <path d="M8,1 L1,4 L1,10 C1,14 4,16 8,17 C12,16 15,14 15,10 L15,4 Z"
              fill="rgba(99,102,241,0.1)" stroke="#049bfb" strokeWidth="0.8" opacity="0.7" />
            <path d="M5,9 L7,11 L12,6" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>
        <text x="245" y="165" textAnchor="middle" fontSize="7" fill="rgba(99,102,241,0.4)" fontFamily="inherit">Mobile</text>

        {/* Dashed connection lines from devices to central hub */}
        {/* Server to hub */}
        <line x1="70" y1="122" x2="122" y2="145" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" />
        {/* Laptop to hub */}
        <line x1="150" y1="105" x2="150" y2="117" stroke="rgba(4,155,251,0.2)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />
        {/* Mobile to hub */}
        <line x1="230" y1="122" x2="178" y2="145" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "1s" }} />

        {/* Data flow particles along connection lines */}
        <circle cx="0" cy="0" r="2" fill="#8b5cf6" opacity="0.5">
          <animateMotion path="M70,122 L122,145" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="2" fill="#049bfb" opacity="0.5">
          <animateMotion path="M150,105 L150,117" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="2" fill="#0474bc" opacity="0.5">
          <animateMotion path="M230,122 L178,145" dur="2s" begin="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>

        {/* Bottom status */}
        <g transform="translate(85, 220)">
          <rect x="0" y="0" width="130" height="20" rx="10" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
          <circle cx="15" cy="10" r="3" fill="#10b981" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="65" y="13" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(16,185,129,0.5)">All Endpoints Secured</text>
        </g>

        {/* Protection count badges */}
        <text x="150" y="260" textAnchor="middle" fontSize="7" fill="rgba(168,85,247,0.35)" fontFamily="inherit">Unified Endpoint Management</text>
      </svg>
    </motion.div>
  );
}
