"use client";

import { Calendar } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";

/**
 * Booking embed (#23) — Calendly (or any booking URL) from CMS / env.
 * Renders a CTA + optional iframe when `embed` is true.
 */
export default function BookingEmbed({
  url,
  eyebrow = "Schedule",
  title = "Book a 30-minute assessment",
  description = "Pick a time that works — talk with an ICE specialist about your environment.",
  buttonLabel = "Book a time",
  embed = false,
  location = "booking_embed",
  className,
}: {
  url?: string | null;
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  embed?: boolean;
  location?: string;
  className?: string;
}) {
  const bookingUrl =
    url?.trim() ||
    (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CALENDLY_URL : undefined) ||
    "";

  if (!bookingUrl) return null;

  return (
    <div className={cx("rounded-2xl bg-secondary p-6 ring-1 ring-secondary md:p-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">{eyebrow}</p>
          <h2 className="mt-2 text-display-xs font-semibold text-primary">{title}</h2>
          <p className="mt-2 text-md text-tertiary">{description}</p>
        </div>
        <Button
          size="lg"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          iconLeading={Calendar}
          onClick={() => pushEvent("consultation_cta_clicked", { location, href: bookingUrl })}
        >
          {buttonLabel}
        </Button>
      </div>
      {embed && (
        <div className="mt-6 overflow-hidden rounded-xl bg-primary ring-1 ring-secondary">
          <iframe
            title={title}
            src={bookingUrl}
            className="h-[700px] w-full border-0"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

/** Read booking URL from site-settings `booking` section. */
export { bookingUrlFromSettings } from "@/lib/booking";
