/**
 * Typed GA4 / GTM dataLayer helper.
 *
 * All product analytics flow through `pushEvent`, which pushes GA4-style events
 * onto `window.dataLayer` (consumed by Google Tag Manager or gtag.js). It is a
 * no-op on the server and when no tag container is present, so callers can fire
 * events unconditionally without guarding for SSR or unset analytics IDs.
 *
 * Event names follow the ICE convention: lowercase snake_case, ≤40 chars.
 */

type DataLayerParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Push a GA4 event onto `window.dataLayer`.
 *
 * - No-ops during SSR (no `window`).
 * - Lazily initializes `window.dataLayer` to an array.
 * - When `params` carries an `ecommerce` payload, first pushes
 *   `{ ecommerce: null }` to clear any prior ecommerce object (GA4 requirement).
 *
 * @param event  snake_case event name (≤40 chars, e.g. `contact_submitted`).
 * @param params optional event parameters.
 */
export function pushEvent(event: string, params?: DataLayerParams): void {
  if (typeof window === "undefined") return;

  window.dataLayer ||= [];

  // GA4 requires clearing the previous ecommerce object before pushing a new one.
  if (params && "ecommerce" in params) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push({ event, ...params });
}
