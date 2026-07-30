"use client";

import type { ReactNode } from "react";
import { useAbVariant, trackAbConversion, type AbBucket } from "@/hooks/useAbVariant";

/**
 * CMS-driven A/B headline (#36). When `experimentId` + `variantB` are set,
 * visitors are sticky-bucketed and the winning copy is rendered.
 */
export default function AbHeadline({
  experimentId,
  variantA,
  variantB,
  as: Tag = "h1",
  className,
  children,
}: {
  experimentId?: string | null;
  variantA: string;
  variantB?: string | null;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  children?: (args: { text: string; variant: AbBucket }) => ReactNode;
}) {
  const enabled = Boolean(experimentId && variantB?.trim());
  const variant = useAbVariant(experimentId, enabled);
  const text = enabled && variant === "b" && variantB ? variantB : variantA;

  if (children) {
    return <>{children({ text, variant })}</>;
  }

  return (
    <Tag className={className} data-ab-variant={enabled ? variant : undefined}>
      {text}
    </Tag>
  );
}

export function fireAbConversion(experimentId: string | undefined | null, variant: AbBucket) {
  trackAbConversion(experimentId, variant);
}
