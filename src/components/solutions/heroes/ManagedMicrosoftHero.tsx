"use client";

import { motion } from "motion/react";

const services = [
  { label: "Exchange", icon: "envelope", delay: 0 },
  { label: "Teams", icon: "chat", delay: 0.1 },
  { label: "SharePoint", icon: "document", delay: 0.2 },
  { label: "Azure", icon: "cloud", delay: 0.3 },
];

export default function ManagedMicrosoftHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background glow */}
        <circle cx="150" cy="150" r="120" fill="rgba(0,120,212,0.03)" />
        <circle cx="150" cy="150" r="90" fill="rgba(4,155,251,0.04)" />

        {/* Dashboard card outline */}
        <rect x="35" y="25" width="230" height="250" rx="14" fill="rgba(0,120,212,0.04)" stroke="rgba(0,120,212,0.15)" strokeWidth="1" />

        {/* Top bar with traffic lights */}
        <circle cx="55" cy="42" r="3" fill="rgba(239,68,68,0.4)" />
        <circle cx="65" cy="42" r="3" fill="rgba(250,204,21,0.4)" />
        <circle cx="75" cy="42" r="3" fill="rgba(52,211,153,0.4)" />

        {/* M365 Badge */}
        <rect x="105" y="55" width="90" height="28" rx="6" fill="rgba(0,120,212,0.12)" stroke="rgba(0,120,212,0.35)" strokeWidth="1" />
        <text x="150" y="73" textAnchor="middle" fill="#0078d4" fontSize="13" fontFamily="inherit" fontWeight="bold">M365</text>

        {/* Pulsing ring around badge */}
        <rect x="101" y="51" width="98" height="36" rx="8" fill="none" stroke="rgba(0,120,212,0.15)" strokeWidth="1" className="animate-pulse" />

        {/* 2x2 Service Grid */}
        {/* Row 1 */}
        {/* Exchange - Envelope */}
        <g transform="translate(55, 100)">
          <rect x="0" y="0" width="85" height="65" rx="8" fill="rgba(4,155,251,0.06)" stroke="rgba(4,155,251,0.2)" strokeWidth="1" />
          {/* Envelope icon */}
          <rect x="27" y="12" width="30" height="20" rx="3" fill="none" stroke="#049bfb" strokeWidth="1.2" opacity="0.8" />
          <polyline points="27,12 42,24 57,12" fill="none" stroke="#049bfb" strokeWidth="1.2" opacity="0.8" />
          <text x="42" y="48" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit">Exchange</text>
          {/* Status dot */}
          <circle cx="72" cy="10" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Teams - Chat bubble */}
        <g transform="translate(160, 100)">
          <rect x="0" y="0" width="85" height="65" rx="8" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
          {/* Chat bubble icon */}
          <rect x="25" y="10" width="34" height="22" rx="5" fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity="0.8" />
          <polygon points="35,32 30,40 40,32" fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity="0.8" />
          <circle cx="35" cy="20" r="1.5" fill="#8b5cf6" opacity="0.6" />
          <circle cx="42" cy="20" r="1.5" fill="#8b5cf6" opacity="0.6" />
          <circle cx="49" cy="20" r="1.5" fill="#8b5cf6" opacity="0.6" />
          <text x="42" y="48" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit">Teams</text>
          <circle cx="72" cy="10" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Row 2 */}
        {/* SharePoint - Document */}
        <g transform="translate(55, 175)">
          <rect x="0" y="0" width="85" height="65" rx="8" fill="rgba(4,116,188,0.06)" stroke="rgba(4,116,188,0.2)" strokeWidth="1" />
          {/* Document icon */}
          <rect x="29" y="8" width="22" height="28" rx="2" fill="none" stroke="#0474bc" strokeWidth="1.2" opacity="0.8" />
          <polyline points="43,8 51,16 51,36 29,36 29,8 43,8 43,16 51,16" fill="none" stroke="#0474bc" strokeWidth="1.2" opacity="0.8" />
          <line x1="34" y1="22" x2="46" y2="22" stroke="#0474bc" strokeWidth="0.8" opacity="0.5" />
          <line x1="34" y1="27" x2="44" y2="27" stroke="#0474bc" strokeWidth="0.8" opacity="0.5" />
          <text x="42" y="52" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit">SharePoint</text>
          <circle cx="72" cy="10" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Azure - Cloud */}
        <g transform="translate(160, 175)">
          <rect x="0" y="0" width="85" height="65" rx="8" fill="rgba(0,120,212,0.06)" stroke="rgba(0,120,212,0.2)" strokeWidth="1" />
          {/* Cloud icon */}
          <path d="M52,30 C55,30 57,28 57,25.5 C57,23 55,21 52,21 C52,17 49,14 45,14 C42,14 39.5,15.5 38.5,18 C37,17 35.5,16.5 34,16.5 C30,16.5 27,19.5 27,23 C27,26.5 30,30 34,30 Z"
            fill="none" stroke="#0078d4" strokeWidth="1.2" opacity="0.8" />
          <text x="42" y="52" textAnchor="middle" className="fill-slate-400" fontSize="8" fontFamily="inherit">Azure</text>
          <circle cx="72" cy="10" r="3" fill="#10b981" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Connecting dashed lines between services */}
        <line x1="140" y1="132" x2="160" y2="132" stroke="rgba(0,120,212,0.2)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" />
        <line x1="140" y1="207" x2="160" y2="207" stroke="rgba(0,120,212,0.2)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.5s" }} />
        <line x1="97" y1="165" x2="97" y2="175" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.3s" }} />
        <line x1="202" y1="165" x2="202" y2="175" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" strokeDasharray="3 3" className="animate-[dash-flow_2s_linear_infinite]" style={{ animationDelay: "0.8s" }} />

        {/* Certified badge at bottom */}
        <rect x="100" y="252" width="100" height="20" rx="10" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
        {/* Checkmark */}
        <polyline points="118,262 122,266 130,258" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <text x="165" y="266" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="inherit" fontWeight="bold">Certified</text>
      </svg>
    </motion.div>
  );
}
