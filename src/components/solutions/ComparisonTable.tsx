"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, XClose } from "@untitledui/icons";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ComparisonRow {
  label: string;
  before?: number;
  after?: number;
  withoutICE?: boolean;
  withICE?: boolean;
}

interface ComparisonTableProps {
  mode: "features" | "beforeAfter";
  title: string;
  data: ComparisonRow[];
}

export default function ComparisonTable({ mode, title, data }: ComparisonTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = useHydratedReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rowHidden = reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 };
  const rowVisible = reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };

  return (
    <div ref={containerRef} className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <div className="px-4 py-5 md:px-6">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
      </div>
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />

      {mode === "features" ? (
        /* ── Feature Comparison Table ──────────────────────────────────── */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-mono text-xs font-semibold tracking-wide text-quaternary uppercase md:px-6"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="w-36 px-4 py-3 text-center font-mono text-xs font-semibold tracking-wide text-quaternary uppercase"
                >
                  Without ICE
                </th>
                <th
                  scope="col"
                  className="w-36 px-4 py-3 text-center font-mono text-xs font-semibold tracking-wide text-brand-secondary uppercase md:px-6"
                >
                  With ICE
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr
                  key={row.label}
                  initial={rowHidden}
                  animate={isVisible ? rowVisible : rowHidden}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : i * 0.06,
                    ease: EASE,
                  }}
                  className="border-t border-secondary transition-colors duration-150 first:border-t-0 hover:bg-secondary/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-primary md:px-6">{row.label}</td>
                  <td className="px-4 py-4 text-center">
                    {row.withoutICE ? (
                      <Check className="mx-auto size-5 text-fg-success-primary" aria-hidden="true" />
                    ) : (
                      <XClose className="mx-auto size-5 text-fg-quaternary" aria-hidden="true" />
                    )}
                    <span className="sr-only">{row.withoutICE ? "Included" : "Not included"}</span>
                  </td>
                  <td className="px-4 py-4 text-center md:px-6">
                    {row.withICE ? (
                      <Check className="mx-auto size-5 text-fg-success-primary" aria-hidden="true" />
                    ) : (
                      <XClose className="mx-auto size-5 text-fg-quaternary" aria-hidden="true" />
                    )}
                    <span className="sr-only">{row.withICE ? "Included" : "Not included"}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Before / After Bar Chart ─────────────────────────────────── */
        <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
          {data.map((row, i) => {
            const maxVal = Math.max(row.before ?? 0, row.after ?? 0, 1);

            return (
              <motion.div
                key={row.label}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={
                  isVisible
                    ? reduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0 }
                    : reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 12 }
                }
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : i * 0.1,
                  ease: EASE,
                }}
              >
                <p className="mb-2 text-sm font-medium text-secondary">{row.label}</p>

                {/* Before bar */}
                <div className="mb-1.5 flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-xs font-medium text-quaternary">Before</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-tertiary">
                    <motion.div
                      className="h-full rounded-full bg-fg-quaternary"
                      initial={{ width: 0 }}
                      animate={
                        isVisible
                          ? { width: `${((row.before ?? 0) / maxVal) * 100}%` }
                          : { width: 0 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.8,
                        delay: reduceMotion ? 0 : i * 0.1 + 0.3,
                        ease: EASE,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs font-medium text-quaternary tabular-nums">
                    {row.before ?? 0}%
                  </span>
                </div>

                {/* After bar */}
                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-xs font-medium text-brand-secondary">After</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-tertiary">
                    <motion.div
                      className="h-full rounded-full bg-brand-solid"
                      initial={{ width: 0 }}
                      animate={
                        isVisible
                          ? { width: `${((row.after ?? 0) / maxVal) * 100}%` }
                          : { width: 0 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.8,
                        delay: reduceMotion ? 0 : i * 0.1 + 0.5,
                        ease: EASE,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs font-medium text-brand-secondary tabular-nums">
                    {row.after ?? 0}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
