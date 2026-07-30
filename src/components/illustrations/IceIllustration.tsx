"use client";

import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import { FloatY, PulseGlow } from "@/components/effects/AmbientMotion";
import {
  ILLUSTRATION_SIZE_PRESETS,
  getIllustration,
  type IllustrationSizePreset,
} from "@/lib/illustrations";
import { cx } from "@/utils/cx";

/**
 * Unified ICE illustration surface (#55) — registry size presets + ambient float
 * + soft brand glow so solution/CMS illustrations share one visual language.
 */
export default function IceIllustration({
  id,
  size = "card",
  float = true,
  glow = true,
  className,
  caption,
}: {
  id: string;
  size?: IllustrationSizePreset;
  float?: boolean;
  glow?: boolean;
  className?: string;
  caption?: string;
}) {
  const meta = getIllustration(id);
  const preset = ILLUSTRATION_SIZE_PRESETS[size ?? meta?.defaultSize ?? "card"];

  const art = (
    <div className={cx("relative mx-auto", preset.className, className)}>
      {glow && (
        <PulseGlow
          className="inset-x-6 inset-y-4 -z-10 rounded-full bg-brand-500/15 blur-2xl"
          duration={9}
          from={0.35}
          to={0.7}
        />
      )}
      <IllustrationRenderer id={id} className="h-full w-full" />
    </div>
  );

  return (
    <figure className="mx-auto w-full max-w-xl">
      {float ? <FloatY distance={8} duration={7}>{art}</FloatY> : art}
      {caption !== "" && (caption || meta?.name) && (
        <figcaption className="mt-3 text-center text-xs text-quaternary">
          {caption || meta?.name}
          {meta?.category ? ` · ${meta.category}` : ""}
        </figcaption>
      )}
    </figure>
  );
}
