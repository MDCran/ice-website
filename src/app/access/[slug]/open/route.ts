import { NextRequest, NextResponse } from "next/server";
import {
  accessChallengeCookieName,
  accessSessionCookieName,
} from "@/lib/access-pages/crypto";
import {
  accessCookieOptions,
  createChallengeValue,
  createSessionValue,
  findGrantByToken,
  getAccessPageBySlug,
  isAccessGrantUsable,
  isValidAccessSlug,
  recordAccessGrantView,
} from "@/lib/access-pages/server";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

function cleanAccessUrl(request: NextRequest, slug: string, invalid = false): URL {
  const url = new URL(`/access/${encodeURIComponent(slug)}`, request.url);
  if (invalid) url.searchParams.set("access", "invalid");
  return url;
}

function clearCookie(response: NextResponse, name: string, slug: string) {
  response.cookies.set(name, "", accessCookieOptions(slug, 0));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cleanSlug = slug.trim();
  const deny = () => {
    const response = NextResponse.redirect(cleanAccessUrl(request, cleanSlug, true), 303);
    Object.entries(PRIVATE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
    if (isValidAccessSlug(cleanSlug)) {
      clearCookie(response, accessSessionCookieName(cleanSlug), cleanSlug);
      clearCookie(response, accessChallengeCookieName(cleanSlug), cleanSlug);
    }
    return response;
  };

  if (!isValidAccessSlug(cleanSlug)) return deny();

  // `key` is canonical; `token` remains a compatibility alias for generated links.
  const rawKey = request.nextUrl.searchParams.get("key") || request.nextUrl.searchParams.get("token") || "";
  if (!rawKey || rawKey.length > 512) return deny();

  try {
    const page = await getAccessPageBySlug(cleanSlug);
    if (!page) return deny();
    const grant = findGrantByToken(page, rawKey);
    if (!grant || !isAccessGrantUsable(page, grant, "new-session")) return deny();

    const response = NextResponse.redirect(cleanAccessUrl(request, cleanSlug), 303);
    Object.entries(PRIVATE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));

    if (grant.password_hash) {
      const challenge = createChallengeValue(page, grant);
      response.cookies.set(
        accessChallengeCookieName(cleanSlug),
        challenge.value,
        accessCookieOptions(cleanSlug, challenge.maxAge),
      );
      clearCookie(response, accessSessionCookieName(cleanSlug), cleanSlug);
      return response;
    }

    const recorded = await recordAccessGrantView(page.id, grant.id);
    if (!recorded) return deny();
    const session = createSessionValue(page, recorded.grant, recorded.viewSequence);
    response.cookies.set(
      accessSessionCookieName(cleanSlug),
      session.value,
      accessCookieOptions(cleanSlug, session.maxAge),
    );
    clearCookie(response, accessChallengeCookieName(cleanSlug), cleanSlug);
    return response;
  } catch {
    return deny();
  }
}
