"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

export default function AccessPasswordGate({
  slug,
  documentTitle,
  recipientHint,
}: {
  slug: string;
  documentTitle: string;
  recipientHint?: string;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/access/${encodeURIComponent(slug)}/unlock`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        window.location.replace(`/access/${encodeURIComponent(slug)}`);
        return;
      }

      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(body?.error || "That access code was not accepted.");
    } catch {
      setError("We could not verify the access code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,0.15),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-7 shadow-2xl shadow-sky-950/40 backdrop-blur-xl sm:p-9">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
          Secure access
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {documentTitle || "Protected document"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter the access code supplied with your private link to continue.
        </p>
        {recipientHint && (
          <p className="mt-2 text-xs text-slate-500">Shared with {recipientHint}</p>
        )}

        <form onSubmit={unlock} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Access code
            </span>
            <span className="relative block">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                maxLength={512}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "access-password-error" : undefined}
                className="login-input w-full rounded-xl px-4 py-3 pr-12 text-base text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-sky-300"
                aria-label={showPassword ? "Hide access code" : "Show access code"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </span>
          </label>

          {error && (
            <p id="access-password-error" role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {loading ? "Verifying…" : "Unlock document"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-600">
          This private document is intended only for its authorized recipient.
        </p>
      </section>
    </main>
  );
}
