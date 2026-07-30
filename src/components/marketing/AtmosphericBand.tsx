import { cx } from "@/utils/cx";
import type { ReactNode } from "react";

/**
 * Atmospheric section band (#15) — full-bleed light/dark/brand surfaces
 * without forcing a whole-site dark mode.
 */
export default function AtmosphericBand({
  tone = "light",
  children,
  className,
  id,
}: {
  tone?: "light" | "muted" | "dark" | "brand";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const tones = {
    light: "bg-primary text-primary",
    muted: "bg-secondary text-primary",
    dark: "bg-[rgb(4_11_25)] text-white [&_.text-primary]:text-white [&_.text-secondary]:text-white/80 [&_.text-tertiary]:text-white/65 [&_.text-quaternary]:text-white/45",
    brand:
      "bg-brand-solid text-white [&_.text-primary]:text-white [&_.text-secondary]:text-white/90 [&_.text-tertiary]:text-white/75",
  } as const;

  return (
    <section id={id} className={cx("relative isolate overflow-hidden", tones[tone], className)}>
      {tone === "dark" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(4_155_251/0.18),transparent_55%)]"
        />
      )}
      {tone === "brand" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(255_255_255/0.12),transparent_50%)]"
        />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
