"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface MetricRing {
  label: string;
  value: number;
  suffix: string;
  color: string;
}

const metrics: MetricRing[] = [
  { label: "Uptime SLA", value: 99.999, suffix: "%", color: "#049bfb" },
  { label: "Avg Response", value: 12, suffix: "ms", color: "#0474bc" },
  { label: "Threats Blocked", value: 99, suffix: "%", color: "#8b5cf6" },
  { label: "Client Satisfaction", value: 98, suffix: "%", color: "#049bfb" },
];

function CircularProgress({
  metric,
  index,
  inView,
}: {
  metric: MetricRing;
  index: number;
  inView: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      const normalized =
        metric.suffix === "ms"
          ? Math.min(metric.value / 20, 1) * 100
          : metric.value;
      setProgress(normalized);
    }, index * 200);
    return () => clearTimeout(timer);
  }, [inView, metric.value, metric.suffix, index]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/[0.06]"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={metric.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 8px ${metric.color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl sm:text-2xl font-bold"
            style={{ color: metric.color }}
          >
            {inView ? metric.value : 0}
            {metric.suffix}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400 font-medium">{metric.label}</p>
    </motion.div>
  );
}

export default function DataVisualization() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {metrics.map((metric, i) => (
        <CircularProgress
          key={metric.label}
          metric={metric}
          index={i}
          inView={inView}
        />
      ))}
    </div>
  );
}
