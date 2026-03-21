"use client";

/* eslint-disable @next/next/no-img-element */

/** Shared background used by all slides — rendered once in the viewport so it stays static during transitions */
export default function SlideBackground() {
  return (
    <>
      <img src="/videos/data_center_cover.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/95 via-[#020617]/90 to-[#061224]/88" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(4,155,251,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(20,184,166,0.07) 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
      <div className="absolute top-12 right-16 w-48 h-48 rounded-full bg-sky-500/8 blur-[80px]" />
      <div className="absolute bottom-16 left-12 w-40 h-40 rounded-full bg-teal-500/6 blur-[60px]" />
    </>
  );
}
