"use client";

import { useState, useEffect, useRef, useCallback, type ComponentType } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, Download, Loader2, Smartphone, Maximize, Minimize } from "lucide-react";
import SlideRenderer, { NATIVE_W, NATIVE_H } from "./SlideRenderer";
import SlideBackground from "./SlideBackground";
import SlideTitle from "./slides/SlideTitle";
import SlideArchitecture from "./slides/SlideArchitecture";
import SlideRisks from "./slides/SlideRisks";
import SlideSolution from "./slides/SlideSolution";
import SlideComparison from "./slides/SlideComparison";
import SlideCost from "./slides/SlideCost";
import SlideOutcome from "./slides/SlideOutcome";
import SlideTimeline from "./slides/SlideTimeline";
import SlideInvestment from "./slides/SlideInvestment";
import SlideCTA from "./slides/SlideCTA";
import generateSlidePdf from "./generateSlidePdf";

/* ── Slide list ─────────────────────────────────────────────── */

export interface SlideProps { active?: boolean }

const SLIDES: { key: string; Component: ComponentType<SlideProps>; interactive?: boolean }[] = [
  { key: "title", Component: SlideTitle },
  { key: "risks", Component: SlideRisks },
  { key: "solution", Component: SlideSolution },
  { key: "architecture", Component: SlideArchitecture },
  { key: "comparison", Component: SlideComparison },
  { key: "cost", Component: SlideCost },
  { key: "timeline", Component: SlideTimeline },
  { key: "investment", Component: SlideInvestment },
  { key: "outcome", Component: SlideOutcome },
  { key: "cta", Component: SlideCTA, interactive: true },
];

/* ── Props ──────────────────────────────────────────────────── */

interface SlideDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ── Component ──────────────────────────────────────────────── */

export default function SlideDeckModal({ open, onOpenChange }: SlideDeckModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [isPortrait, setIsPortrait] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showExitFs, setShowExitFs] = useState(false);
  const [showFsTooltip, setShowFsTooltip] = useState(false);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const prevSlideRef = useRef(0);

  const totalSlides = SLIDES.length;
  const isInteractive = SLIDES[currentSlide]?.interactive;
  const prevSlideIdx = prevSlideRef.current;

  /* Track previous slide so it stays visible underneath during fade */
  useEffect(() => {
    const timer = setTimeout(() => {
      prevSlideRef.current = currentSlide;
    }, 350); // match transition duration
    return () => clearTimeout(timer);
  }, [currentSlide]);

  /* Detect touch device once */
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  /* Navigation */
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setCurrentSlide(index);
    },
    [totalSlides],
  );

  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);
  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);

  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  /* Fullscreen toggle (desktop only) */
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  /* Track fullscreen state — hide chrome in fullscreen */
  useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) {
        setShowTopBar(false);
        setShowGallery(false);
      } else {
        setShowTopBar(true);
        setShowGallery(true);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* Exit fullscreen when modal closes */
  useEffect(() => {
    if (!open && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [open]);

  /* Mobile orientation — show rotate prompt in portrait, slides in landscape */
  useEffect(() => {
    if (!open) return;
    if (!isTouchDevice) return;

    const mql = window.matchMedia("(orientation: portrait)");
    const check = (e: MediaQueryList | MediaQueryListEvent) => setIsPortrait(e.matches);
    check(mql);
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, [open, isTouchDevice]);

  /* Reset on open + show fullscreen tooltip (desktop only) */
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      if (!isTouchDevice) {
        setShowFsTooltip(true);
        const timer = setTimeout(() => setShowFsTooltip(false), 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [open, isTouchDevice]);

  /* Touch/swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
  };

  /* PDF export */
  const handleExport = async () => {
    if (!offscreenRef.current || exporting) return;
    setExporting(true);
    setExportProgress("Preparing...");
    // Yield a frame so the spinner + text render before heavy work starts
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    try {
      await generateSlidePdf(offscreenRef.current, (current, total) => {
        setExportProgress(`Slide ${current} of ${total}`);
      });
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };


  /* Fullscreen hover zones (desktop) */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isFullscreen) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      setShowExitFs(y < 60);
      setShowGallery(y > h - 80);
      setShowLeftArrow(x < 80 && currentSlide > 0);
      setShowRightArrow(x > w - 80 && currentSlide < totalSlides - 1);
    },
    [isFullscreen, currentSlide, totalSlides],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isFullscreen) return;
    setShowExitFs(false);
    setShowGallery(false);
    setShowLeftArrow(false);
    setShowRightArrow(false);
  }, [isFullscreen]);

  /* Mobile: hide top bar & gallery, show fullscreen slide + X button */
  const mobileSlideView = isTouchDevice && !isPortrait;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                />
              </Dialog.Overlay>

              {/* Content */}
              <Dialog.Content asChild onOpenAutoFocus={(e) => e.preventDefault()}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 z-[101] flex flex-col bg-black"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>Enterprise IBM i Hosting and Disaster Recovery Platform</Dialog.Title>
                  </VisuallyHidden.Root>

                  {/* ── Portrait prompt (mobile only) ── */}
                  {isTouchDevice && isPortrait && (
                    <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-[#020617] text-center px-8">
                      <Smartphone className="h-14 w-14 text-sky-400 mb-5" style={{ animation: "slide-deck-rotate 2s ease-in-out infinite" }} />
                      <p className="text-white text-xl font-semibold mb-2">Rotate Your Device</p>
                      <p className="text-slate-400 text-sm max-w-xs">Turn your phone to landscape to view the slide deck.</p>
                      <Dialog.Close asChild>
                        <button className="mt-8 px-5 py-2 rounded-xl bg-white/10 text-slate-400 text-sm font-medium border border-white/10 cursor-pointer">
                          Cancel
                        </button>
                      </Dialog.Close>
                    </div>
                  )}

                  {/* ── Top bar (hidden on mobile landscape & desktop fullscreen) ── */}
                  {!mobileSlideView && (
                    <div
                      className={`h-14 flex items-center justify-between px-4 bg-[#020617]/90 backdrop-blur-md border-b border-white/10 shrink-0 transition-all duration-300 ${
                        showTopBar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none absolute top-0 left-0 right-0 z-20"
                      }`}
                    >
                      <span className="text-white text-sm font-semibold truncate">
                        Enterprise IBM i Hosting and Disaster Recovery Platform
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Download — hidden on touch devices */}
                        {!isTouchDevice && (
                          <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors cursor-pointer"
                          >
                            {exporting ? (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "slide-deck-spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">
                              {exporting ? exportProgress : "Download Slide Deck"}
                            </span>
                          </button>
                        )}
                        {/* Fullscreen — desktop only */}
                        {!isTouchDevice && (
                          <div className="relative group">
                            <button
                              onClick={() => { toggleFullscreen(); setShowFsTooltip(false); }}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                            </button>
                            <div className={`absolute right-2 top-full mt-3 px-3 py-2 rounded-lg bg-[#1e293b] text-white text-xs font-medium whitespace-nowrap transition-opacity pointer-events-none shadow-xl border border-white/10 z-50 ${
                              showFsTooltip ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}>
                              <div className="absolute -top-[6px] right-3 w-3 h-3 bg-[#1e293b] border-l border-t border-white/10 rotate-45" />
                              <span className="relative z-10">{isFullscreen ? "Exit fullscreen" : "Click to enable fullscreen"}</span>
                            </div>
                          </div>
                        )}
                        <Dialog.Close asChild>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" aria-label="Close">
                            <X className="h-5 w-5" />
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                  )}

                  {/* ── Mobile landscape close button (top-right X) ── */}
                  {mobileSlideView && (
                    <Dialog.Close asChild>
                      <button
                        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  )}

                  {/* ── Desktop fullscreen exit button ── */}
                  {isFullscreen && !isTouchDevice && (
                    <div
                      className={`absolute top-4 right-4 z-30 transition-opacity duration-200 ${
                        showExitFs ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="relative group">
                        <button
                          onClick={toggleFullscreen}
                          className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer"
                          aria-label="Exit fullscreen"
                        >
                          <Minimize className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                          Exit fullscreen
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Slide viewport ── */}
                  <div
                    className={`flex-1 relative overflow-hidden ${
                      mobileSlideView || isFullscreen ? "" : "px-4 sm:px-16"
                    }`}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Static shared background — stays in place during slide transitions */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SlideRenderer>
                        <SlideBackground />
                      </SlideRenderer>
                    </div>

                    {/* Left arrow (hidden on mobile) */}
                    {currentSlide > 0 && !isTouchDevice && (
                      <button
                        onClick={prev}
                        className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-200 cursor-pointer ${
                          isFullscreen
                            ? showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                            : "opacity-100"
                        }`}
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                    {/* All slides pre-rendered — current fades in on top, previous stays visible underneath */}
                    {SLIDES.map((slide, i) => {
                      const isCurrent = i === currentSlide;
                      const isPrev = i === prevSlideIdx && i !== currentSlide;
                      const visible = isCurrent || isPrev;
                      return (
                        <div
                          key={slide.key}
                          className="absolute inset-0"
                          style={{
                            zIndex: isCurrent ? 2 : isPrev ? 1 : 0,
                            pointerEvents: isCurrent ? "auto" : "none",
                            visibility: visible ? "visible" : "hidden",
                          }}
                        >
                          {/* Only the incoming slide animates — prev stays static underneath */}
                          <motion.div
                            className="w-full h-full"
                            animate={{ opacity: isCurrent ? 1 : 0 }}
                            transition={isCurrent ? { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } : { duration: 0 }}
                            style={{ willChange: isCurrent ? "opacity" : undefined }}
                          >
                            <SlideRenderer><slide.Component active={isCurrent} /></SlideRenderer>
                            {!slide.interactive && (
                              <div className="absolute inset-0 z-10" style={{ userSelect: "none" }} />
                            )}
                          </motion.div>
                        </div>
                      );
                    })}

                    {/* Right arrow (hidden on mobile) */}
                    {currentSlide < totalSlides - 1 && !isTouchDevice && (
                      <button
                        onClick={next}
                        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-200 cursor-pointer ${
                          isFullscreen
                            ? showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                            : "opacity-100"
                        }`}
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}

                    {/* Slide counter */}
                    {!isFullscreen && (
                      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-slate-500 font-mono ${mobileSlideView ? "bottom-2 text-[10px]" : ""}`}>
                        {currentSlide + 1} / {totalSlides}
                      </div>
                    )}
                  </div>

                  {/* ── Thumbnail gallery (hidden on mobile landscape) ── */}
                  {!mobileSlideView && (
                    <div
                      className={`h-20 border-t border-white/10 bg-[#020617]/80 backdrop-blur-md flex items-center px-4 gap-3 overflow-x-auto shrink-0 transition-all duration-300 ${
                        isFullscreen
                          ? showGallery
                            ? "opacity-100 translate-y-0 absolute bottom-0 left-0 right-0 z-20"
                            : "opacity-0 translate-y-full pointer-events-none absolute bottom-0 left-0 right-0 z-20"
                          : "opacity-100 translate-y-0"
                      }`}
                    >
                      {SLIDES.map((slide, i) => (
                        <button
                          key={slide.key}
                          onClick={() => goTo(i)}
                          className={`shrink-0 rounded-md overflow-hidden transition-all cursor-pointer ${
                            i === currentSlide
                              ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-[#020617]"
                              : "opacity-60 hover:opacity-100"
                          }`}
                          style={{ width: 96, height: 54 }}
                          aria-label={`Go to slide ${i + 1}`}
                        >
                          <div className="pointer-events-none select-none" style={{ width: 96, height: 54, overflow: "hidden" }}>
                            <div
                              style={{
                                width: NATIVE_W,
                                height: NATIVE_H,
                                transform: "scale(0.1)",
                                transformOrigin: "top left",
                              }}
                            >
                              <div className="w-full h-full bg-[#020617] text-white overflow-hidden relative">
                                <SlideBackground />
                                <slide.Component active />
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── Offscreen render area for PDF capture ── */}
                  {!isTouchDevice && (
                    <div
                      ref={offscreenRef}
                      data-pdf-render
                      className="fixed"
                      style={{ left: -9999, top: -9999, width: NATIVE_W, opacity: 0, pointerEvents: "none" }}
                      aria-hidden
                    >
                      {SLIDES.map((slide) => (
                        <div
                          key={slide.key}
                          data-slide
                          style={{ width: NATIVE_W, height: NATIVE_H, overflow: "hidden", position: "relative" }}
                          className="bg-[#020617] text-white"
                        >
                          <SlideBackground />
                          <slide.Component active />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
