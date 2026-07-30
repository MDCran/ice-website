"use client";

import { useEffect, useState } from "react";
import { pushEvent } from "@/lib/analytics";

export type AbBucket = "a" | "b";

/**
 * Sticky A/B assignment (#36). Persists bucket in localStorage per experiment id
 * and fires `experiment_viewed` once per session key.
 */
export function useAbVariant(
  experimentId: string | undefined | null,
  enabled = true,
): AbBucket {
  const [bucket, setBucket] = useState<AbBucket>("a");

  useEffect(() => {
    if (!enabled || !experimentId || typeof window === "undefined") {
      setBucket("a");
      return;
    }

    const key = `ice_ab_${experimentId}`;
    let assigned = localStorage.getItem(key) as AbBucket | null;
    if (assigned !== "a" && assigned !== "b") {
      assigned = Math.random() < 0.5 ? "a" : "b";
      localStorage.setItem(key, assigned);
    }
    setBucket(assigned);

    const seenKey = `ice_ab_seen_${experimentId}`;
    if (!sessionStorage.getItem(seenKey)) {
      sessionStorage.setItem(seenKey, "1");
      pushEvent("experiment_viewed", {
        experiment_id: experimentId,
        variant: assigned,
      });
    }
  }, [experimentId, enabled]);

  return bucket;
}

export function trackAbConversion(experimentId: string | undefined | null, variant: AbBucket) {
  if (!experimentId) return;
  pushEvent("experiment_converted", {
    experiment_id: experimentId,
    variant,
  });
}
