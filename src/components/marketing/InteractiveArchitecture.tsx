"use client";

import { useEffect, useRef, useState, type FC } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
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
 * Interactive architecture flow. The energized path follows reading progress,
 * while click/focus still lets a visitor inspect any layer directly.
 */
export default function InteractiveArchitecture({
  nodes = DEFAULT_NODES,
  className,
}: {
  nodes?: ArchitectureNode[];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const [activeId, setActiveId] = useState(nodes[0]?.id ?? "");
  const [announceSelection, setAnnounceSelection] = useState(false);
  const active = nodes.find((n) => n.id === activeId) ?? nodes[0];
  const activeIndex = Math.max(
    0,
    nodes.findIndex((n) => n.id === activeId),
  );
  const lastIndex = Math.max(1, nodes.length - 1);
  const scrubProgress = useMotionValue(reduceMotion ? 1 : 0);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start 82%", "end 32%"],
  });
  const tipLeft = useTransform(
    scrubProgress,
    (latest) => `${Math.max(0, Math.min(1, latest)) * 100}%`,
  );

  const selectNode = (id: string) => {
    setActiveId(id);
    setAnnounceSelection(true);
    const index = nodes.findIndex((node) => node.id === id);
    if (!reduceMotion && index >= 0) scrubProgress.set(index / lastIndex);
  };

  useEffect(() => {
    scrubProgress.set(reduceMotion ? 1 : scrollYProgress.get());
  }, [reduceMotion, scrubProgress, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reduceMotion || nodes.length === 0) return;

    scrubProgress.set(latest);
    const nextIndex = Math.min(nodes.length - 1, Math.round(latest * lastIndex));
    const nextId = nodes[nextIndex]?.id;
    if (nextId && nextId !== activeId) {
      setAnnounceSelection(false);
      setActiveId(nextId);
    }
  });

  return (
    <div ref={rootRef} className={cx("w-full", className)}>
      {/* Desktop: horizontal glowing pipeline */}
      <div className="relative hidden md:block">
        {/* Soft section glow under the rail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-[8%] left-[8%] h-16 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(4_155_251/0.14),transparent_70%)] blur-2xl"
        />

        <ol className="relative mx-auto grid max-w-5xl grid-cols-6 gap-3">
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
              style={{
                scaleX: reduceMotion ? 1 : scrubProgress,
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
              style={{
                left: reduceMotion ? "100%" : tipLeft,
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
              <li key={node.id} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => selectNode(node.id)}
                  onFocus={() => selectNode(node.id)}
                  aria-pressed={selected}
                  className={cx(
                    "group relative z-[1] flex w-full flex-col items-center gap-3 rounded-xl px-2 py-3 text-center outline-focus-ring transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
                    selected ? "bg-brand-primary_alt/80" : "hover:bg-secondary/80",
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
                </button>
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
            style={{
              scaleX: reduceMotion ? 1 : scrubProgress,
              boxShadow: "0 0 10px rgb(4 155 251 / 0.5)",
            }}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {nodes.map((node, i) => {
            const selected = node.id === active?.id;
            const reached = i <= activeIndex;
            const Icon = node.icon;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => selectNode(node.id)}
                aria-pressed={selected}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium outline-focus-ring transition focus-visible:outline-2 focus-visible:outline-offset-2",
                  selected
                    ? "bg-brand-solid text-white shadow-[0_0_18px_rgb(4_155_251/0.4)]"
                    : reached
                      ? "bg-brand-primary_alt text-brand-secondary ring-1 ring-brand/30"
                      : "bg-secondary text-secondary ring-1 ring-secondary hover:text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {node.label}
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <motion.div
          key={active.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: MOTION_EASE }}
          className="relative mx-auto mt-8 max-w-3xl border-t border-secondary pt-8 md:mt-10"
          role="region"
          aria-live={announceSelection ? "polite" : "off"}
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
