/**
 * Server-safe booking URL helpers (no "use client").
 */

export function bookingUrlFromSettings(settings?: Record<string, unknown> | null): string | null {
  const booking = settings?.booking;
  if (!booking || typeof booking !== "object") {
    const env = process.env.NEXT_PUBLIC_CALENDLY_URL;
    return env?.trim() || null;
  }
  const record = booking as Record<string, unknown>;
  const raw = record.calendly_url ?? record.url;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const env = process.env.NEXT_PUBLIC_CALENDLY_URL;
  return env?.trim() || null;
}
