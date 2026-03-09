"use client";

import { motion } from "motion/react";

export default function IBMiSecurityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Security layer rings wrapping the terminal */}
        <ellipse cx="150" cy="155" rx="140" ry="120" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="1" />
        <ellipse cx="150" cy="155" rx="125" ry="105" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1" className="animate-pulse" />
        <ellipse cx="150" cy="155" rx="110" ry="90" fill="none" stroke="rgba(4,155,251,0.15)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Terminal body - rounded rect */}
        <rect x="65" y="55" width="170" height="190" rx="12" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" />

        {/* Terminal bezel/inner screen */}
        <rect x="75" y="65" width="150" height="140" rx="6" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />

        {/* Scan lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
          <line
            key={i}
            x1="76"
            y1={70 + i * 10}
            x2="224"
            y2={70 + i * 10}
            stroke="rgba(16,185,129,0.06)"
            strokeWidth="0.5"
          />
        ))}

        {/* Scrolling scan highlight */}
        <rect x="76" y="66" width="148" height="8" fill="rgba(16,185,129,0.08)" rx="1">
          <animate attributeName="y" values="66;195;66" dur="4s" repeatCount="indefinite" />
        </rect>

        {/* AS/400 label */}
        <text x="150" y="80" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(16,185,129,0.5)" letterSpacing="2">AS/400</text>

        {/* Terminal text lines (green screen style) */}
        <text x="85" y="98" fontSize="7" fontFamily="monospace" fill="rgba(16,185,129,0.6)">SECURITY AUDIT</text>
        <text x="85" y="110" fontSize="7" fontFamily="monospace" fill="rgba(16,185,129,0.4)">================</text>

        {/* Security checklist items */}
        {/* Item 1 - checked */}
        <text x="85" y="126" fontSize="7" fontFamily="monospace" fill="#10b981" opacity="0.7">[✓] Auth Profiles</text>
        {/* Item 2 - checked */}
        <text x="85" y="139" fontSize="7" fontFamily="monospace" fill="#10b981" opacity="0.7">[✓] Object Authority</text>
        {/* Item 3 - checked */}
        <text x="85" y="152" fontSize="7" fontFamily="monospace" fill="#10b981" opacity="0.7">[✓] Exit Programs</text>
        {/* Item 4 - checked */}
        <text x="85" y="165" fontSize="7" fontFamily="monospace" fill="#10b981" opacity="0.7">[✓] Network Rules</text>
        {/* Item 5 - scanning indicator */}
        <text x="85" y="178" fontSize="7" fontFamily="monospace" fill="rgba(16,185,129,0.5)">[...] Journal Audit</text>
        <rect x="85" y="172" width="40" height="8" fill="rgba(16,185,129,0.1)" rx="1">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>

        {/* Cursor blink */}
        <rect x="85" y="188" width="5" height="8" fill="#10b981" opacity="0.6">
          <animate attributeName="opacity" values="0;0.6;0" dur="1s" repeatCount="indefinite" />
        </rect>

        {/* Security layer labels on rings */}
        <text x="150" y="28" textAnchor="middle" fontSize="7" fill="rgba(139,92,246,0.4)" fontFamily="inherit">Access Control</text>
        <text x="275" y="155" textAnchor="end" fontSize="7" fill="rgba(99,102,241,0.4)" fontFamily="inherit">Encryption</text>
        <text x="150" y="285" textAnchor="middle" fontSize="7" fill="rgba(4,155,251,0.4)" fontFamily="inherit">Threat Monitoring</text>

        {/* Security shield nodes on ring intersections */}
        <circle cx="150" cy="35" r="3" fill="#8b5cf6" opacity="0.5" className="animate-pulse" />
        <circle cx="265" cy="155" r="3" fill="#049bfb" opacity="0.5" className="animate-pulse" style={{ animationDelay: "0.7s" }} />
        <circle cx="150" cy="275" r="3" fill="#0474bc" opacity="0.5" className="animate-pulse" style={{ animationDelay: "1.4s" }} />
        <circle cx="35" cy="155" r="3" fill="#8b5cf6" opacity="0.5" className="animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Lock icon in bottom corner of terminal */}
        <g transform="translate(210, 210)">
          <rect x="0" y="5" width="12" height="9" rx="2" fill="none" stroke="#049bfb" strokeWidth="1" opacity="0.6" />
          <path d="M2,5 L2,2 C2,0,10,0,10,2 L10,5" fill="none" stroke="#049bfb" strokeWidth="1" opacity="0.6" />
          <circle cx="6" cy="10" r="1.5" fill="#049bfb" opacity="0.6" />
        </g>
      </svg>
    </motion.div>
  );
}
