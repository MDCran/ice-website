import { AlertTriangle, Link2, LockKeyhole } from "lucide-react";

export default function AccessRequired({ invalid = false }: { invalid?: boolean }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center shadow-2xl shadow-sky-950/40 backdrop-blur-xl sm:p-10">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${invalid ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-sky-400/20 bg-sky-400/10 text-sky-300"}`}>
          {invalid ? (
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          ) : (
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          )}
        </div>
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
          Protected by ICE
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {invalid ? "This access link is unavailable" : "A private link is required"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {invalid
            ? "The link may be expired, revoked, or already used the maximum number of times. Ask your ICE contact for a new link."
            : "Open the complete private link supplied by your ICE contact to view this document."}
        </p>
        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
          <Link2 className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
          Access links are recipient-specific
        </div>
      </section>
    </main>
  );
}
