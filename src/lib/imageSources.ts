const SUPABASE_IMAGE_HOST = "yqmtzyisopzntfrotnlz.supabase.co";

/** Only send first-party assets and the configured media bucket through Next's optimizer. */
export function canOptimizeImageSource(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return new URL(src).hostname === SUPABASE_IMAGE_HOST;
  } catch {
    return false;
  }
}
