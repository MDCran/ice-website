/** Public SEO URLs must never point at a developer machine or contain credentials. */
export const PUBLIC_SITE_URL = "https://www.icesales.com";

export function publicUrl(value: unknown, base = PUBLIC_SITE_URL): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim(), base);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password ||
        host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
        !host.includes(".") || host.startsWith("[") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || !candidate.trim().startsWith("https://")) continue;
    const url = publicUrl(candidate);
    if (url) {
      const origin = new URL(url).origin;
      // sandbox.icesales.com and the apex domain redirect to the public www
      // host. Keep canonicals, sitemaps, and schema on the final destination.
      if (["sandbox.icesales.com", "icesales.com"].includes(new URL(origin).hostname.toLowerCase())) {
        return PUBLIC_SITE_URL;
      }
      return origin;
    }
  }
  return PUBLIC_SITE_URL;
}
