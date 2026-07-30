"use client";

import { useEffect, useState, type FC } from "react";
import { motion } from "motion/react";
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
import { MOTION_EASE } from "@/lib/motion";
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

/**
 * Read-only architecture flow. The active layer advances automatically while
 * light packets continuously travel through the complete pipeline.
 */
export default function InteractiveArchitecture({
  nodes = DEFAULT_NODES,
  className,
}: {
  nodes?: ArchitectureNode[];
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const [cycleIndex, setCycleIndex] = useState(0);
  const activeIndex = Math.min(cycleIndex, Math.max(0, nodes.length - 1));
  const active = nodes[activeIndex];
  const lastIndex = Math.max(1, nodes.length - 1);
  const progress = activeIndex / lastIndex;

  useEffect(() => {
    if (reduceMotion || nodes.length <= 1) return;

    const timer = window.setInterval(() => {
      setCycleIndex((current) => (current + 1) % nodes.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [nodes.length, reduceMotion]);

  if (nodes.length === 0 || !active) return null;

  return (
    <div className={cx("w-full", className)}>
      {/* Desktop: horizontal glowing pipeline */}
      <div className="relative hidden md:block">
        {/* Soft section glow under the rail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-[8%] left-[8%] h-16 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(4_155_251/0.14),transparent_70%)] blur-2xl"
        />

        <ol
          className="relative mx-auto grid max-w-5xl gap-3"
          style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}
          aria-label="Enterprise data flow"
        >
          {/* Base rail */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[2.35rem] right-[calc(100%/12)] left-[calc(100%/12)] h-[3px] overflow-visible rounded-full bg-secondary"
          >
            {!reduceMotion && (
              <>
                <span className="ice-arch-rail-flow absolute inset-y-0 left-0 w-24 rounded-full" />
                <span className="ice-arch-rail-flow ice-arch-rail-flow-delayed absolute inset-y-0 left-0 w-14 rounded-full" />
              </>
            )}
            {/* Energized path — grows to the active node */}
            <motion.div
              className="relative h-full w-full origin-left overflow-hidden rounded-full bg-gradient-to-r from-brand-500/50 via-brand-solid to-brand-400"
              initial={false}
              animate={{ scaleX: reduceMotion ? 1 : Math.max(0.015, progress) }}
              transition={{
                duration: reduceMotion ? 0 : activeIndex === 0 ? 0.22 : 0.85,
                ease: MOTION_EASE,
              }}
              style={{
                boxShadow:
                  "0 0 12px rgb(4 155 251 / 0.55), 0 0 28px rgb(4 155 251 / 0.25)",
              }}
            >
              {/* Flowing current sheen along the lit path */}
              {!reduceMotion && (
                <span className="ice-arch-pipeline-sheen absolute inset-y-0 left-0 w-1/3" />
              )}
            </motion.div>

            {/* Pulse tip at the leading edge */}
            <motion.span
              aria-hidden="true"
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-solid"
              initial={false}
              animate={{ left: reduceMotion ? "100%" : `${progress * 100}%` }}
              transition={{
                duration: reduceMotion ? 0 : activeIndex === 0 ? 0.22 : 0.85,
                ease: MOTION_EASE,
              }}
              style={{
                boxShadow:
                  "0 0 10px 2px rgb(4 155 251 / 0.9), 0 0 24px 6px rgb(4 155 251 / 0.45)",
              }}
            />
          </div>

          {nodes.map((node, i) => {
            const selected = node.id === active?.id;
            const reached = i <= activeIndex;
            const Icon = node.icon;

            return (
              <li
                key={node.id}
                aria-current={selected ? "step" : undefined}
                className="relative flex justify-center"
              >
                <div
                  className={cx(
                    "relative z-[1] flex w-full flex-col items-center gap-3 rounded-xl px-2 py-3 text-center transition duration-500",
                    selected && "bg-brand-primary_alt/80",
                  )}
                >
                  {/* Node glow disc */}
                  <span
                    aria-hidden="true"
                    className={cx(
                      "pointer-events-none absolute top-3 left-1/2 -z-10 size-16 -translate-x-1/2 rounded-full transition-opacity duration-500",
                      selected
                        ? "bg-[radial-gradient(circle,rgb(4_155_251/0.35),transparent_70%)] opacity-100"
                        : reached
                          ? "bg-[radial-gradient(circle,rgb(4_155_251/0.12),transparent_70%)] opacity-80"
                          : "opacity-0",
                    )}
                  />

                  <span
                    className={cx(
                      "relative rounded-full p-0.5 transition duration-300",
                      !reduceMotion && "ice-arch-node-breathe",
                      selected &&
                        "ring-2 ring-brand-solid ring-offset-2 ring-offset-primary",
                      reached && !selected && "ring-1 ring-brand/30",
                    )}
                    style={
                      selected
                        ? {
                            boxShadow:
                              "0 0 0 1px rgb(4 155 251 / 0.35), 0 0 22px rgb(4 155 251 / 0.45)",
                          }
                        : undefined
                    }
                  >
                    <FeaturedIcon
                      icon={Icon}
                      size="lg"
                      color="brand"
                      theme={selected || reached ? "light" : "modern"}
                    />
                    {/* Live pulse ring on the active node */}
                    {selected && !reduceMotion && (
                      <span
                        aria-hidden="true"
                        className="ice-arch-node-pulse pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-solid/60"
                      />
                    )}
                  </span>

                  <span
                    className={cx(
                      "text-sm font-semibold transition-colors",
                      selected
                        ? "text-brand-secondary"
                        : reached
                          ? "text-secondary"
                          : "text-quaternary",
                    )}
                  >
                    {node.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: chips + mini progress rail */}
      <div className="md:hidden">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-brand-solid"
            initial={false}
            animate={{ scaleX: reduceMotion ? 1 : Math.max(0.015, progress) }}
            transition={{
              duration: reduceMotion ? 0 : activeIndex === 0 ? 0.22 : 0.85,
              ease: MOTION_EASE,
            }}
            style={{
              boxShadow: "0 0 10px rgb(4 155 251 / 0.5)",
            }}
          />
        </div>
        <ol className="flex flex-wrap justify-center gap-2" aria-label="Enterprise data flow">
          {nodes.map((node, i) => {
            const selected = node.id === active?.id;
            const reached = i <= activeIndex;
            const Icon = node.icon;
            return (
              <li
                key={node.id}
                aria-current={selected ? "step" : undefined}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition duration-500",
                  selected
                    ? "bg-brand-solid text-white shadow-[0_0_18px_rgb(4_155_251/0.4)]"
                    : reached
                      ? "bg-brand-primary_alt text-brand-secondary ring-1 ring-brand/30"
                      : "bg-secondary text-secondary ring-1 ring-secondary",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {node.label}
              </li>
            );
          })}
        </ol>
      </div>

      {active && (
        <motion.div
          key={active.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: MOTION_EASE }}
          className="relative mx-auto mt-8 min-h-44 max-w-3xl border-t border-secondary pt-8 md:mt-10"
          role="region"
          aria-live="off"
          aria-label={`${active.label} details`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-px left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-solid to-transparent opacity-70"
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                Layer {activeIndex + 1} of {nodes.length}
              </p>
              <h3 className="mt-2 text-display-xs font-semibold text-primary">{active.label}</h3>
              <p className="mt-2 text-md text-tertiary">{active.summary}</p>
            </div>
            <ul className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
              {active.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2 text-sm text-secondary before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-brand-solid before:content-['']"
                >
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
