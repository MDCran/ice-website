"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { useInView } from "motion/react";
import { formatCountValue, useCountUp } from "@/hooks/useCountUp";
import { cx } from "@/utils/cx";

const NUMBER_TOKEN_RE = /\d[\d,]*(?:\.\d+)?/g;

interface ParsedStat {
  prefix: string;
  target: number;
  decimals: number;
  grouped: boolean;
  rest: string;
}

/** Extracts the first numeric run from a stat value, keeping surrounding text intact. */
export function parseStatValue(raw: unknown): ParsedStat | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const decimals = String(raw).split(".")[1]?.length ?? 0;
    return { prefix: "", target: raw, decimals, grouped: false, rest: "" };
  }
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/^([^0-9]*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!match) return null;
  const [, prefix = "", num = "", rest = ""] = match;
  const target = Number.parseFloat(num.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const decimals = num.includes(".") ? (num.split(".")[1]?.length ?? 0) : 0;
  return { prefix, target, decimals, grouped: num.includes(","), rest };
}

/**
 * Single numeric display that counts 0 → target when the host grid (or itself) enters view.
 * Never wrap this in an opacity:0 reveal — pass `inView` from an opaque parent instead.
 */
export function CountUpNumber({
  target,
  suffix = "",
  inView,
  decimals,
  duration = 1400,
  className,
}: {
  target: number;
  suffix?: string;
  inView: boolean;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const resolvedDecimals =
    decimals ?? (Number.isInteger(target) ? 0 : (String(target).split(".")[1]?.length ?? 0));
  const count = useCountUp(target, inView, {
    duration,
    decimals: resolvedDecimals,
    elementRef: ref,
  });

  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {formatCountValue(count, resolvedDecimals, resolvedDecimals === 0 && target >= 1000)}
      {suffix}
    </span>
  );
}

/** Stat value (number or string with a leading number) that counts up once in view. */
export function CountUpStat({
  value,
  suffix = "",
  inView: inViewProp,
  duration = 1400,
  className,
}: {
  value: unknown;
  suffix?: string;
  inView?: boolean;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const selfInView = useInView(ref, { once: true, amount: 0.35 });
  const inView = inViewProp ?? selfInView;
  const parsed = parseStatValue(value);

  const count = useCountUp(parsed?.target ?? 0, Boolean(parsed) && inView, {
    duration,
    decimals: parsed?.decimals ?? 0,
    elementRef: ref,
  });

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {String(value ?? "")}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {parsed.prefix}
      {formatCountValue(count, parsed.decimals, parsed.grouped)}
      {parsed.rest}
      {suffix}
    </span>
  );
}

/**
 * Renders any string and counts every numeric token up from 0 when in view
 * ("35+", "99.99%", "14,723", "24/7/365"). Non-numeric suffixes stay static.
 */
export function CountUpText({
  value,
  suffix = "",
  inView: inViewProp,
  duration = 1400,
  className,
}: {
  value: string;
  suffix?: string;
  inView?: boolean;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const selfInView = useInView(ref, { once: true, amount: 0.35 });
  const inView = inViewProp ?? selfInView;

  const tokens = value.match(NUMBER_TOKEN_RE);
  if (!tokens) {
    return (
      <span ref={ref} className={className}>
        {value}
        {suffix}
      </span>
    );
  }

  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of value.matchAll(NUMBER_TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(value.slice(last, idx));
    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, "")) || 0;
    const decimals = raw.includes(".") ? (raw.split(".")[1]?.length ?? 0) : 0;
    const grouped = raw.includes(",");
    parts.push(
      <CountUpToken
        key={`n-${key++}`}
        target={target}
        decimals={decimals}
        grouped={grouped}
        inView={inView}
        duration={duration}
        hostRef={ref}
      />,
    );
    last = idx + raw.length;
  }
  if (last < value.length) parts.push(value.slice(last));

  return (
    <span ref={ref} className={className}>
      {parts}
      {suffix}
    </span>
  );
}

function CountUpToken({
  target,
  decimals,
  grouped,
  inView,
  duration,
  hostRef,
}: {
  target: number;
  decimals: number;
  grouped: boolean;
  inView: boolean;
  duration: number;
  hostRef: RefObject<HTMLSpanElement | null>;
}) {
  const count = useCountUp(target, inView, {
    duration,
    decimals,
    elementRef: hostRef,
  });
  return <>{formatCountValue(count, decimals, grouped)}</>;
}
