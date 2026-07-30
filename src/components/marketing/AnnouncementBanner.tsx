"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, XClose } from "@untitledui/icons";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { MOTION_EASE } from "@/lib/motion";
import { cx } from "@/utils/cx";

export interface AnnouncementBannerContent {
  enabled?: boolean;
  message?: string;
  href?: string;
  cta_label?: string;
  dismissible?: boolean;
  /** Unique id used for localStorage dismiss key. */
  id?: string;
  /** ISO date — hide before this time. */
  starts_at?: string | null;
  /** ISO date — hide after this time. */
  ends_at?: string | null;
}

function isWithinWindow(content: AnnouncementBannerContent, now = Date.now()): boolean {
  if (content.starts_at) {
    const start = Date.parse(content.starts_at);
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (content.ends_at) {
    const end = Date.parse(content.ends_at);
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

/**
 * CMS-driven site announcement strip (site-settings → announcement_banner).
 * Dismiss state is stored in localStorage keyed by banner id.
 */
export default function AnnouncementBanner({ content }: { content?: AnnouncementBannerContent | null }) {
  const isEligible = Boolean(content?.enabled && content.message?.trim() && isWithinWindow(content));
  const [visible, setVisible] = useState(false);
  const reduceMotion = useHydratedReducedMotion();
  const bannerId = content?.id?.trim() || "default";
  const storageKey = `ice-announce-dismissed:${bannerId}`;

  useEffect(() => {
    let visibilityFrame: number | null = null;
    const setVisibilityNextFrame = (nextVisible: boolean) => {
      visibilityFrame = window.requestAnimationFrame(() => setVisible(nextVisible));
    };

    if (!content?.enabled || !content.message?.trim()) {
      setVisibilityNextFrame(false);
      return () => {
        if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame);
      };
    }
    if (!isWithinWindow(content)) {
      setVisibilityNextFrame(false);
      return () => {
        if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame);
      };
    }
    try {
      if (content.dismissible !== false && window.localStorage.getItem(storageKey) === "1") {
        setVisibilityNextFrame(false);
        return () => {
          if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame);
        };
      }
    } catch {
      /* private mode */
    }

    // Resolve the persisted dismissal state before mounting the animated strip,
    // so returning visitors never see a one-frame banner flash.
    setVisibilityNextFrame(true);
    return () => {
      if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame);
    };
  }, [content, storageKey]);

  if (!isEligible || !content?.message) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      if (content.dismissible !== false) window.localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  };

  const inner = (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-medium text-white">
      <span>{content.message}</span>
      {content.href && (
        <span className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
          {content.cta_label ?? "Learn more"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      )}
    </span>
  );

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { height: 0, opacity: 0, y: -6 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={reduceMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: MOTION_EASE }}
          className="relative z-[60] overflow-hidden"
        >
          <div
            role="region"
            aria-label="Site announcement"
            className={cx(
              "relative border-b border-brand-600 bg-brand-solid",
              "px-4 py-2.5 md:px-8",
            )}
          >
            <div className="mx-auto flex max-w-container items-center justify-center gap-3 pr-8">
              {content.href ? (
                <Link href={content.href} className="outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
            {content.dismissible !== false && (
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-white/80 outline-focus-ring transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 md:right-6"
              >
                <XClose className="size-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
