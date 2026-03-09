"use client";

export default function CyberRadar() {
  return (
    <div className="relative mx-auto w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]">
      <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
        {/* Grid lines */}
        <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />
        <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" />

        {/* Concentric circles */}
        {[40, 75, 110, 140].map((r) => (
          <circle
            key={r}
            cx="150"
            cy="150"
            r={r}
            fill="none"
            stroke="rgba(168,85,247,0.12)"
            strokeWidth="0.75"
          />
        ))}

        {/* Outer ring */}
        <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="1" />

        {/* Sweep line */}
        <g className="origin-center animate-[radar-sweep_3s_linear_infinite]" style={{ transformOrigin: "150px 150px" }}>
          <defs>
            <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168,85,247,0)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.6)" />
            </linearGradient>
            {/* Sweep trail as a conic-like wedge */}
            <linearGradient id="trail-grad" gradientTransform="rotate(0)">
              <stop offset="0%" stopColor="rgba(168,85,247,0)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.08)" />
            </linearGradient>
          </defs>
          {/* Trail wedge */}
          <path
            d="M150,150 L150,5 A145,145 0 0,0 43,80 Z"
            fill="url(#trail-grad)"
            opacity="0.5"
          />
          {/* Main sweep line */}
          <line x1="150" y1="150" x2="150" y2="5" stroke="url(#sweep-grad)" strokeWidth="1.5" />
        </g>

        {/* Detection dots */}
        {[
          { cx: 190, cy: 80, delay: "0s" },
          { cx: 110, cy: 105, delay: "0.8s" },
          { cx: 205, cy: 170, delay: "1.6s" },
          { cx: 95, cy: 190, delay: "2.2s" },
          { cx: 170, cy: 220, delay: "0.4s" },
        ].map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="3"
              fill="#049bfb"
              opacity="0.8"
              className="animate-[radar-ping_3s_ease-in-out_infinite]"
              style={{ animationDelay: dot.delay }}
            />
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="7"
              fill="none"
              stroke="#049bfb"
              strokeWidth="0.5"
              opacity="0.3"
              className="animate-[radar-ping_3s_ease-in-out_infinite]"
              style={{ animationDelay: dot.delay }}
            />
          </g>
        ))}

        {/* Center dot */}
        <circle cx="150" cy="150" r="4" fill="#049bfb" opacity="0.9" />
        <circle cx="150" cy="150" r="8" fill="none" stroke="#049bfb" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}
