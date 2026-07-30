"use client";

import InfiniteMarquee from "@/components/effects/InfiniteMarquee";
import { cx } from "@/utils/cx";

/**
 * Continuous proof ticker — refined motion strip for trust claims.
 * Repeats items enough times to fill wide viewports, then scrolls seamlessly.
 */
export default function ProofTicker({
  items,
  className,
  label = "Enterprise credentials",
}: {
  items: string[];
  className?: string;
  label?: string;
}) {
  const list = items.filter(Boolean);
  if (list.length === 0) return null;

  // Repeat so a single track is always wider than typical desktop viewports
  // (avoids sparse whitespace when CMS only supplies a few labels).
  const minItems = 12;
  const repeats = Math.max(2, Math.ceil(minItems / list.length));
  const trackItems = Array.from({ length: repeats }, (_, copy) =>
    list.map((item) => ({ item, key: `${copy}-${item}` })),
  ).flat();

  return (
    <div
      role="region"
      aria-label={label}
      className={cx("overflow-hidden border-y border-secondary bg-secondary/60 py-3.5", className)}
    >
      <InfiniteMarquee
        durationSec={96}
        pauseOnHover
        renderTrack={() => (
          <ul className="flex items-center">
            {trackItems.map(({ item, key }) => (
              <li
                key={key}
                className="flex shrink-0 items-center gap-6 px-5 text-xs font-medium tracking-[0.14em] text-tertiary/80 uppercase sm:gap-8 sm:px-6"
              >
                <span className="whitespace-nowrap">{item}</span>
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand-solid/55" />
              </li>
            ))}
          </ul>
        )}
      />
    </div>
  );
}
