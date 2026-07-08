"use client";

/* --------------------------------------------------------------------------
   ILLUSTRATION RENDERER
   16 built-in SVG illustrations for use in CMS sections.
   All illustrations use the site's dark theme palette.
   -------------------------------------------------------------------------- */

interface SvgProps {
  className?: string;
}

/* CLOUD & HOSTING */

function CloudServer({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="95" r="72" fill="rgba(56,189,248,0.05)" />
      {/* Cloud outline */}
      <path d="M50 108 C50 90 64 78 80 78 C83 66 94 58 108 60 C118 54 132 60 136 72 C148 73 158 84 156 97 C158 112 147 120 135 119 L65 119 C56 119 50 115 50 108 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      {/* Server rows */}
      <rect x="65" y="82" width="70" height="8" rx="2" fill="#162237" stroke="#1d4ed8" strokeWidth="0.8"/>
      <circle cx="72" cy="86" r="2.5" fill="#38bdf8"/>
      <rect x="78" y="84.5" width="30" height="3" rx="1" fill="#38bdf8" opacity="0.35"/>
      <rect x="65" y="93" width="70" height="8" rx="2" fill="#162237" stroke="#1d4ed8" strokeWidth="0.8"/>
      <circle cx="72" cy="97" r="2.5" fill="#10b981"/>
      <rect x="78" y="95.5" width="40" height="3" rx="1" fill="#38bdf8" opacity="0.35"/>
      <rect x="65" y="104" width="70" height="8" rx="2" fill="#162237" stroke="#1d4ed8" strokeWidth="0.8"/>
      <circle cx="72" cy="108" r="2.5" fill="#38bdf8" opacity="0.7"/>
      <rect x="78" y="106.5" width="22" height="3" rx="1" fill="#38bdf8" opacity="0.35"/>
      {/* Drop cables */}
      <line x1="88" y1="119" x2="88" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
      <line x1="112" y1="119" x2="112" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
      {/* Bottom device */}
      <rect x="68" y="140" width="64" height="22" rx="4" fill="#0f1c30" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="76" y="147" width="48" height="3" rx="1" fill="#3b82f6" opacity="0.45"/>
      <rect x="76" y="153" width="32" height="3" rx="1" fill="#3b82f6" opacity="0.28"/>
      <circle cx="118" cy="151" r="3" fill="#10b981" opacity="0.85"/>
    </svg>
  );
}

function HybridCloud({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="70" fill="rgba(56,189,248,0.04)" />
      {/* Left cloud (on-prem) */}
      <path d="M20 100 C20 87 31 78 44 79 C46 70 54 63 65 64 C72 58 82 61 84 70 C92 70 98 78 96 87 C99 94 97 105 90 107 L28 107 C23 107 20 104 20 100 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <rect x="30" y="84" width="55" height="5" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.6"/>
      <circle cx="35" cy="86.5" r="2" fill="#38bdf8"/>
      <rect x="30" y="92" width="55" height="5" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.6"/>
      <circle cx="35" cy="94.5" r="2" fill="#10b981"/>
      {/* Right cloud */}
      <path d="M104 100 C104 87 115 78 128 79 C130 70 138 63 149 64 C156 58 166 61 168 70 C176 70 182 78 180 87 C183 94 181 105 174 107 L112 107 C107 107 104 104 104 100 Z" fill="#0f1c30" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="114" y="84" width="55" height="5" rx="1.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.6"/>
      <circle cx="119" cy="86.5" r="2" fill="#3b82f6"/>
      <rect x="114" y="92" width="55" height="5" rx="1.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.6"/>
      <circle cx="119" cy="94.5" r="2" fill="#3b82f6" opacity="0.7"/>
      {/* Bidirectional arrows */}
      <line x1="97" y1="93" x2="103" y2="93" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8"/>
      <polyline points="101,90 104,93 101,96" stroke="#38bdf8" strokeWidth="1.5" fill="none"/>
      <line x1="97" y1="98" x2="103" y2="98" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8"/>
      <polyline points="99,95 96,98 99,101" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
      {/* Label */}
      <rect x="75" y="130" width="50" height="16" rx="8" fill="#38bdf8" opacity="0.12" stroke="#38bdf8" strokeWidth="0.8"/>
      <rect x="54" y="130" width="44" height="16" rx="8" fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="0.8"/>
      <text x="77" y="141" fontSize="7" fill="#38bdf8" fontFamily="monospace" opacity="0.9">CLOUD</text>
      <text x="57" y="141" fontSize="7" fill="#64748b" fontFamily="monospace" opacity="0.9">ON-PREM</text>
    </svg>
  );
}

function CloudMigration({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="70" fill="rgba(56,189,248,0.04)" />
      {/* Left: server box */}
      <rect x="18" y="72" width="52" height="56" rx="6" fill="#0f1c30" stroke="#64748b" strokeWidth="1.5"/>
      {[80, 90, 100, 110, 118].map((y, i) => (
        <g key={i}>
          <rect x="24" y={y} width="40" height="5" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.5"/>
          <circle cx="29" cy={y + 2.5} r="1.5" fill={i === 1 ? "#10b981" : "#334155"}/>
        </g>
      ))}
      {/* Arrow */}
      <line x1="75" y1="100" x2="108" y2="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3"/>
      <polyline points="105,95 112,100 105,105" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="93" cy="100" r="4" fill="#38bdf8" opacity="0.2"/>
      <circle cx="93" cy="100" r="2" fill="#38bdf8" opacity="0.6"/>
      {/* Right: cloud */}
      <path d="M120 115 C120 102 130 94 142 95 C143 86 151 79 161 80 C169 80 175 86 175 95 C182 95 187 102 185 110 C186 120 178 126 170 125 L127 125 C122 125 120 121 120 115 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <rect x="129" y="101" width="47" height="5" rx="1.5" fill="#162237" stroke="#38bdf8" strokeWidth="0.7"/>
      <circle cx="134" cy="103.5" r="2" fill="#38bdf8"/>
      <rect x="129" y="109" width="47" height="5" rx="1.5" fill="#162237" stroke="#38bdf8" strokeWidth="0.7"/>
      <circle cx="134" cy="111.5" r="2" fill="#10b981"/>
      {/* Upload arrow in cloud */}
      <line x1="155" y1="120" x2="155" y2="100" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  );
}

function DataCenter({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Rack cabinet */}
      <rect x="55" y="38" width="90" height="130" rx="5" fill="#0a1628" stroke="#334155" strokeWidth="2"/>
      <rect x="60" y="43" width="80" height="8" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8"/>
      {/* 8 server units */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const y = 58 + i * 12;
        const colors = ["#10b981", "#38bdf8", "#10b981", "#38bdf8", "#f59e0b", "#10b981", "#38bdf8", "#10b981"];
        return (
          <g key={i}>
            <rect x="62" y={y} width="76" height="9" rx="1.5" fill="#162237" stroke="#1e3a5f" strokeWidth="0.7"/>
            <circle cx="68" cy={y + 4.5} r="2" fill={colors[i]} opacity={0.9}/>
            <rect x="73" y={y + 2} width={20 + (i % 3) * 8} height="5" rx="1" fill="#38bdf8" opacity="0.12"/>
            <circle cx={130 + (i % 2) * 5} cy={y + 4.5} r="1.5" fill="#334155"/>
          </g>
        );
      })}
      {/* Bottom indicator strip */}
      <rect x="60" y="152" width="80" height="10" rx="2" fill="#1e293b"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <circle key={i} cx={65 + i * 7} cy={157} r="1.5" fill="#38bdf8" opacity={i % 3 === 0 ? 0.9 : 0.3}/>
      ))}
      {/* Rack handles */}
      <rect x="55" y="95" width="6" height="20" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
      <rect x="139" y="95" width="6" height="20" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
    </svg>
  );
}

/* SECURITY */

function ShieldProtect({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.05)" />
      <circle cx="100" cy="100" r="52" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 4"/>
      {/* Shield */}
      <path d="M100 42 L142 58 L142 102 C142 128 122 148 100 158 C78 148 58 128 58 102 L58 58 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="2"/>
      <path d="M100 52 L134 65 L134 103 C134 123 118 139 100 148 C82 139 66 123 66 103 L66 65 Z" fill="#162237" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6"/>
      {/* Lock icon inside */}
      <rect x="86" y="98" width="28" height="22" rx="4" fill="#38bdf8" opacity="0.15" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M92 98 L92 91 C92 85 108 85 108 91 L108 98" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="100" cy="109" r="4" fill="#38bdf8" opacity="0.8"/>
      <line x1="100" y1="113" x2="100" y2="117" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      {/* Glow */}
      <circle cx="100" cy="100" r="20" fill="#38bdf8" opacity="0.04" filter="blur(2)"/>
    </svg>
  );
}

function CyberDefend({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Radar rings */}
      <circle cx="100" cy="100" r="70" fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="100" cy="100" r="50" fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeWidth="0.5" opacity="0.4"/>
      <circle cx="100" cy="100" r="30" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5"/>
      {/* Crosshairs */}
      <line x1="100" y1="25" x2="100" y2="175" stroke="#38bdf8" strokeWidth="0.5" opacity="0.2"/>
      <line x1="25" y1="100" x2="175" y2="100" stroke="#38bdf8" strokeWidth="0.5" opacity="0.2"/>
      {/* Radar sweep */}
      <path d="M100 100 L170 100 A70 70 0 0 0 100 30" fill="rgba(56,189,248,0.08)"/>
      <line x1="100" y1="100" x2="165" y2="75" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6"/>
      {/* Shield center */}
      <path d="M100 74 L120 81 L120 99 C120 112 110 121 100 126 C90 121 80 112 80 99 L80 81 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M100 80 L114 85.5 L114 99.5 C114 109 106 116 100 120 C94 116 86 109 86 99.5 L86 85.5 Z" fill="#162237"/>
      <polyline points="92,100 97,105 108,93" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Blips */}
      <circle cx="148" cy="70" r="3" fill="#10b981" opacity="0.8"/>
      <circle cx="148" cy="70" r="6" fill="#10b981" opacity="0.2"/>
      <circle cx="130" cy="54" r="2" fill="#f59e0b" opacity="0.8"/>
      <circle cx="155" cy="105" r="2" fill="#38bdf8" opacity="0.6"/>
    </svg>
  );
}

function RansomwareGuard({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="70" fill="rgba(56,189,248,0.04)" />
      {/* Files on left */}
      {[[24, 60], [24, 80], [24, 100], [24, 120]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={34} height={16} rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
          <path d={`M${x + 26},${y} L${x + 34},${y + 8} L${x + 34},${y} Z`} fill="#0a1628"/>
          <rect x={x + 4} y={y + 5} width={16} height={2} rx="1" fill="#334155"/>
          <rect x={x + 4} y={y + 9} width={10} height={2} rx="1" fill="#334155"/>
        </g>
      ))}
      {/* Threat arrow */}
      <line x1="63" y1="100" x2="90" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"/>
      <polyline points="87,95 93,100 87,105" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Barrier line */}
      <line x1="96" y1="68" x2="96" y2="132" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Shield (right) */}
      <path d="M118 64 L158 78 L158 108 C158 130 138 148 118 156 C98 148 78 130 78 108 L78 78 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="2"/>
      <path d="M118 72 L148 83 L148 108 C148 126 132 140 118 147 C104 140 88 126 88 108 L88 83 Z" fill="#162237" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5"/>
      <circle cx="118" cy="108" r="10" fill="#38bdf8" opacity="0.12"/>
      <polyline points="110,108 115,114 127,101" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EndpointSecure({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="105" r="68" fill="rgba(56,189,248,0.04)" />
      {/* Laptop screen */}
      <rect x="35" y="55" width="130" height="85" rx="6" fill="#0f1c30" stroke="#334155" strokeWidth="2"/>
      <rect x="42" y="62" width="116" height="71" rx="3" fill="#0a1628"/>
      {/* Screen content */}
      <rect x="50" y="70" width="40" height="4" rx="2" fill="#334155"/>
      <rect x="50" y="78" width="60" height="3" rx="1.5" fill="#1e293b"/>
      <rect x="50" y="84" width="50" height="3" rx="1.5" fill="#1e293b"/>
      {/* Green bars on screen */}
      {[[50, 95], [62, 95], [74, 95], [86, 95], [98, 95]].map(([x, y], i) => (
        <rect key={i} x={x} y={y - (i + 1) * 4} width="8" height={(i + 1) * 4} rx="1" fill="#38bdf8" opacity={0.2 + i * 0.12} />
      ))}
      {/* Base */}
      <rect x="28" y="140" width="144" height="8" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
      <rect x="75" y="140" width="50" height="4" rx="2" fill="#0f1c30"/>
      {/* Shield badge */}
      <circle cx="148" cy="68" r="22" fill="#0a1628" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M148 52 L162 57 L162 70 C162 80 155 87 148 91 C141 87 134 80 134 70 L134 57 Z" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <path d="M148 56 L158 60 L158 70 C158 78 153 83 148 86 C143 83 138 78 138 70 L138 60 Z" fill="#162237"/>
      <polyline points="141,70 146,75 155,63" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* DATA & BACKUP */

function DatabaseStack({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* 3 databases stacked */}
      {[
        { y: 45, color: "#38bdf8", label: "#162237" },
        { y: 95, color: "#3b82f6", label: "#0f1c30" },
        { y: 145, color: "#1d4ed8", label: "#0a1628" },
      ].map(({ y, color, label }, i) => (
        <g key={i}>
          {/* Top ellipse */}
          <ellipse cx="100" cy={y} rx="44" ry="12" fill={label} stroke={color} strokeWidth="1.5"/>
          {/* Cylinder body */}
          <rect x="56" y={y} width="88" height="38" fill={label} />
          <line x1="56" y1={y} x2="56" y2={y + 38} stroke={color} strokeWidth="1.5"/>
          <line x1="144" y1={y} x2="144" y2={y + 38} stroke={color} strokeWidth="1.5"/>
          {/* Bottom ellipse */}
          <ellipse cx="100" cy={y + 38} rx="44" ry="12" fill={label} stroke={color} strokeWidth="1.5"/>
          {/* Line detail */}
          <line x1="63" y1={y + 16} x2="137" y2={y + 16} stroke={color} strokeWidth="0.8" opacity="0.4"/>
          <line x1="63" y1={y + 24} x2="137" y2={y + 24} stroke={color} strokeWidth="0.8" opacity="0.25"/>
          {/* Indicator */}
          <circle cx="76" cy={y + 20} r="3" fill={color} opacity={0.7}/>
          <rect x="84" y={y + 18} width="24" height="4" rx="2" fill={color} opacity="0.25"/>
        </g>
      ))}
    </svg>
  );
}

function BackupRestore({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Circular arrows */}
      <circle cx="100" cy="100" r="58" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.3"/>
      {/* Main restore arc */}
      <path d="M100 42 A58 58 0 1 1 58 158" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <polyline points="52,148 56,160 68,156" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M100 42 A58 58 0 0 0 58 158" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 4"/>
      <polyline points="104,42 100,30 92,38" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Center database */}
      <ellipse cx="100" cy="88" rx="30" ry="8" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <rect x="70" y="88" width="60" height="24" fill="#0f1c30"/>
      <line x1="70" y1="88" x2="70" y2="112" stroke="#38bdf8" strokeWidth="1.5"/>
      <line x1="130" y1="88" x2="130" y2="112" stroke="#38bdf8" strokeWidth="1.5"/>
      <ellipse cx="100" cy="112" rx="30" ry="8" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      <line x1="80" y1="98" x2="120" y2="98" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="82" cy="102" r="2.5" fill="#10b981"/>
    </svg>
  );
}

function DisasterRecovery({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="105" r="70" fill="rgba(56,189,248,0.04)" />
      {/* Left server (damaged) */}
      <rect x="22" y="65" width="56" height="75" rx="4" fill="#0f1c30" stroke="#ef4444" strokeWidth="1.5"/>
      {[73, 83, 93, 103, 113, 123].map((y, i) => (
        <g key={i}>
          <rect x="28" y={y} width="44" height="7" rx="1" fill="#1e293b" stroke="#2d1b1b" strokeWidth="0.5"/>
          <circle cx="33" cy={y + 3.5} r="1.5" fill={i === 2 ? "#ef4444" : "#1e293b"}/>
        </g>
      ))}
      {/* Lightning bolt */}
      <path d="M55 55 L42 78 L53 78 L40 100" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Curved recovery arrow */}
      <path d="M78 103 C78 85 100 72 122 72" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5 3"/>
      <polyline points="118,65 124,72 118,79" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right server (healthy) */}
      <rect x="122" y="65" width="56" height="75" rx="4" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      {[73, 83, 93, 103, 113, 123].map((y, i) => (
        <g key={i}>
          <rect x="128" y={y} width="44" height="7" rx="1" fill="#162237" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="133" cy={y + 3.5} r="1.5" fill="#10b981"/>
        </g>
      ))}
      {/* Labels */}
      <text x="50" y="158" fontSize="7" fill="#ef4444" fontFamily="monospace" textAnchor="middle" opacity="0.8">FAILED</text>
      <text x="150" y="158" fontSize="7" fill="#10b981" fontFamily="monospace" textAnchor="middle" opacity="0.8">RESTORED</text>
    </svg>
  );
}

function HighAvailability({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="70" fill="rgba(56,189,248,0.04)" />
      {/* Left server */}
      <rect x="15" y="60" width="58" height="80" rx="4" fill="#0f1c30" stroke="#38bdf8" strokeWidth="1.5"/>
      {[68, 78, 88, 98, 108, 118, 128].map((y, i) => (
        <g key={i}>
          <rect x="21" y={y} width="46" height="7" rx="1" fill="#162237" stroke="#1e3a5f" strokeWidth="0.5"/>
          <circle cx="26" cy={y + 3.5} r="1.5" fill="#10b981"/>
        </g>
      ))}
      {/* Right server */}
      <rect x="127" y="60" width="58" height="80" rx="4" fill="#0f1c30" stroke="#3b82f6" strokeWidth="1.5"/>
      {[68, 78, 88, 98, 108, 118, 128].map((y, i) => (
        <g key={i}>
          <rect x="133" y={y} width="46" height="7" rx="1" fill="#0f1c30" stroke="#162237" strokeWidth="0.5"/>
          <circle cx="138" cy={y + 3.5} r="1.5" fill="#3b82f6" opacity="0.7"/>
        </g>
      ))}
      {/* Heartbeat line connection */}
      <polyline
        points="75,100 82,100 86,80 90,120 94,90 98,110 102,90 106,110 110,80 114,120 118,100 125,100"
        stroke="#38bdf8"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Labels */}
      <text x="44" y="155" fontSize="7" fill="#38bdf8" fontFamily="monospace" textAnchor="middle">PRIMARY</text>
      <text x="156" y="155" fontSize="7" fill="#3b82f6" fontFamily="monospace" textAnchor="middle">STANDBY</text>
    </svg>
  );
}

/* SERVICES & BUSINESS */

function AnalyticsDash({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Dashboard frame */}
      <rect x="22" y="40" width="156" height="120" rx="8" fill="#0a1628" stroke="#334155" strokeWidth="2"/>
      {/* Title bar */}
      <rect x="22" y="40" width="156" height="20" rx="8" fill="#0f1c30"/>
      <circle cx="35" cy="50" r="3" fill="#ef4444" opacity="0.7"/>
      <circle cx="45" cy="50" r="3" fill="#f59e0b" opacity="0.7"/>
      <circle cx="55" cy="50" r="3" fill="#10b981" opacity="0.7"/>
      <rect x="70" y="46" width="60" height="8" rx="4" fill="#1e293b"/>
      {/* Y-axis */}
      <line x1="48" y1="68" x2="48" y2="138" stroke="#334155" strokeWidth="1"/>
      <line x1="48" y1="138" x2="178" y2="138" stroke="#334155" strokeWidth="1"/>
      {/* Grid lines */}
      {[85, 102, 119].map((y) => (
        <line key={y} x1="48" y1={y} x2="178" y2={y} stroke="#1e293b" strokeWidth="0.8"/>
      ))}
      {/* Bars */}
      {[
        { x: 60, h: 45, color: "#38bdf8" },
        { x: 84, h: 62, color: "#3b82f6" },
        { x: 108, h: 35, color: "#38bdf8" },
        { x: 132, h: 70, color: "#3b82f6" },
        { x: 156, h: 52, color: "#38bdf8" },
      ].map(({ x, h, color }, i) => (
        <g key={i}>
          <rect x={x - 8} y={138 - h} width="16" height={h} rx="3" fill={color} opacity="0.75"/>
        </g>
      ))}
      {/* Trend line */}
      <polyline
        points="52,118 76,105 100,122 124,88 148,100 172,86"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[52, 76, 100, 124, 148, 172].map((x, i) => {
        const ys = [118, 105, 122, 88, 100, 86];
        return <circle key={i} cx={x} cy={ys[i]} r="3" fill="#10b981"/>;
      })}
    </svg>
  );
}

function AutomationGear({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Large gear left */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 80, cy = 95;
        const inner = 28, outer = 36;
        const x1 = cx + inner * Math.cos(rad);
        const y1 = cy + inner * Math.sin(rad);
        const x2 = cx + outer * Math.cos(rad - 0.2);
        const y2 = cy + outer * Math.sin(rad - 0.2);
        const x3 = cx + outer * Math.cos(rad + 0.2);
        const y3 = cy + outer * Math.sin(rad + 0.2);
        return (
          <path key={angle} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} Z`} fill="#38bdf8" opacity="0.6"/>
        );
      })}
      <circle cx="80" cy="95" r="28" fill="#0f1c30" stroke="#38bdf8" strokeWidth="2"/>
      <circle cx="80" cy="95" r="10" fill="#162237" stroke="#38bdf8" strokeWidth="1.5"/>
      {/* Small gear right */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 132, cy = 110;
        const inner = 18, outer = 24;
        const x1 = cx + inner * Math.cos(rad);
        const y1 = cy + inner * Math.sin(rad);
        const x2 = cx + outer * Math.cos(rad - 0.3);
        const y2 = cy + outer * Math.sin(rad - 0.3);
        const x3 = cx + outer * Math.cos(rad + 0.3);
        const y3 = cy + outer * Math.sin(rad + 0.3);
        return (
          <path key={angle} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} Z`} fill="#3b82f6" opacity="0.6"/>
        );
      })}
      <circle cx="132" cy="110" r="18" fill="#0f1c30" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="132" cy="110" r="6" fill="#162237" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Lightning bolt center */}
      <path d="M104 80 L97 100 L105 100 L96 120" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function ManagedServices({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Server rack */}
      <rect x="52" y="45" width="80" height="110" rx="5" fill="#0a1628" stroke="#334155" strokeWidth="2"/>
      {[55, 68, 81, 94, 107, 120, 133].map((y, i) => (
        <g key={i}>
          <rect x="58" y={y} width="68" height="10" rx="2" fill="#162237" stroke="#1e3a5f" strokeWidth="0.7"/>
          <circle cx="64" cy={y + 5} r="2" fill={[0, 2, 4].includes(i) ? "#10b981" : "#38bdf8"} opacity="0.8"/>
          <rect x="70" y={y + 3} width={20 + (i % 3) * 8} height="4" rx="1" fill="#38bdf8" opacity="0.12"/>
        </g>
      ))}
      {/* Wrench */}
      <path d="M128 60 C138 50 158 52 162 68 C162 76 156 80 150 80 L138 92 L132 86 L143 74 C135 72 128 68 128 60 Z" fill="#f59e0b" opacity="0.85"/>
      <rect x="118" y="90" width="24" height="10" rx="2" transform="rotate(-45 118 90)" fill="#f59e0b" opacity="0.85"/>
      {/* Check badge */}
      <circle cx="148" cy="140" r="18" fill="#0f1c30" stroke="#10b981" strokeWidth="2"/>
      <polyline points="140,140 145,146 157,133" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function GlobalNetwork({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="100" cy="100" r="72" fill="rgba(56,189,248,0.04)" />
      {/* Globe */}
      <circle cx="100" cy="100" r="55" fill="#0a1628" stroke="#38bdf8" strokeWidth="1.5"/>
      {/* Latitude lines */}
      {[-30, 0, 30].map((deg, i) => {
        const r = 55 * Math.cos((deg * Math.PI) / 180);
        const y = 100 + 55 * Math.sin((deg * Math.PI) / 180);
        return <ellipse key={i} cx="100" cy={y} rx={r} ry="8" fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity="0.35"/>;
      })}
      {/* Longitude lines */}
      {[0, 45, 90, 135].map((angle, i) => (
        <ellipse key={i} cx="100" cy="100" rx={angle === 90 ? 55 : 27} ry="55" fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity="0.35" transform={`rotate(${angle} 100 100)`}/>
      ))}
      {/* Network nodes */}
      {[
        { cx: 100, cy: 45 },
        { cx: 155, cy: 100 },
        { cx: 100, cy: 155 },
        { cx: 45, cy: 100 },
        { cx: 138, cy: 62 },
        { cx: 138, cy: 138 },
        { cx: 62, cy: 62 },
        { cx: 62, cy: 138 },
      ].map(({ cx, cy }, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5" fill="#38bdf8" opacity={0.8}/>
          <circle cx={cx} cy={cy} r="9" fill="#38bdf8" opacity={0.15}/>
        </g>
      ))}
      {/* Connection lines */}
      {[
        [100, 45, 155, 100], [155, 100, 100, 155], [100, 155, 45, 100], [45, 100, 100, 45],
        [100, 45, 138, 62], [138, 62, 155, 100], [155, 100, 138, 138], [100, 45, 62, 62],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="0.8" opacity="0.3"/>
      ))}
    </svg>
  );
}

/* --------------------------------------------------------------------------
   REGISTRY + RENDERER
   -------------------------------------------------------------------------- */

import type { ReactElement } from "react";

const ILLUSTRATION_MAP: Record<string, (props: SvgProps) => ReactElement> = {
  "cloud-server": CloudServer,
  "hybrid-cloud": HybridCloud,
  "cloud-migration": CloudMigration,
  "data-center": DataCenter,
  "shield-protect": ShieldProtect,
  "cyber-defend": CyberDefend,
  "ransomware-guard": RansomwareGuard,
  "endpoint-secure": EndpointSecure,
  "database-stack": DatabaseStack,
  "backup-restore": BackupRestore,
  "disaster-recovery": DisasterRecovery,
  "high-availability": HighAvailability,
  "analytics-dash": AnalyticsDash,
  "automation-gear": AutomationGear,
  "managed-services": ManagedServices,
  "global-network": GlobalNetwork,
};

interface IllustrationRendererProps {
  id: string;
  className?: string;
}

export function IllustrationRenderer({ id, className }: IllustrationRendererProps) {
  const Illustration = ILLUSTRATION_MAP[id];
  if (!Illustration) return null;
  return <Illustration className={className} />;
}

export { ILLUSTRATION_MAP };
export default IllustrationRenderer;
