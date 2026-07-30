"use client";

import { useEffect, useState } from "react";
import { Phone01, Calendar } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

/**
 * Sticky contextual CTA rail for solution pages — appears after the hero
 * scrolls out of view. Compact; does not overlay primary content on mobile
 * until scrolled.
 */
export default function StickySolutionCta({
  title = "Talk with an ICE specialist",
  phoneHref = "tel:18007869188",
  phoneLabel = "1-800-786-9188",
  consultHref = "/contact",
  consultLabel = "Book a consultation",
  /** Element id that must leave the viewport before the rail shows. */
  heroId = "solution-hero",
}: {
  title?: string;
  phoneHref?: string;
  phoneLabel?: string;
  consultHref?: string;
  consultLabel?: string;
  heroId?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero || typeof IntersectionObserver === "undefined") {
      const onScroll = () => setShow(window.scrollY > 480);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [heroId]);

  return (
    <div
      aria-hidden={!show}
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 transition duration-300 md:p-4",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <div
        className={cx(
          "pointer-events-auto flex w-full max-w-3xl flex-col items-stretch gap-2 rounded-2xl bg-primary/95 p-3 shadow-2xl ring-1 ring-secondary backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3",
          "dark:bg-primary/90",
          !show && "invisible",
        )}
      >
        <p className="px-1 text-sm font-semibold text-primary sm:text-md">{title}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button color="secondary" size="md" href={phoneHref} iconLeading={Phone01} className="justify-center">
            {phoneLabel}
          </Button>
          <Button size="md" href={consultHref} iconLeading={Calendar} className="justify-center">
            {consultLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
