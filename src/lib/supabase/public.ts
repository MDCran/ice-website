import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public CMS reads.
 *
 * The cookie-bound server client inherits the visitor's auth role. Public
 * "published" RLS policies are scoped to `anon`, so an authenticated session
 * (e.g. admin browsing the marketing site) can fail those policies and return
 * empty/null CMS data — which then triggers hardcoded solution fallbacks.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
