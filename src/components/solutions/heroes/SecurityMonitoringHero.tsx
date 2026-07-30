"use client";

import { motion } from "motion/react";

export default function SecurityMonitoringHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto h-72 w-72"
    >
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background subtle grid */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`h${i}`} x1="20" y1={30 + i * 50} x2="280" y2={30 + i * 50} stroke="rgba(168,85,247,0.04)" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={20 + i * 52} y1="20" x2={20 + i * 52} y2="280" stroke="rgba(168,85,247,0.04)" strokeWidth="0.5" />
        ))}

        {/* Main dashboard card */}
        <rect x="25" y="25" width="250" height="250" rx="14" fill="rgba(139,92,246,0.03)" stroke="rgba(139,92,246,0.12)" strokeWidth="1" />

        {/* Dashboard header bar */}
        <rect x="25" y="25" width="250" height="30" rx="14" fill="rgba(4,155,251,0.05)" />
        <rect x="25" y="41" width="250" height="14" fill="rgba(4,155,251,0.05)" />

        {/* Window dots */}
        <circle cx="40" cy="40" r="3" fill="rgba(239,68,68,0.4)" />
        <circle cx="50" cy="40" r="3" fill="rgba(234,179,8,0.4)" />
        <circle cx="60" cy="40" r="3" fill="rgba(16,185,129,0.4)" />

        {/* SIEM label */}
        <text x="150" y="43" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(4,155,251,0.6)" letterSpacing="2">SIEM DASHBOARD</text>

        {/* 24/7 badge */}
        <rect x="225" y="33" width="35" height="14" rx="7" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" />
        <text x="242" y="43" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#10b981" fontWeight="bold">24/7</text>

        {/* Alert panel 1 - Critical Alerts */}
        <rect x="35" y="62" width="110" height="55" rx="6" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />
        <text x="45" y="75" fontSize="6" fontFamily="monospace" fill="rgba(168,85,247,0.5)" letterSpacing="1">THREAT ALERTS</text>
        {/* Alert rows */}
        <circle cx="45" cy="86" r="2.5" fill="#10b981" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="52" y="89" fontSize="6" fontFamily="monospace" className="fill-slate-400">Firewall OK</text>
        <circle cx="45" cy="97" r="2.5" fill="#f59e0b" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="52" y="100" fontSize="6" fontFamily="monospace" className="fill-slate-400">Login anomaly</text>
        <circle cx="45" cy="108" r="2.5" fill="#10b981" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <text x="52" y="111" fontSize="6" fontFamily="monospace" className="fill-slate-400">DNS normal</text>

        {/* Alert panel 2 - Network Status */}
        <rect x="155" y="62" width="110" height="55" rx="6" fill="rgba(4,155,251,0.04)" stroke="rgba(4,155,251,0.1)" strokeWidth="0.5" />
        <text x="165" y="75" fontSize="6" fontFamily="monospace" fill="rgba(4,155,251,0.5)" letterSpacing="1">NETWORK</text>
        <circle cx="165" cy="86" r="2.5" fill="#10b981" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <text x="172" y="89" fontSize="6" fontFamily="monospace" className="fill-slate-400">IDS Active</text>
        <circle cx="165" cy="97" r="2.5" fill="#10b981" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </circle>
        <text x="172" y="100" fontSize="6" fontFamily="monospace" className="fill-slate-400">IPS Active</text>
        <circle cx="165" cy="108" r="2.5" fill="#f59e0b" opacity="0.7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
        </circle>
        <text x="172" y="111" fontSize="6" fontFamily="monospace" className="fill-slate-400">Scan running</text>

        {/* Alert panel 3 - Endpoint Metrics */}
        <rect x="35" y="125" width="110" height="55" rx="6" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
        <text x="45" y="138" fontSize="6" fontFamily="monospace" fill="rgba(99,102,241,0.5)" letterSpacing="1">ENDPOINTS</text>
        <text x="45" y="152" fontSize="7" fontFamily="monospace" className="fill-slate-400">Protected: <tspan fill="#10b981">247</tspan></text>
        <text x="45" y="164" fontSize="7" fontFamily="monospace" className="fill-slate-400">At Risk:   <tspan fill="#f59e0b">3</tspan></text>
        <text x="45" y="176" fontSize="7" fontFamily="monospace" className="fill-slate-400">Offline:   <tspan className="fill-slate-500">0</tspan></text>

        {/* Alert panel 4 - Compliance */}
        <rect x="155" y="125" width="110" height="55" rx="6" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />
        <text x="165" y="138" fontSize="6" fontFamily="monospace" fill="rgba(139,92,246,0.5)" letterSpacing="1">COMPLIANCE</text>
        {/* Mini progress bar */}
        <rect x="165" y="148" width="88" height="6" rx="3" fill="rgba(139,92,246,0.08)" />
        <rect x="165" y="148" width="82" height="6" rx="3" fill="rgba(16,185,129,0.4)" />
        <text x="165" y="164" fontSize="6" fontFamily="monospace" fill="rgba(16,185,129,0.6)">93% Compliant</text>
        {/* Mini bar 2 */}
        <rect x="165" y="170" width="88" height="6" rx="3" fill="rgba(139,92,246,0.08)" />
        <rect x="165" y="170" width="78" height="6" rx="3" fill="rgba(4,155,251,0.4)" />
        <text x="165" y="186" fontSize="6" fontFamily="monospace" fill="rgba(4,155,251,0.6)">89% Patched</text>

        {/* Horizontal separator */}
        <line x1="35" y1="195" x2="265" y2="195" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />

        {/* Mini timeline / log section */}
        <text x="45" y="210" fontSize="6" fontFamily="monospace" fill="rgba(168,85,247,0.5)" letterSpacing="1">EVENT LOG</text>

        {/* Scrolling log entries - using clipPath */}
        <defs>
          <clipPath id="logClip">
            <rect x="35" y="215" width="230" height="50" />
          </clipPath>
        </defs>

        <g clipPath="url(#logClip)">
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-60" dur="8s" repeatCount="indefinite" />
            {/* Log entries */}
            <text x="45" y="228" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:23</tspan> Auth success user:admin
            </text>
            <text x="45" y="240" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:19</tspan> Firewall rule matched #447
            </text>
            <text x="45" y="252" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(245,158,11,0.7)">09:41:15</tspan> Brute force attempt blocked
            </text>
            <text x="45" y="264" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:11</tspan> TLS handshake completed
            </text>
            <text x="45" y="276" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:08</tspan> Policy update applied
            </text>
            {/* Duplicate for seamless loop */}
            <text x="45" y="288" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:23</tspan> Auth success user:admin
            </text>
            <text x="45" y="300" fontSize="6" fontFamily="monospace" className="fill-slate-500">
              <tspan fill="rgba(4,155,251,0.7)">09:41:19</tspan> Firewall rule matched #447
            </text>
          </g>
        </g>

        {/* Live indicator */}
        <circle cx="260" cy="208" r="3" fill="#10b981" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="253" y="211" textAnchor="end" fontSize="6" fontFamily="monospace" fill="rgba(16,185,129,0.5)">LIVE</text>
      </svg>
    </motion.div>
  );
}
