"use client";

import { useEffect } from "react";
import { pushEvent } from "@/lib/analytics";

type MetricName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";

/**
 * Lightweight RUM reporter for Core Web Vitals (#33).
 * Pushes `web_vital` events to the dataLayer and POSTs to /api/analytics/web-vitals.
 */
export default function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;

    const sent = new Set<string>();

    const report = (name: MetricName, value: number, id: string) => {
      const key = `${name}:${id}`;
      if (sent.has(key)) return;
      sent.add(key);

      const rounded = name === "CLS" ? Number(value.toFixed(4)) : Math.round(value);
      pushEvent("web_vital", {
        metric_name: name,
        metric_value: rounded,
        metric_id: id,
        page_path: window.location.pathname,
      });

      void fetch("/api/analytics/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          value: rounded,
          id,
          path: window.location.pathname,
          href: window.location.href,
        }),
        keepalive: true,
      }).catch(() => undefined);
    };

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        if (last) report("LCP", last.startTime, "lcp");
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true } as PerformanceObserverInit);

      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput) clsValue += entry.value ?? 0;
        }
        report("CLS", clsValue, "cls");
      });
      clsObserver.observe({ type: "layout-shift", buffered: true } as PerformanceObserverInit);

      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number; interactionId?: number }>) {
          if (entry.interactionId) report("INP", entry.duration, `inp-${entry.interactionId}`);
        }
      });
      inpObserver.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        inpObserver.disconnect();
      };
    } catch {
      return undefined;
    }
  }, []);

  return null;
}
