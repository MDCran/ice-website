"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";

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

  return (
    <div ref={containerRef} className="glass-card rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-8 text-center">{title}</h3>

      {mode === "features" ? (
        /* ── Feature Comparison Table ──────────────────────────────────── */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-semibold text-slate-300 pb-4 pr-4">
                  Feature
                </th>
                <th className="text-center text-sm font-semibold text-slate-400 pb-4 px-4 w-36">
                  Without ICE
                </th>
                <th className="text-center text-sm font-semibold text-sky-400 pb-4 pl-4 w-36">
                  With ICE
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                    ease: "easeOut" as const,
                  }}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="py-4 pr-4 text-sm text-slate-300">{row.label}</td>
                  <td className="py-4 px-4 text-center">
                    {row.withoutICE ? (
                      <Check className="h-5 w-5 text-sky-400 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 pl-4 text-center">
                    {row.withICE ? (
                      <Check className="h-5 w-5 text-sky-400 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600 mx-auto" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Before / After Bar Chart ─────────────────────────────────── */
        <div className="space-y-6">
          {data.map((row, i) => {
            const maxVal = Math.max(row.before ?? 0, row.after ?? 0, 1);

            return (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: "easeOut" as const,
                }}
              >
                <p className="text-sm font-medium text-slate-300 mb-2">{row.label}</p>

                {/* Before bar */}
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-slate-500 w-14 shrink-0">Before</span>
                  <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-md bg-slate-600/60"
                      initial={{ width: 0 }}
                      animate={
                        isVisible
                          ? { width: `${((row.before ?? 0) / maxVal) * 100}%` }
                          : { width: 0 }
                      }
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1 + 0.3,
                        ease: "easeOut" as const,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right shrink-0">
                    {row.before ?? 0}%
                  </span>
                </div>

                {/* After bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sky-400 w-14 shrink-0">After</span>
                  <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-md bg-gradient-to-r from-sky-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={
                        isVisible
                          ? { width: `${((row.after ?? 0) / maxVal) * 100}%` }
                          : { width: 0 }
                      }
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1 + 0.5,
                        ease: "easeOut" as const,
                      }}
                    />
                  </div>
                  <span className="text-xs text-sky-400 w-10 text-right shrink-0">
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
