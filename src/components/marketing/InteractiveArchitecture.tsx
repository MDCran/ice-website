"use client";

import { useEffect, useState, type FC } from "react";
import {
  Cloud01,
  Database01,
  Monitor04,
  RefreshCw01,
  Server03,
  Shield01,
} from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cx } from "@/utils/cx";

type IconComponent = FC<{ className?: string }>;

export interface ArchitectureNode {
  id: string;
  label: string;
  icon: IconComponent;
  summary: string;
  details: string[];
}

const DEFAULT_NODES: ArchitectureNode[] = [
  {
    id: "client",
    label: "Enterprise edge",
    icon: Monitor04,
    summary: "Workstations, ERP clients, and plant-floor systems that connect into ICE.",
    details: ["Desktops & thin clients", "ERP / MES apps", "Secure remote access"],
  },
  {
    id: "firewall",
    label: "Firewall",
    icon: Shield01,
    summary: "Perimeter and segmentation controls",
    details: ["Next-gen firewall", "Zero-trust policies", "Threat inspection"],
  },
  {
    id: "lb",
    label: "Load Balancer",
    icon: Server03,
    summary: "Traffic distribution and health checks",
    details: ["Active health probes", "Failover routing", "TLS termination"],
  },
  {
    id: "cloud",
    label: "Cloud Servers",
    icon: Cloud01,
    summary: "Managed compute for critical workloads",
    details: ["IBM Power & x86", "Hybrid / private options", "24/7 operations"],
  },
  {
    id: "storage",
    label: "Storage",
    icon: Database01,
    summary: "Enterprise storage with redundancy",
    details: ["Flash systems", "Replication", "Encryption at rest"],
  },
  {
    id: "backup",
    label: "Backup",
    icon: RefreshCw01,
    summary: "Protected copies with defined RPO/RTO",
    details: ["Immutable options", "Geo-separated copies", "Tested recovery"],
  },
];

export default function InteractiveArchitecture({
  nodes = DEFAULT_NODES,
  className,
  flowAriaLabel = "Enterprise data flow",
  pathAriaLabel = "Live enterprise infrastructure path",
  pathLabel = "Live managed path",
  activeLayerLabel = "Active layer",
}: {
  nodes?: ArchitectureNode[];
  className?: string;
  flowAriaLabel?: string;
  pathAriaLabel?: string;
  pathLabel?: string;
  activeLayerLabel?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const firstNode = nodes[0];
  const finalNode = nodes[nodes.length - 1];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeNode = nodes[activeIndex] ?? firstNode;

  useEffect(() => {
    if (reduceMotion || nodes.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % nodes.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [nodes.length, reduceMotion]);

  if (nodes.length === 0 || !firstNode || !finalNode) return null;

  return (
    <div className={cx("w-full", className)}>
      <div className="relative hidden md:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-[6%] left-[6%] h-24 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(4_155_251/0.18),transparent_70%)] blur-2xl"
        />

        <div className="relative mx-auto max-w-5xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[2.35rem] right-[calc(100%/12)] left-[calc(100%/12)] h-1.5 overflow-hidden rounded-full bg-secondary/80 ring-1 ring-brand/15"
          >
            <span
              className={cx(
                "absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_18px_rgb(4_155_251/0.55)]",
                !reduceMotion && "ice-arch-progress-stream ice-arch-flow-fill",
              )}
              style={{
                width: `${reduceMotion || nodes.length === 1 ? 100 : Math.max(6, (activeIndex / (nodes.length - 1)) * 100)}%`,
                transition: reduceMotion ? "none" : "width 900ms cubic-bezier(0.45, 0, 0.2, 1)",
              }}
            />
            {!reduceMotion && (
              <>
                <span className="ice-arch-rail-flow absolute inset-y-0 left-0 w-24 rounded-full" />
                <span className="ice-arch-rail-flow ice-arch-rail-flow-delayed absolute inset-y-0 left-0 w-16 rounded-full" />
                <span className="ice-arch-rail-flow ice-arch-rail-flow-fast absolute inset-y-0 left-0 w-10 rounded-full" />
              </>
            )}
          </div>

          <ol
            className="relative grid gap-3"
            style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}
            aria-label={flowAriaLabel}
          >
            {nodes.map((node, index) => {
              const Icon = node.icon;

              return (
                <li key={node.id} className="relative flex justify-center">
                  <div
                    className="relative z-[1] flex w-full cursor-default flex-col items-center gap-3 rounded-xl px-2 py-3 text-center"
                    aria-current={index === activeIndex ? "step" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "pointer-events-none absolute top-3 left-1/2 -z-10 size-16 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(4_155_251/0.18),transparent_70%)] opacity-80 transition-opacity duration-500",
                        !reduceMotion && "ice-arch-node-live",
                        index === activeIndex && "ice-arch-node-active",
                      )}
                      style={!reduceMotion ? { animationDelay: `${index * 0.18}s` } : undefined}
                    />

                    <span
                      className={cx(
                        "relative rounded-full p-0.5 ring-1 ring-brand/30 transition duration-500",
                        !reduceMotion && "ice-arch-node-breathe",
                        index === activeIndex && "ring-brand-solid/75",
                      )}
                      style={{
                        animationDelay: !reduceMotion ? `${index * 0.14}s` : undefined,
                        boxShadow: "0 0 0 1px rgb(4 155 251 / 0.18), 0 0 18px rgb(4 155 251 / 0.22)",
                      }}
                    >
                      <FeaturedIcon icon={Icon} size="lg" color="brand" theme="light" />
                      {!reduceMotion && (
                        <span
                          aria-hidden="true"
                          className="ice-arch-node-pulse pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-solid/45"
                          style={{ animationDelay: `${index * 0.28}s` }}
                        />
                      )}
                    </span>

                    <span className={cx("text-sm font-semibold transition-colors", index === activeIndex ? "text-brand-secondary" : "text-secondary")}>
                      {node.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cx(
              "h-full w-full rounded-full bg-gradient-to-r from-brand-500 via-sky-200 to-emerald-300 shadow-[0_0_10px_rgb(4_155_251/0.5)]",
              !reduceMotion && "ice-arch-progress-stream ice-arch-flow-fill",
            )}
          />
        </div>
        <ol className="flex flex-wrap justify-center gap-2" aria-label={flowAriaLabel}>
          {nodes.map((node, index) => {
            const Icon = node.icon;

            return (
              <li
                key={node.id}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full bg-brand-primary_alt px-3 py-1.5 text-sm font-medium text-brand-secondary ring-1 ring-brand/30 shadow-[0_0_14px_rgb(4_155_251/0.16)]",
                  !reduceMotion && "ice-arch-node-live",
                  index === activeIndex && "ice-arch-node-active",
                )}
                style={!reduceMotion ? { animationDelay: `${index * 0.16}s` } : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {node.label}
              </li>
            );
          })}
        </ol>
      </div>

      <div
        className="ice-arch-layer-card relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-brand/20 bg-primary/80 p-5 shadow-[0_20px_50px_rgb(15_23_42/0.08)] ring-1 ring-white/60 md:mt-10 md:p-6 dark:ring-white/[0.04]"
        role="region"
        aria-label={pathAriaLabel}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-solid to-transparent opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl"
        />
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {pathLabel}
            </p>
              <div key={activeNode.id} className={!reduceMotion ? "ice-arch-detail-enter" : undefined}>
                <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">{activeLayerLabel} · {activeNode.label}</p>
                <h3 className="mt-2 text-display-xs font-semibold text-primary">
                  {firstNode.label} to {activeNode.label}
                </h3>
                <p className="mt-2 text-md text-tertiary">{activeNode.summary}</p>
              </div>
          </div>
          <ul className="grid min-w-0 gap-2 sm:grid-cols-3 md:grid-cols-1">
            {(activeNode.details.length ? activeNode.details : [activeNode.summary]).map((detail) => (
              <li
                key={detail}
                className={cx("flex items-start gap-2 rounded-xl border border-secondary/80 bg-secondary/55 px-3 py-2 text-sm text-secondary shadow-[0_8px_24px_rgb(15_23_42/0.04)]", !reduceMotion && "ice-arch-detail-item-enter")}
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-solid shadow-[0_0_10px_rgb(4_155_251/0.65)]" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
