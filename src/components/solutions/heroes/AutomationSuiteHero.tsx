"use client";

import { motion } from "motion/react";

export default function AutomationSuiteHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-72 h-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {/* Gear tooth pattern for reuse */}
          <linearGradient id="autoGearGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#049bfb" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0474bc" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="autoGearGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="autoGearGrad3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0474bc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#049bfb" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background subtle rings */}
        <circle cx="150" cy="145" r="130" fill="none" stroke="rgba(139,92,246,0.04)" strokeWidth="0.5" />
        <circle cx="150" cy="145" r="110" fill="none" stroke="rgba(4,155,251,0.05)" strokeWidth="0.5" />

        {/* === Large center gear (main) === */}
        <g style={{ transformOrigin: "150px 145px", animation: "spin 12s linear infinite" }}>
          <path
            d="M150,95 L155,98 L158,92 L164,95 L163,102 L170,105 L173,99 L179,104 L175,110 L180,116 L186,114 L189,121 L183,124 L185,131 L191,132 L191,139 L185,140 L183,147 L189,150 L186,157 L180,155 L175,161 L179,167 L173,172 L170,166 L163,169 L164,176 L158,179 L155,173 L150,176 L145,173 L142,179 L136,176 L137,169 L130,166 L127,172 L121,167 L125,161 L120,155 L114,157 L111,150 L117,147 L115,140 L109,139 L109,132 L115,131 L117,124 L111,121 L114,114 L120,116 L125,110 L121,104 L127,99 L130,105 L137,102 L136,95 L142,92 L145,98 Z"
            fill="url(#autoGearGrad1)"
            stroke="#049bfb"
            strokeWidth="1"
            opacity="0.7"
          />
          <circle cx="150" cy="145" r="22" fill="rgba(4,155,251,0.08)" stroke="#049bfb" strokeWidth="0.8" opacity="0.5" />
        </g>

        {/* AI Brain icon in center gear (static, not rotating) */}
        <g transform="translate(137, 132)">
          {/* Brain outline */}
          <path
            d="M13,2 C10,2 8,4 7,6 C4,6 2,9 2,12 C2,14 3,16 5,17 C4,19 5,22 7,23 C8,24 10,24 12,23 L13,23 L14,23 C16,24 18,24 19,23 C21,22 22,19 21,17 C23,16 24,14 24,12 C24,9 22,6 19,6 C18,4 16,2 13,2 Z"
            fill="rgba(139,92,246,0.15)"
            stroke="#8b5cf6"
            strokeWidth="1"
            opacity="0.9"
          />
          {/* Neural connections inside brain */}
          <circle cx="10" cy="10" r="1.5" fill="#8b5cf6" opacity="0.7" />
          <circle cx="16" cy="10" r="1.5" fill="#8b5cf6" opacity="0.7" />
          <circle cx="13" cy="15" r="1.5" fill="#8b5cf6" opacity="0.7" />
          <circle cx="9" cy="18" r="1" fill="#8b5cf6" opacity="0.5" />
          <circle cx="17" cy="18" r="1" fill="#8b5cf6" opacity="0.5" />
          <line x1="10" y1="10" x2="16" y2="10" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
          <line x1="10" y1="10" x2="13" y2="15" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
          <line x1="16" y1="10" x2="13" y2="15" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
          <line x1="9" y1="18" x2="13" y2="15" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4" />
          <line x1="17" y1="18" x2="13" y2="15" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4" />
        </g>

        {/* === Top-right small gear === */}
        <g style={{ transformOrigin: "215px 85px", animation: "spin 8s linear infinite reverse" }}>
          <path
            d="M215,60 L218,63 L222,60 L225,64 L221,67 L224,72 L228,71 L229,76 L225,77 L225,82 L229,83 L228,88 L224,87 L221,92 L225,95 L222,99 L218,96 L215,99 L212,96 L208,99 L205,95 L209,92 L206,87 L202,88 L201,83 L205,82 L205,77 L201,76 L202,71 L206,72 L209,67 L205,64 L208,60 L212,63 Z"
            fill="url(#autoGearGrad2)"
            stroke="#8b5cf6"
            strokeWidth="0.8"
            opacity="0.7"
          />
          <circle cx="215" cy="85" r="10" fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* === Bottom-left medium gear === */}
        <g style={{ transformOrigin: "80px 215px", animation: "spin 10s linear infinite reverse" }}>
          <path
            d="M80,185 L84,188 L87,184 L91,187 L89,192 L94,196 L97,192 L100,197 L96,200 L97,205 L102,206 L100,211 L96,210 L94,215 L97,219 L93,223 L89,220 L85,224 L82,220 L78,224 L74,223 L77,219 L75,215 L70,216 L68,211 L72,210 L71,205 L66,204 L68,199 L72,200 L74,196 L70,192 L74,188 L78,192 Z"
            fill="url(#autoGearGrad3)"
            stroke="#0474bc"
            strokeWidth="0.8"
            opacity="0.7"
          />
          <circle cx="80" cy="215" r="13" fill="rgba(4,116,188,0.08)" stroke="#0474bc" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* Workflow arrows flowing through gears */}
        {/* Arrow path: left to center gear */}
        <path
          d="M40,145 C55,145 70,140 105,140"
          fill="none"
          stroke="rgba(4,155,251,0.3)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          className="animate-[dash-flow_2s_linear_infinite]"
          markerEnd="url(#autoArrow)"
        />
        {/* Arrow path: center gear to top-right gear */}
        <path
          d="M190,120 C198,110 205,100 205,95"
          fill="none"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "0.7s" }}
        />
        {/* Arrow path: center gear to bottom-left gear */}
        <path
          d="M125,170 C115,180 100,195 95,200"
          fill="none"
          stroke="rgba(4,116,188,0.3)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "1.4s" }}
        />
        {/* Arrow path: exit from top-right */}
        <path
          d="M235,80 C248,78 258,78 270,80"
          fill="none"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "1s" }}
        />
        {/* Arrow path: exit from bottom-left */}
        <path
          d="M65,230 C50,238 40,242 30,245"
          fill="none"
          stroke="rgba(4,116,188,0.25)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="animate-[dash-flow_2s_linear_infinite]"
          style={{ animationDelay: "1.8s" }}
        />

        {/* Arrow marker */}
        <defs>
          <marker id="autoArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="rgba(4,155,251,0.5)" strokeWidth="1" />
          </marker>
        </defs>

        {/* Workflow labels */}
        {/* "Patch" label - left side */}
        <rect x="25" y="125" width="42" height="16" rx="4" fill="rgba(4,155,251,0.08)" stroke="rgba(4,155,251,0.25)" strokeWidth="0.8" />
        <text x="46" y="136" textAnchor="middle" fill="#049bfb" fontSize="8" fontFamily="inherit" fontWeight="bold">Patch</text>

        {/* "Scan" label - top right */}
        <rect x="240" y="60" width="38" height="16" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.25)" strokeWidth="0.8" />
        <text x="259" y="71" textAnchor="middle" fill="#8b5cf6" fontSize="8" fontFamily="inherit" fontWeight="bold">Scan</text>

        {/* "Remediate" label - bottom left */}
        <rect x="15" y="250" width="60" height="16" rx="4" fill="rgba(4,116,188,0.08)" stroke="rgba(4,116,188,0.25)" strokeWidth="0.8" />
        <text x="45" y="261" textAnchor="middle" fill="#0474bc" fontSize="8" fontFamily="inherit" fontWeight="bold">Remediate</text>

        {/* Floating activity dots */}
        <circle cx="60" cy="100" r="2" fill="#049bfb" opacity="0.4" className="animate-pulse" />
        <circle cx="250" cy="140" r="2" fill="#8b5cf6" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="50" cy="200" r="2" fill="#0474bc" opacity="0.4" className="animate-pulse" style={{ animationDelay: "1s" }} />
        <circle cx="240" cy="200" r="1.5" fill="#049bfb" opacity="0.3" className="animate-pulse" style={{ animationDelay: "1.5s" }} />

        {/* CSS keyframes for gear spin - using inline style tag */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </motion.div>
  );
}
