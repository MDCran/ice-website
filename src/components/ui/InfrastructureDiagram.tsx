"use client";

import { motion } from "motion/react";

export interface DiagramNode {
  label: string;
  x: number;
  icon: string;
}

const defaultNodes: DiagramNode[] = [
  { label: "Client", x: 50, icon: "M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V6h16V18z" },
  { label: "Firewall", x: 200, icon: "M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z M12,11.99h7c-0.53,4.12-3.28,7.79-7,8.94V12H5V6.3l7-3.11V11.99z" },
  { label: "Load Balancer", x: 350, icon: "M4,15h16v-2H4V15z M4,19h16v-2H4V19z M4,11h16V9H4V11z M4,5v2h16V5H4z" },
  { label: "Cloud Servers", x: 500, icon: "M19.35,10.04C18.67,6.59,15.64,4,12,4C9.11,4,6.6,5.64,5.35,8.04C2.34,8.36,0,10.91,0,14c0,3.31,2.69,6,6,6h13c2.76,0,5-2.24,5-5C24,12.36,21.95,10.22,19.35,10.04z" },
  { label: "Storage", x: 650, icon: "M2,20h20v-4H2V20z M4,17h2v2H4V17z M2,4v4h20V4H2z M6,7H4V5h2V7z M2,14h20v-4H2V14z M4,11h2v2H4V11z" },
  { label: "Backup", x: 800, icon: "M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z" },
];

/* ── Preset configurations ───────────────────────────────────────── */
export const presets = {
  default: defaultNodes,
  cloud: [
    { label: "On-Prem", x: 50, icon: "M2,20h20v-4H2V20z M4,17h2v2H4V17z M2,4v4h20V4H2z M6,7H4V5h2V7z M2,14h20v-4H2V14z M4,11h2v2H4V11z" },
    { label: "VPN", x: 225, icon: "M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z M12,11.99h7c-0.53,4.12-3.28,7.79-7,8.94V12H5V6.3l7-3.11V11.99z" },
    { label: "Cloud Gateway", x: 400, icon: "M19.35,10.04C18.67,6.59,15.64,4,12,4C9.11,4,6.6,5.64,5.35,8.04C2.34,8.36,0,10.91,0,14c0,3.31,2.69,6,6,6h13c2.76,0,5-2.24,5-5C24,12.36,21.95,10.22,19.35,10.04z" },
    { label: "ICE Cloud", x: 575, icon: "M4,15h16v-2H4V15z M4,19h16v-2H4V19z M4,11h16V9H4V11z M4,5v2h16V5H4z" },
    { label: "DR Site", x: 750, icon: "M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z" },
  ] as DiagramNode[],
  security: [
    { label: "Internet", x: 50, icon: "M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M11,19.93c-3.95-0.49-7-3.85-7-7.93c0-0.62,0.08-1.21,0.21-1.79L9,15v1c0,1.1,0.9,2,2,2V19.93z M17.9,17.39c-0.26-0.81-1-1.39-1.9-1.39h-1v-3c0-0.55-0.45-1-1-1H8v-2h2c0.55,0,1-0.45,1-1V7h2c1.1,0,2-0.9,2-2V4.59c2.93,1.19,5,4.06,5,7.41C20,14.08,19.2,15.98,17.9,17.39z" },
    { label: "Firewall", x: 225, icon: "M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z M12,11.99h7c-0.53,4.12-3.28,7.79-7,8.94V12H5V6.3l7-3.11V11.99z" },
    { label: "SIEM / SOC", x: 400, icon: "M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z" },
    { label: "Endpoints", x: 575, icon: "M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V6h16V18z" },
    { label: "Alert Hub", x: 750, icon: "M12,22c1.1,0,2-0.9,2-2h-4C10,21.1,10.9,22,12,22z M18,16v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-0.83-0.67-1.5-1.5-1.5S10.5,3.17,10.5,4v0.68C7.64,5.36,6,7.92,6,11v5l-2,2v1h16v-1L18,16z" },
  ] as DiagramNode[],
  ha: [
    { label: "Production", x: 50, icon: "M2,20h20v-4H2V20z M4,17h2v2H4V17z M2,4v4h20V4H2z M6,7H4V5h2V7z M2,14h20v-4H2V14z M4,11h2v2H4V11z" },
    { label: "Replication", x: 250, icon: "M12,4V1L8,5l4,4V6c3.31,0,6,2.69,6,6c0,1.01-0.25,1.97-0.7,2.8l1.46,1.46C19.54,15.03,20,13.57,20,12C20,7.58,16.42,4,12,4z M12,18c-3.31,0-6-2.69-6-6c0-1.01,0.25-1.97,0.7-2.8L5.24,7.74C4.46,8.97,4,10.43,4,12c0,4.42,3.58,8,8,8v3l4-4l-4-4V18z" },
    { label: "Standby", x: 450, icon: "M2,20h20v-4H2V20z M4,17h2v2H4V17z M2,4v4h20V4H2z M6,7H4V5h2V7z M2,14h20v-4H2V14z M4,11h2v2H4V11z" },
    { label: "Monitor", x: 650, icon: "M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z" },
  ] as DiagramNode[],
} as const;

interface InfrastructureDiagramProps {
  nodes?: DiagramNode[];
  preset?: keyof typeof presets;
}

export default function InfrastructureDiagram({
  nodes: nodesProp,
  preset = "default",
}: InfrastructureDiagramProps = {}) {
  const nodes = nodesProp ?? presets[preset];
  const lastX = nodes[nodes.length - 1].x;
  const viewWidth = lastX + 100;

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop: horizontal SVG */}
      <div className="hidden md:block">
        <svg viewBox={`0 0 ${viewWidth} 160`} className="w-full max-w-5xl mx-auto" aria-label="Infrastructure data flow diagram">
          {/* Connection lines with animated dash + flowing particles */}
          {nodes.slice(0, -1).map((node, i) => {
            const x1 = node.x + 40;
            const x2 = nodes[i + 1].x - 10;
            const pathId = `conn-${i}`;
            return (
              <g key={`line-${i}`}>
                <path
                  id={pathId}
                  d={`M${x1},70 L${x2},70`}
                  stroke="rgba(168,85,247,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  fill="none"
                  className="animate-[dash-flow_2s_linear_infinite]"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                {/* Flowing particle dot */}
                <circle
                  r="3"
                  fill="#049bfb"
                  className="flow-dot"
                  style={{
                    offsetPath: `path("M${x1},70 L${x2},70")`,
                    animationDelay: `${i * 0.4}s`,
                    filter: "drop-shadow(0 0 4px rgba(168,85,247,0.6))",
                  }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.g
              key={node.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
            >
              {/* Glow background */}
              <circle
                cx={node.x + 15}
                cy={70}
                r="24"
                fill="rgba(168,85,247,0.06)"
                stroke="rgba(168,85,247,0.2)"
                strokeWidth="0.75"
                className="animate-[node-glow_3s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.5}s` }}
              />

              {/* Icon */}
              <g transform={`translate(${node.x + 3}, ${70 - 12}) scale(1)`}>
                <path d={node.icon} fill="#049bfb" opacity="0.85" />
              </g>

              {/* Label */}
              <text
                x={node.x + 15}
                y={115}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
                fontFamily="inherit"
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden flex flex-col items-center gap-0">
        {nodes.map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-3 rounded-lg border border-sky-500/15 bg-sky-500/5 px-4 py-2.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-sky-400 fill-current">
                <path d={node.icon} />
              </svg>
              <span className="text-sm text-slate-300">{node.label}</span>
            </div>
            {i < nodes.length - 1 && (
              <div className="h-6 w-px bg-gradient-to-b from-sky-500/30 to-sky-500/10 animate-[dash-flow-v_2s_linear_infinite]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
